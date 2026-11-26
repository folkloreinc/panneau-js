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
    it('draws the cards of its skeleton while the library loads', () => {
        open({
            sources: [
                createMemorySource({ id: 'media', label: 'Media', items: [], list: 'loading' }),
            ],
        });

        expect(within(dialog()).getByText('Loading media…')).toHaveAttribute('role', 'status');
        const region = dialog().querySelector('[aria-busy="true"]');
        expect(region?.querySelectorAll('.panneau-skeleton[aria-hidden="true"]')).toHaveLength(36);
    });

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

    it('selects with the keyboard, and shows the selection under the image, not over it', async () => {
        open({ multiple: true });

        const autumn = await card('autumn forest');
        autumn.focus();
        await userEvent.keyboard(' ');
        expect(autumn).toHaveAttribute('aria-selected', 'true');
        const image = autumn.querySelector('img');
        // The check is drawn next to the name, and nothing is drawn over the image.
        expect(image?.parentElement?.querySelector('svg')).toBeNull();
        expect(
            within(autumn).getByText('autumn forest').parentElement?.querySelector('svg'),
        ).not.toBeNull();
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

    it('starts filtered on the type the opener accepts, which the user can change', async () => {
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        const list = vi.spyOn(media, 'list');
        open({ sources: [media], accept: ['application/pdf'] });

        await card('press kit');
        expect(list).toHaveBeenLastCalledWith(
            { filter: { type: 'document' }, sort: '-createdAt' },
            expect.anything(),
        );
        expect(within(dialog()).queryByRole('row', { name: 'autumn forest' })).toBeNull();

        await userEvent.click(within(dialog()).getByRole('button', { name: /Type/ }));
        await userEvent.click(screen.getByRole('option', { name: 'All types' }));
        expect(await card('autumn forest')).toHaveAttribute('aria-disabled', 'true');
    });

    it('greys out what the opener does not accept, and a media whose processing failed', async () => {
        open({ accept: ['image/*'], maxSize: 5 * 1024 * 1024 });

        await userEvent.click(await within(dialog()).findByRole('button', { name: /Type/ }));
        await userEvent.click(screen.getByRole('option', { name: 'All types' }));
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

    it('keeps the changes when they fail to save, says why, and lets the user try again', async () => {
        const { media } = open();
        const update = vi
            .spyOn(media, 'update')
            .mockRejectedValueOnce(new Error('The server is down.'));

        await userEvent.click(await card('harbour at dawn'));
        const details = screen.getByRole('complementary', { name: 'Details of harbour at dawn' });
        const alt = within(details).getByRole('textbox', { name: 'Alt text' });
        await userEvent.clear(alt);
        await userEvent.type(alt, 'Boats');
        const save = within(details).getByRole('button', { name: 'Save' });
        await userEvent.click(save);

        expect(await within(details).findByRole('alert')).toHaveTextContent(
            'The changes couldn’t be saved: The server is down.',
        );
        // No longer saving: the field and the button work again, with the changes kept.
        expect(alt).toBeEnabled();
        expect(alt).toHaveValue('Boats');
        expect(save).toBeEnabled();

        await userEvent.click(save);
        await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(within(details).queryByRole('alert')).not.toBeInTheDocument());
        expect(save).toBeDisabled();
    });

    it('asks before closing with changed details: "Stay" keeps them', async () => {
        const { onOpenChange } = open();
        await userEvent.click(await card('harbour at dawn'));
        const details = screen.getByRole('complementary', { name: 'Details of harbour at dawn' });
        const alt = within(details).getByRole('textbox', { name: 'Alt text' });
        await userEvent.type(alt, '!');

        await userEvent.click(within(dialog()).getByRole('button', { name: 'Cancel' }));
        const ask = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        expect(ask).toHaveTextContent('Your changes will be lost.');
        await userEvent.click(within(ask).getByRole('button', { name: 'Stay' }));
        await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(alt).toHaveValue('Fishing boats in a harbour at dawn!');
        // Focus is back in the picker: Escape reaches it. React Aria restores it to Cancel, or, on a
        // busy runner, to the picker itself (#457): the element it lands on is not the point.
        await waitFor(() =>
            expect(dialog()).toContainElement(document.activeElement as HTMLElement),
        );

        await userEvent.keyboard('{Escape}');
        const again = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        await userEvent.click(within(again).getByRole('button', { name: 'Leave' }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes without asking when the details are unchanged', async () => {
        const { onOpenChange } = open();
        await userEvent.click(await card('harbour at dawn'));
        await userEvent.click(within(dialog()).getByRole('button', { name: 'Cancel' }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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

    it('searches once the user stops typing, and at once on Enter', async () => {
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        const list = vi.spyOn(media, 'list');
        open({ sources: [media] });
        await card('autumn forest');
        const searches = () =>
            list.mock.calls.map(([query]) => query.q).filter((q) => q !== undefined);
        const search = within(dialog()).getByRole('searchbox', { name: 'Search media' });

        await userEvent.type(search, 'lake');
        expect(searches()).toEqual([]);
        await waitFor(() => expect(searches()).toEqual(['lake']));

        await userEvent.clear(search);
        await userEvent.type(search, 'forest{Enter}');
        expect(searches()).toEqual(['lake', 'forest']);
        expect(await card('autumn forest')).toBeInTheDocument();
        // The pause after Enter searches nothing more.
        await new Promise((done) => setTimeout(done, 350));
        expect(searches()).toEqual(['lake', 'forest']);
    });

    it('shows a media just uploaded first in its library, whatever the sort, until the next search', async () => {
        const media = createMemorySource({
            id: 'media',
            label: 'Media',
            items: libraryMedia,
            perPage: 5,
        });
        const { container } = open({ sources: [media], sort: 'name', multiple: true });
        await card('autumn forest');

        await userEvent.click(within(dialog()).getByRole('tab', { name: 'Upload' }));
        await userEvent.upload(
            fileInput(container.ownerDocument.body as HTMLElement),
            file('zebra.jpg', 'image/jpeg'),
        );
        await card('zebra');
        await userEvent.click(within(dialog()).getByRole('tab', { name: 'Library' }));

        const names = () =>
            within(dialog())
                .getAllByRole('row')
                .map((row) => row.getAttribute('aria-label') ?? row.textContent);
        await waitFor(() => expect(names()[0]).toContain('zebra'));
        expect(within(dialog()).getByText('6 of 13 media')).toBeInTheDocument();
        // Once in the pages too, at its place by name: it is shown once.
        for (let page = 0; page < 2; page += 1) {
            await userEvent.click(within(dialog()).getByRole('button', { name: 'Load more' }));
        }
        await waitFor(() => expect(names()).toHaveLength(13));
        expect(names().filter((name) => name.includes('zebra'))).toHaveLength(1);

        await userEvent.type(
            within(dialog()).getByRole('searchbox', { name: 'Search media' }),
            'harbour{Enter}',
        );
        await waitFor(() => expect(names()).toEqual([expect.stringContaining('harbour')]));
    });
});
