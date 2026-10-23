import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider } from '@panneau/core';
import type { DataAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { FieldsProvider, type UploadSource, type UploadedFile } from '@panneau/fields';
import type { Definition, Item, MediaInfo, MediaReference } from '@panneau/protocol';

import { type MediaAdapter, MediaField, MediaFieldEntry } from './MediaField';
import { createMemorySource, libraryMedia } from './__fixtures__/mediaSources';
import { Controlled, file, fileInput, renderInRoot } from './__fixtures__/render';
import { mediaPlugin } from './plugin';

const NO_ITEMS: never[] = [];

/** A source that uploads each file at once, as `upl_1`, `upl_2`… */
const instantSource: UploadSource = {
    createUploader({ onUploaded }: { onUploaded: (file: UploadedFile) => void }) {
        let next = 1;
        return {
            getItems: () => NO_ITEMS,
            subscribe: () => () => undefined,
            add(files) {
                for (const added of files) {
                    onUploaded({
                        upload: `upl_${String(next++)}`,
                        name: added.name,
                        mime: added.type,
                        size: added.size,
                    });
                }
            },
            pause: () => undefined,
            resume: () => undefined,
            cancel: () => undefined,
            retry: () => undefined,
            destroy: () => undefined,
        };
    },
};

/** A media item of the library, as `get()` and `create()` give it. */
const item = (media: Partial<MediaInfo> = {}, values: Record<string, unknown> = {}): Item => ({
    id: 'med_1',
    version: '1',
    abilities: {},
    name: 'clip.mp4',
    media: {
        type: 'video',
        mime: 'video/mp4',
        size: 2048,
        url: 'https://files.test/clip.mp4',
        thumbnailUrl: null,
        ...media,
    },
    ...values,
});

/** The reference a field value holds. */
const reference = (
    media: Partial<MediaInfo> = {},
    overrides: Partial<MediaReference> = {},
): MediaReference => ({
    id: 'med_1',
    label: 'clip.mp4',
    media: { type: 'video', size: 2048, thumbnailUrl: null, ...media },
    ...overrides,
});

const library = {
    resources: [
        {
            id: 'media',
            kind: 'media',
            label: { singular: 'media', plural: 'media' },
            itemTitle: 'title',
            fields: [
                { name: 'file', type: 'file' },
                { name: 'title', type: 'text' },
            ],
        },
    ],
} as unknown as Definition;

describe('MediaField', () => {
    it('makes a media of a chosen file, and reads it again until it is ready', async () => {
        const get = vi
            .fn<MediaAdapter['get']>()
            .mockResolvedValueOnce(item({ status: 'processing' }))
            .mockResolvedValue(
                item({ status: 'ready', thumbnailUrl: 'https://files.test/poster.jpg' }),
            );
        const adapter: MediaAdapter = {
            create: vi.fn<MediaAdapter['create']>().mockResolvedValue(item({ status: 'pending' })),
            get,
        };
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <Controlled<MediaReference | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <MediaField
                        label="Video"
                        resource="media"
                        adapter={adapter}
                        refreshInterval={10}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );

        const chosen = file('clip.mp4', 'video/mp4');
        await userEvent.upload(fileInput(container), chosen);

        expect(adapter.create).toHaveBeenCalledWith('media', { file: chosen });
        expect(await screen.findByText('Waiting')).toBeInTheDocument();
        expect(await screen.findByText('Processing')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Processing')).not.toBeInTheDocument());
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                id: 'med_1',
                label: 'clip.mp4',
                media: expect.objectContaining({ status: 'ready' }),
            }),
        );
        expect(get).toHaveBeenCalledWith('media', 'med_1', expect.anything());
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'https://files.test/poster.jpg',
        );
    });

    it('shows why a media could not be made', async () => {
        const adapter: MediaAdapter = {
            create: vi.fn<MediaAdapter['create']>().mockRejectedValue(new Error('Too large.')),
            get: vi.fn<MediaAdapter['get']>(),
        };
        const { container } = renderInRoot(
            <MediaField
                label="Image"
                resource="media"
                adapter={adapter}
                value={null}
                onChange={vi.fn()}
            />,
        );

        await userEvent.upload(fileInput(container), file('photo.jpg', 'image/jpeg'));

        expect(await screen.findByText('Failed: photo.jpg: Too large.')).toBeInTheDocument();
    });

    it('removes a media from a multiple value', async () => {
        const onChange = vi.fn();
        const adapter: MediaAdapter = {
            create: vi.fn<MediaAdapter['create']>(),
            get: vi.fn<MediaAdapter['get']>(),
        };
        renderInRoot(
            <MediaField
                label="Gallery"
                resource="media"
                multiple
                adapter={adapter}
                value={[
                    reference(),
                    reference({ type: 'image' }, { id: 'med_2', label: 'photo.jpg' }),
                ]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Remove clip.mp4' }));

        expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'med_2' })]);
    });

    it('removes only the media of its library when two libraries have the same id', async () => {
        const onChange = vi.fn();
        renderInRoot(
            <MediaField
                label="Files"
                resource="media"
                multiple
                adapter={{ create: vi.fn(), get: vi.fn() }}
                value={[
                    reference({}, { resource: 'media', label: 'clip.mp4' }),
                    reference({}, { resource: 'documents', label: 'notes.pdf' }),
                ]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Remove clip.mp4' }));

        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({ id: 'med_1', resource: 'documents' }),
        ]);
    });

    it('is read-only without an adapter, and says so', () => {
        renderInRoot(
            <MediaField
                label="Video"
                resource="media"
                adapter={null}
                value={reference({ status: 'failed' })}
            />,
        );

        expect(screen.getByText('Processing failed')).toBeInTheDocument();
        expect(screen.getByText(/Files can’t be uploaded here./)).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('makes a media of an upload, with the adapter and the upload source of its providers', async () => {
        const create = vi
            .fn<MediaAdapter['create']>()
            .mockResolvedValue(item({ type: 'image' }, { title: 'Photo' }));
        const adapter = { create, get: vi.fn() } as unknown as DataAdapter;
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <PanneauProvider definition={library}>
                <DataAdapterProvider adapter={adapter}>
                    <FieldsProvider uploadSource={instantSource}>
                        <MediaFieldEntry
                            field={{
                                name: 'gallery',
                                type: 'media',
                                label: 'Gallery',
                                multiple: true,
                                rules: [{ rule: 'accept', value: ['image/*'] }],
                            }}
                            path="gallery"
                            value={null}
                            onChange={onChange}
                        />
                    </FieldsProvider>
                </DataAdapterProvider>
            </PanneauProvider>,
        );

        expect(fileInput(container)).toHaveAttribute('accept', 'image/*');
        await userEvent.upload(fileInput(container), file('photo.jpg', 'image/jpeg'));

        expect(create).toHaveBeenCalledWith('media', { file: { upload: 'upl_1' } });
        await waitFor(() =>
            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ id: 'med_1', label: 'Photo' }),
            ]),
        );
    });

    it('reads each media in its own library: ids are unique only within one', async () => {
        const get = vi
            .fn<MediaAdapter['get']>()
            .mockImplementation((resource, id) =>
                Promise.resolve(item({ status: 'ready' }, { id, title: `${resource}/${id}` })),
            );
        const adapter: MediaAdapter = { create: vi.fn<MediaAdapter['create']>(), get };
        const onChange = vi.fn();
        renderInRoot(
            <MediaField
                label="Files"
                resource="documents"
                itemTitle="title"
                multiple
                adapter={adapter}
                refreshInterval={10}
                value={[
                    reference({ status: 'processing' }, { resource: 'media' }),
                    reference({ status: 'processing' }, { resource: 'documents' }),
                ]}
                onChange={onChange}
            />,
        );

        await waitFor(() =>
            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ resource: 'media', label: 'media/med_1' }),
                expect.objectContaining({ resource: 'documents', label: 'documents/med_1' }),
            ]),
        );
        expect(get).toHaveBeenCalledWith('media', 'med_1', expect.anything());
        expect(get).toHaveBeenCalledWith('documents', 'med_1', expect.anything());
    });

    it('uploads to the first library it allows, and references the media with its library', async () => {
        const create = vi.fn<MediaAdapter['create']>().mockResolvedValue(item());
        const adapter = { create, get: vi.fn() } as unknown as DataAdapter;
        const definition = {
            resources: [...library.resources, { ...library.resources[0], id: 'documents' }],
        } as unknown as Definition;
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <PanneauProvider definition={definition}>
                <DataAdapterProvider adapter={adapter}>
                    <MediaFieldEntry
                        field={{
                            name: 'files',
                            type: 'media',
                            label: 'Files',
                            multiple: true,
                            resource: ['documents', 'media'],
                        }}
                        path="files"
                        value={null}
                        onChange={onChange}
                    />
                </DataAdapterProvider>
            </PanneauProvider>,
        );

        const chosen = file('notes.pdf', 'application/pdf');
        await userEvent.upload(fileInput(container), chosen);

        expect(create).toHaveBeenCalledWith('documents', { file: chosen });
        await waitFor(() =>
            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ id: 'med_1', resource: 'documents' }),
            ]),
        );
    });

    it('opens the picker on its sources, and replaces its media with the one picked', async () => {
        const onChange = vi.fn();
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        renderInRoot(
            <MediaField
                label="Cover"
                resource="media"
                adapter={{ create: vi.fn(), get: vi.fn() }}
                sources={[media]}
                value={reference({}, { id: 'med_03', resource: 'media', label: 'autumn forest' })}
                onChange={onChange}
            />,
        );

        expect(screen.getByRole('button', { name: 'Upload a file' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Choose media' }));
        const dialog = screen.getByRole('dialog', { name: 'Choose media' });
        // The media of the value is marked as current.
        expect(
            within(await within(dialog).findByRole('row', { name: 'autumn forest' })).getAllByText(
                'Current',
            ),
        ).not.toHaveLength(0);
        await userEvent.click(within(dialog).getByRole('row', { name: 'team portrait' }));
        await userEvent.click(within(dialog).getByRole('button', { name: 'Select' }));

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'med_02', resource: 'media', label: 'team portrait' }),
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('adds the media picked to a multiple value, each once', async () => {
        const onChange = vi.fn();
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        renderInRoot(
            <MediaField
                label="Gallery"
                resource="media"
                multiple
                adapter={null}
                sources={[media]}
                value={[reference({}, { id: 'med_03', label: 'autumn forest' })]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
        const dialog = screen.getByRole('dialog', { name: 'Add media' });
        await userEvent.click(await within(dialog).findByRole('row', { name: 'autumn forest' }));
        await userEvent.click(within(dialog).getByRole('row', { name: 'team portrait' }));
        await userEvent.click(within(dialog).getByRole('button', { name: 'Select' }));

        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({ id: 'med_03', label: 'autumn forest' }),
            expect.objectContaining({ id: 'med_02', resource: 'media' }),
        ]);
    });

    it('can neither pick nor upload when it is read-only', () => {
        const media = createMemorySource({ id: 'media', label: 'Media', items: libraryMedia });
        renderInRoot(
            <MediaField
                label="Cover"
                resource="media"
                readOnly
                adapter={{ create: vi.fn(), get: vi.fn() }}
                sources={[media]}
                value={reference()}
            />,
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('opens the picker on the libraries the field allows, through the adapter', async () => {
        const list = vi.fn<DataAdapter['list']>().mockImplementation((resource) =>
            Promise.resolve({
                data: [item({ type: 'image' }, { id: `${resource}_1`, title: `${resource} one` })],
                meta: { page: 1, perPage: 24, total: 1, lastPage: 1 },
            } as unknown as Awaited<ReturnType<DataAdapter['list']>>),
        );
        const adapter = { list, create: vi.fn(), get: vi.fn() } as unknown as DataAdapter;
        const definition = {
            resources: [
                ...library.resources,
                {
                    ...library.resources[0],
                    id: 'documents',
                    label: { singular: 'document', plural: 'documents' },
                },
            ],
        } as unknown as Definition;
        const onChange = vi.fn();
        renderInRoot(
            <PanneauProvider definition={definition}>
                <DataAdapterProvider adapter={adapter}>
                    <MediaFieldEntry
                        field={{
                            name: 'cover',
                            type: 'media',
                            label: 'Cover',
                            resource: ['documents', 'media'],
                        }}
                        path="cover"
                        value={null}
                        onChange={onChange}
                    />
                </DataAdapterProvider>
            </PanneauProvider>,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Choose media' }));
        const dialog = screen.getByRole('dialog', { name: 'Choose media' });
        expect(within(dialog).getByRole('radio', { name: 'documents' })).toBeChecked();
        await userEvent.click(within(dialog).getByRole('radio', { name: 'media' }));
        await userEvent.click(await within(dialog).findByRole('row', { name: 'media one' }));
        await userEvent.click(within(dialog).getByRole('button', { name: 'Select' }));

        expect(list).toHaveBeenCalledWith('documents', expect.anything(), expect.anything());
        expect(list).toHaveBeenCalledWith('media', expect.anything(), expect.anything());
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'media_1', resource: 'media', label: 'media one' }),
        );
    });

    it('only shows its media without a library in the definition', () => {
        renderInRoot(
            <MediaFieldEntry
                field={{ name: 'cover', type: 'media', label: 'Cover' }}
                path="cover"
                value="med_1"
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByText('med_1')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});

describe('mediaPlugin', () => {
    it('provides the media and image types: the file type is built into the fields', () => {
        expect(Object.keys(mediaPlugin.fields)).toEqual(['media', 'image']);
    });
});
