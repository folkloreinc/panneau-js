import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import {
    createMemorySource,
    documentMedia,
    instantUploadSource,
    libraryMedia,
} from '../__fixtures__/mediaSources';
import { file, fileInput, renderInRoot } from '../__fixtures__/render';
import { MediaPicker } from './MediaPicker';
import type { MediaPickerProps } from './types';

const fields: Field[] = [
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'alt', type: 'text', label: 'Alt text' },
];

function open(props: Partial<MediaPickerProps> = {}) {
    const onSelect = vi.fn<MediaPickerProps['onSelect']>();
    const onOpenChange = vi.fn<MediaPickerProps['onOpenChange']>();
    const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia, fields });
    const view = renderInRoot(
        <MediaPicker
            isOpen
            sources={[media]}
            onSelect={onSelect}
            onOpenChange={onOpenChange}
            uploadSource={instantUploadSource}
            {...props}
        />,
    );
    return { ...view, onSelect, onOpenChange, media };
}

const dialog = () => screen.getByRole('dialog', { name: /media/i });
const card = async (name: string) => within(dialog()).findByRole('row', { name });

describe('MediaPicker', () => {
    it('lists the media of its source, and returns the one selected with its library', async () => {
        const { onSelect, onOpenChange } = open();

        expect(within(dialog()).getByRole('button', { name: 'Select' })).toBeDisabled();
        await userEvent.click(await card('autumn forest'));
        expect(within(dialog()).getByText('Selected: autumn forest')).toBeInTheDocument();
        await userEvent.click(within(dialog()).getByRole('button', { name: 'Select' }));

        expect(onSelect).toHaveBeenCalledWith([
            expect.objectContaining({ id: 'med_03', resource: 'media', label: 'autumn forest' }),
        ]);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('selects media across libraries, even with the same id in both', async () => {
        const documents = createMemorySource({
            id: 'documents',
            label: 'Documents',
            items: documentMedia,
        });
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        const { onSelect } = open({
            sources: [media, documents],
            multiple: true,
            confirmLabel: (count) => `Use ${String(count)}`,
        });

        await userEvent.click(await card('harbour at dawn'));
        await userEvent.click(within(dialog()).getByRole('radio', { name: 'Documents' }));
        await userEvent.click(await card('annual report 2025'));

        expect(within(dialog()).getByText('2 selected in 2 libraries')).toBeInTheDocument();
        await userEvent.click(within(dialog()).getByRole('button', { name: 'Use 2' }));
        expect(onSelect).toHaveBeenCalledWith([
            expect.objectContaining({ id: 'med_01', resource: 'media' }),
            expect.objectContaining({ id: 'med_01', resource: 'documents' }),
        ]);
    });

    it('greys out what the opener does not accept, and a media whose processing failed', async () => {
        open({ accept: ['image/*'], maxSize: 5 * 1024 * 1024 });

        expect(await card('press kit')).toHaveAttribute('aria-disabled', 'true');
        expect(within(await card('press kit')).getByText('PDF not accepted here')).toBeVisible();
        expect(await card('mountain lake')).toHaveAttribute('aria-disabled', 'true');
        expect(within(await card('mountain lake')).getByText('Over the 5 MB limit')).toBeVisible();
        expect(await card('broken scan')).toHaveAttribute('aria-disabled', 'true');
        // Being processed doesn't stop a media from being picked.
        expect(await card('workshop photos')).not.toHaveAttribute('aria-disabled');
        expect(
            within(dialog()).getByText('Can be selected here: Images, up to 5 MB.'),
        ).toBeInTheDocument();
    });

    it('searches, filters by type and sorts through its source', async () => {
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        const list = vi.spyOn(media, 'list');
        open({ sources: [media], filter: { tags: 'nature' } });

        await card('autumn forest');
        expect(list).toHaveBeenLastCalledWith(
            { filter: { tags: 'nature' }, sort: '-createdAt' },
            expect.anything(),
        );
        expect(within(dialog()).queryByRole('row', { name: 'press kit' })).not.toBeInTheDocument();

        await userEvent.type(
            within(dialog()).getByRole('searchbox', { name: 'Search media' }),
            'lake',
        );
        await waitFor(() =>
            expect(
                within(dialog())
                    .getAllByRole('row')
                    .map((row) => row.textContent),
            ).toEqual([expect.stringContaining('mountain lake')]),
        );
        expect(list).toHaveBeenLastCalledWith(
            { q: 'lake', filter: { tags: 'nature' }, sort: '-createdAt' },
            expect.anything(),
        );
    });

    it('loads the next page', async () => {
        const media = createMemorySource({
            id: 'media',
            label: 'Media',
            items: libraryMedia,
            perPage: 5,
        });
        open({ sources: [media] });

        await card('harbour at dawn');
        expect(within(dialog()).getAllByRole('row')).toHaveLength(5);
        expect(within(dialog()).getByText('5 of 12 media')).toBeInTheDocument();
        await userEvent.click(within(dialog()).getByRole('button', { name: 'Load more' }));
        await waitFor(() => expect(within(dialog()).getAllByRole('row')).toHaveLength(10));
    });

    it('makes media of uploads in the library shown, and selects them', async () => {
        const { container, onSelect, media } = open({ multiple: true });

        await userEvent.click(within(dialog()).getByRole('tab', { name: 'Upload' }));
        await userEvent.upload(
            fileInput(container.ownerDocument.body as HTMLElement),
            file('poster.jpg', 'image/jpeg'),
        );

        expect(await card('poster')).toHaveAttribute('aria-selected', 'true');
        expect(media.media[0]?.label).toBe('poster');
        await userEvent.click(within(dialog()).getByRole('button', { name: 'Select' }));
        expect(onSelect).toHaveBeenCalledWith([
            expect.objectContaining({ id: 'new_1', resource: 'media' }),
        ]);
    });

    it('keeps the media selected in the library when uploads are selected too', async () => {
        const { container, onSelect } = open({ multiple: true });

        await userEvent.click(await card('autumn forest'));
        await userEvent.click(within(dialog()).getByRole('tab', { name: 'Upload' }));
        await userEvent.upload(
            fileInput(container.ownerDocument.body as HTMLElement),
            file('poster.jpg', 'image/jpeg'),
        );
        // Unselecting and selecting the upload again changes nothing else.
        await userEvent.click(await card('poster'));
        await userEvent.click(await card('poster'));

        await userEvent.click(within(dialog()).getByRole('button', { name: 'Select' }));
        expect(onSelect).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ id: 'med_03' }),
                expect.objectContaining({ id: 'new_1' }),
            ]),
        );
        expect(onSelect.mock.calls[0]?.[0]).toHaveLength(2);
    });

    it('confirms as soon as a single media is uploaded, with confirmOnUpload', async () => {
        const { container, onSelect, onOpenChange } = open({ confirmOnUpload: true });

        await userEvent.click(within(dialog()).getByRole('tab', { name: 'Upload' }));
        await userEvent.upload(
            fileInput(container.ownerDocument.body as HTMLElement),
            file('poster.jpg', 'image/jpeg'),
        );

        await waitFor(() =>
            expect(onSelect).toHaveBeenCalledWith([
                expect.objectContaining({ id: 'new_1', resource: 'media' }),
            ]),
        );
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('edits the fields of the media in its details, and asks before losing changes', async () => {
        const { media } = open();
        const update = vi.spyOn(media, 'update');

        await userEvent.click(await card('harbour at dawn'));
        const details = screen.getByRole('complementary', { name: 'Details of harbour at dawn' });
        const alt = within(details).getByRole('textbox', { name: 'Alt text' });
        expect(alt).toHaveValue('Fishing boats in a harbour at dawn');
        await userEvent.clear(alt);
        await userEvent.type(alt, 'Boats');

        await userEvent.click(await card('autumn forest'));
        const ask = await screen.findByRole('alertdialog', {
            name: 'Save the changes to harbour at dawn?',
        });
        await userEvent.click(within(ask).getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(update).toHaveBeenCalledWith(
                'med_01',
                expect.objectContaining({ alt: 'Boats' }),
            ),
        );
        expect(
            await screen.findByRole('complementary', { name: 'Details of autumn forest' }),
        ).toBeInTheDocument();
    });

    it('marks the media of the value, and keeps a single pick of it disabled', async () => {
        open({ value: [{ id: 'med_03', resource: 'media' }] });

        await userEvent.click(await card('autumn forest'));

        // A badge on the thumbnail, and a line under the name on phones.
        expect(within(await card('autumn forest')).getAllByText('Current')).toHaveLength(2);
        expect(within(dialog()).getByRole('button', { name: 'Select' })).toBeDisabled();
        await userEvent.click(await card('team portrait'));
        expect(within(dialog()).getByRole('button', { name: 'Select' })).toBeEnabled();
    });

    it('disables the Upload tab when the user cannot add media, and says so', async () => {
        const media = createMemorySource({
            id: 'media',
            label: 'Media',
            items: [],
            canCreate: false,
        });
        open({ sources: [media] });

        expect(await within(dialog()).findByText('Media has no media yet')).toBeInTheDocument();
        expect(within(dialog()).getByText('You can’t add media to it.')).toBeInTheDocument();
        expect(within(dialog()).getByRole('tab', { name: 'Upload' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });

    it('says when the media could not be loaded', async () => {
        const media = createMemorySource({
            id: 'media',
            label: 'Media',
            items: [],
            list: 'error',
        });
        open({ sources: [media] });

        expect(await screen.findByRole('alert')).toHaveTextContent('The media couldn’t be loaded');
    });

    it('opens again where the user left it, with a state key', async () => {
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        const first = open({ sources: [media], stateKey: 'cover' });
        await card('harbour at dawn');
        await userEvent.type(
            within(dialog()).getByRole('searchbox', { name: 'Search media' }),
            'forest',
        );
        await waitFor(() => expect(within(dialog()).getAllByRole('row')).toHaveLength(1));
        first.unmount();

        open({ sources: [media], stateKey: 'cover' });
        expect(within(dialog()).getByRole('searchbox', { name: 'Search media' })).toHaveValue(
            'forest',
        );
        expect(await card('autumn forest')).toBeInTheDocument();
    });
});
