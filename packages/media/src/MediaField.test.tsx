import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { DataAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { FieldsProvider, type UploadSource, type UploadedFile } from '@panneau/fields';
import type { Media } from '@panneau/protocol';

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

const media = (overrides: Partial<Media> = {}): Media => ({
    id: 'med_1',
    version: null,
    abilities: {},
    type: 'video',
    name: 'clip.mp4',
    mime: 'video/mp4',
    size: 2048,
    url: 'https://files.test/clip.mp4',
    thumbnailUrl: null,
    ...overrides,
});

describe('MediaField', () => {
    it('makes a media of a chosen file, and reads it again until it is ready', async () => {
        const getMedia = vi
            .fn<MediaAdapter['getMedia']>()
            .mockResolvedValueOnce(media({ status: 'processing' }))
            .mockResolvedValue(
                media({ status: 'ready', thumbnailUrl: 'https://files.test/poster.jpg' }),
            );
        const adapter: MediaAdapter = {
            uploadMedia: vi
                .fn<MediaAdapter['uploadMedia']>()
                .mockResolvedValue(media({ status: 'pending' })),
            getMedia,
        };
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <Controlled<Media | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <MediaField
                        label="Video"
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

        expect(adapter.uploadMedia).toHaveBeenCalledWith(chosen);
        expect(await screen.findByText('Waiting')).toBeInTheDocument();
        expect(await screen.findByText('Processing')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Processing')).not.toBeInTheDocument());
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ id: 'med_1', status: 'ready' }),
        );
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'https://files.test/poster.jpg',
        );
    });

    it('shows why a media could not be made', async () => {
        const adapter: MediaAdapter = {
            uploadMedia: vi
                .fn<MediaAdapter['uploadMedia']>()
                .mockRejectedValue(new Error('Too large.')),
            getMedia: vi.fn<MediaAdapter['getMedia']>(),
        };
        const { container } = renderInRoot(
            <MediaField label="Image" adapter={adapter} value={null} onChange={vi.fn()} />,
        );

        await userEvent.upload(fileInput(container), file('photo.jpg', 'image/jpeg'));

        expect(await screen.findByText('Failed: photo.jpg: Too large.')).toBeInTheDocument();
    });

    it('removes a media from a multiple value', async () => {
        const onChange = vi.fn();
        const adapter: MediaAdapter = {
            uploadMedia: vi.fn<MediaAdapter['uploadMedia']>(),
            getMedia: vi.fn<MediaAdapter['getMedia']>(),
        };
        renderInRoot(
            <MediaField
                label="Gallery"
                multiple
                adapter={adapter}
                value={[media(), media({ id: 'med_2', name: 'photo.jpg', type: 'image' })]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Remove clip.mp4' }));

        expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'med_2' })]);
    });

    it('is read-only without an adapter, and says so', () => {
        renderInRoot(<MediaField label="Video" value={media({ status: 'failed' })} />);

        expect(screen.getByText('Processing failed')).toBeInTheDocument();
        expect(screen.getByText(/Files can’t be uploaded here./)).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('makes a media of an upload, with the adapter and the upload source of its providers', async () => {
        const uploadMedia = vi
            .fn<MediaAdapter['uploadMedia']>()
            .mockResolvedValue(media({ name: 'photo.jpg', type: 'image' }));
        const adapter = { uploadMedia, getMedia: vi.fn() } as unknown as DataAdapter;
        const onChange = vi.fn();
        const { container } = renderInRoot(
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
            </DataAdapterProvider>,
        );

        expect(fileInput(container)).toHaveAttribute('accept', 'image/*');
        await userEvent.upload(fileInput(container), file('photo.jpg', 'image/jpeg'));

        expect(uploadMedia).toHaveBeenCalledWith({ upload: 'upl_1' }, { name: 'photo.jpg' });
        await waitFor(() =>
            expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'photo.jpg' })]),
        );
    });
});

describe('mediaPlugin', () => {
    it('provides the media type only: the file type is built into the fields', () => {
        expect(Object.keys(mediaPlugin.fields)).toEqual(['media']);
    });
});
