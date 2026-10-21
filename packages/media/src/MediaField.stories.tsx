import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Media } from '@panneau/protocol';

import { type MediaAdapter, MediaField } from './MediaField';

const media = (overrides: Partial<Media> = {}): Media => ({
    id: 'med_1',
    version: null,
    abilities: {},
    type: 'video',
    name: 'interview.mp4',
    mime: 'video/mp4',
    size: 2_147_483_648,
    url: 'https://files.example/interview.mp4',
    thumbnailUrl: null,
    ...overrides,
});

/** Makes a pending media of each file, which is processed, then ready, as it is read again. */
function createExampleAdapter(): MediaAdapter {
    let next = 1;
    const reads = new Map<string, number>();
    const created = new Map<string, Media>();
    return {
        uploadMedia(file) {
            const name = file instanceof File ? file.name : 'upload';
            const item = media({
                id: `med_${String(next++)}`,
                name,
                type: name.endsWith('.jpg') ? 'image' : 'video',
                mime: file instanceof File ? file.type : 'video/mp4',
                size: file instanceof File ? file.size : 0,
                status: 'pending',
            });
            created.set(item.id, item);
            return Promise.resolve(item);
        },
        getMedia(id) {
            const count = (reads.get(id) ?? 0) + 1;
            reads.set(id, count);
            const item = created.get(id) ?? media({ id });
            return Promise.resolve({ ...item, status: count < 2 ? 'processing' : 'ready' });
        },
    } as MediaAdapter;
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
    args: { label: 'Video', refreshInterval: 300 },
} satisfies Meta<typeof MediaField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A file becomes a media, whose status the field follows until it is ready. */
export const Ingest: Story = {
    render: function Render(args) {
        const [adapter] = useState(createExampleAdapter);
        const [value, setValue] = useState<Media | null>(null);
        return (
            <MediaField
                label={args.label}
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
        const [value, setValue] = useState<Media[] | null>([
            media(),
            media({ id: 'med_2', type: 'image', name: 'poster.jpg', size: 320_000 }),
            media({ id: 'med_3', type: 'image', name: 'broken.jpg', status: 'failed' }),
        ]);
        return (
            <MediaField
                label="Gallery"
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
    render: (args) => <MediaField label={args.label} adapter={null} value={media()} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/Files can’t be uploaded here./)).toBeVisible();
        await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    },
};
