import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider } from '@panneau/core';
import type { DataAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { FieldsProvider, type UploadSource, type UploadedFile } from '@panneau/fields';
import type { Definition, Item, MediaInfo, MediaReference } from '@panneau/protocol';

import { type MediaAdapter, MediaField, MediaFieldEntry } from './MediaField';
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
    it('provides the media type only: the file type is built into the fields', () => {
        expect(Object.keys(mediaPlugin.fields)).toEqual(['media']);
    });
});
