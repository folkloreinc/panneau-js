import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Item, MediaInfo, MediaReference } from '@panneau/protocol';

import { type MediaAdapter, MediaField } from './MediaField';

const reference = (
    media: Partial<MediaInfo> = {},
    overrides: Partial<MediaReference> = {},
): MediaReference => ({
    id: 'med_1',
    label: 'interview.mp4',
    media: { type: 'video', size: 2_147_483_648, thumbnailUrl: null, ...media },
    ...overrides,
});

/** Makes a pending media of each file, which is processed, then ready, as it is read again. */
function createExampleAdapter(): MediaAdapter {
    let next = 1;
    const reads = new Map<string, number>();
    const created = new Map<string, Item>();
    return {
        create(_resource, values) {
            const file = values.file;
            const name = file instanceof File ? file.name : 'upload';
            const item: Item = {
                id: `med_${String(next++)}`,
                version: '1',
                abilities: {},
                name,
                media: {
                    type: name.endsWith('.jpg') ? 'image' : 'video',
                    mime: file instanceof File ? file.type : 'video/mp4',
                    size: file instanceof File ? file.size : 0,
                    status: 'pending',
                },
            };
            created.set(item.id, item);
            return Promise.resolve(item);
        },
        get(_resource, id) {
            const count = (reads.get(id) ?? 0) + 1;
            reads.set(id, count);
            const item = created.get(id) ?? { id, version: '1', abilities: {} };
            return Promise.resolve({
                ...item,
                media: { ...(item.media as MediaInfo), status: count < 2 ? 'processing' : 'ready' },
            });
        },
    };
}

const fileInput = (container: HTMLElement) => {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (input === null) {
        throw new Error('No file input.');
    }
    return input;
};

const meta = {
    title: 'Media/MediaField',
    component: MediaField,
    args: { label: 'Video', resource: 'media', refreshInterval: 300 },
} satisfies Meta<typeof MediaField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A file becomes a media, whose status the field follows until it is ready. */
export const Ingest: Story = {
    render: function Render(args) {
        const [adapter] = useState(createExampleAdapter);
        const [value, setValue] = useState<MediaReference | null>(null);
        return (
            <MediaField
                label={args.label}
                resource="media"
                adapter={adapter}
                uploadSource={null}
                refreshInterval={args.refreshInterval ?? 300}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('No media')).toBeVisible();

        await userEvent.upload(
            fileInput(canvasElement),
            new File([new Uint8Array(64)], 'clip.mp4', { type: 'video/mp4' }),
        );

        await expect(await canvas.findByText('clip.mp4')).toBeVisible();
        await expect(await canvas.findByText('Processing')).toBeVisible();
        await waitFor(() => expect(canvas.queryByText('Processing')).not.toBeInTheDocument(), {
            timeout: 3000,
        });
    },
};

/** Media of a multiple value, one of which failed to process. */
export const Gallery: Story = {
    render: function Render() {
        const [adapter] = useState(createExampleAdapter);
        const [value, setValue] = useState<MediaReference[] | null>([
            reference(),
            reference({ type: 'image', size: 320_000 }, { id: 'med_2', label: 'poster.jpg' }),
            reference({ type: 'image', status: 'failed' }, { id: 'med_3', label: 'broken.jpg' }),
        ]);
        return (
            <MediaField
                label="Gallery"
                resource="media"
                multiple
                adapter={adapter}
                uploadSource={null}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Processing failed')).toBeVisible();

        await userEvent.click(canvas.getByRole('button', { name: 'Remove broken.jpg' }));
        await expect(canvas.queryByText('broken.jpg')).not.toBeInTheDocument();
        await expect(canvas.getByText('poster.jpg')).toBeVisible();
    },
};

/** Without an adapter, the field only shows its media, and says why. */
export const WithoutAdapter: Story = {
    render: (args) => (
        <MediaField label={args.label} resource="media" adapter={null} value={reference()} />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/Files can’t be uploaded here./)).toBeVisible();
        await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    },
};
