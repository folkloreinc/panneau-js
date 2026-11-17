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
import { MediaLibrary } from './MediaLibrary';
import type { MediaLibraryProps } from './types';

const fields: Field[] = [
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'alt', type: 'text', label: 'Alt text' },
];

function show(props: Partial<MediaLibraryProps> = {}) {
    const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia, fields });
    const view = renderInRoot(
        <MediaLibrary sources={[media]} uploadSource={instantUploadSource} {...props} />,
    );
    return { ...view, media };
}

const library = (name = 'Media') => screen.getByRole('region', { name });
const card = async (name: string) => within(library()).findByRole('row', { name });

describe('MediaLibrary', () => {
    it('shows the library in a page: no dialog, no count, no button to pick', async () => {
        show();

        expect(await card('autumn forest')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(within(library()).queryByRole('button', { name: 'Select' })).toBeNull();
        expect(within(library()).queryByText('No media selected')).toBeNull();
    });

    it('draws the cards of its skeleton while the library loads', () => {
        show({
            sources: [
                createMemorySource({ id: 'media', label: 'Media', items: [], list: 'loading' }),
            ],
        });

        expect(within(library()).getByText('Loading media…')).toHaveAttribute('role', 'status');
    });

    it('searches and filters by type through its source', async () => {
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        const list = vi.spyOn(media, 'list');
        show({ sources: [media] });

        await card('autumn forest');
        await userEvent.type(
            within(library()).getByRole('searchbox', { name: 'Search media' }),
            'lake',
        );
        await waitFor(() =>
            expect(
                within(library())
                    .getAllByRole('row')
                    .map((row) => row.textContent),
            ).toEqual([expect.stringContaining('mountain lake')]),
        );
        expect(list).toHaveBeenLastCalledWith(
            expect.objectContaining({ q: 'lake' }),
            expect.anything(),
        );
    });

    it('opens the details of the media chosen, which edit its fields', async () => {
        const { media } = show();
        const update = vi.spyOn(media, 'update');

        await userEvent.click(await card('harbour at dawn'));
        const details = screen.getByRole('complementary', { name: 'Details of harbour at dawn' });
        const alt = within(details).getByRole('textbox', { name: 'Alt text' });
        await userEvent.clear(alt);
        await userEvent.type(alt, 'Boats');
        await userEvent.click(within(details).getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(update).toHaveBeenCalledWith(
                'med_01',
                expect.objectContaining({ alt: 'Boats' }),
            ),
        );
    });

    it('makes media of uploads in the library shown', async () => {
        const { container, media } = show();

        await userEvent.click(within(library()).getByRole('tab', { name: 'Upload' }));
        await userEvent.upload(
            fileInput(container.ownerDocument.body as HTMLElement),
            file('poster.jpg', 'image/jpeg'),
        );

        expect(await card('poster')).toBeInTheDocument();
        expect(media.media[0]?.label).toBe('poster');
    });

    it('links the details to the page of the media in the product', async () => {
        const items = libraryMedia.map((item) => ({ ...item, href: `/media/${item.id}` }));
        show({ sources: [createMemorySource({ id: 'media', label: 'Media', items })] });

        await userEvent.click(await card('harbour at dawn'));
        const details = screen.getByRole('complementary', { name: 'Details of harbour at dawn' });
        expect(within(details).getByRole('link', { name: 'Open the media page' })).toHaveAttribute(
            'href',
            '/media/med_01',
        );
    });

    it('switches between its libraries', async () => {
        const documents = createMemorySource({
            id: 'documents',
            label: 'Documents',
            items: documentMedia,
        });
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        show({ sources: [media, documents], 'aria-label': 'Our library' });

        const region = screen.getByRole('region', { name: 'Our library' });
        expect(
            await within(region).findByRole('row', { name: 'autumn forest' }),
        ).toBeInTheDocument();
        await userEvent.click(within(region).getByRole('radio', { name: 'Documents' }));
        expect(
            await within(region).findByRole('row', { name: 'annual report 2025' }),
        ).toBeInTheDocument();
    });
});
