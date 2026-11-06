import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createExampleUploadSource, exampleFile, fileInput } from '../__fixtures__/uploads';
import { FileField, type FileValue } from './FileField';

const TERMS: FileValue = {
    name: 'terms.pdf',
    url: 'https://files.example/terms.pdf',
    mime: 'application/pdf',
    size: 52_000,
};

const meta = {
    title: 'Fields/File',
    component: FileField,
    args: { label: 'Attachment', description: 'A PDF or a text file.' },
} satisfies Meta<typeof FileField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Without an upload source, the value holds the file itself, for a multipart request. */
export const WithoutUploads: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<FileValue | null>(TERMS);
        return (
            <FileField
                label={args.label}
                description={args.description}
                accept={['application/pdf', 'text/plain']}
                uploadSource={null}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'terms.pdf' })).toBeVisible();

        await userEvent.click(canvas.getByRole('button', { name: 'Remove terms.pdf' }));
        await expect(canvas.getByText('No file')).toBeVisible();

        await userEvent.upload(fileInput(canvasElement), exampleFile('notes.txt', 'text/plain'));
        await expect(await canvas.findByText('notes.txt')).toBeVisible();
        await expect(canvas.getByRole('button', { name: 'Replace the file' })).toBeVisible();
    },
};

/** With an upload source, files go to storage first, with their progress. */
export const WithUploads: Story = {
    render: function Render(args) {
        const [source] = useState(() => createExampleUploadSource());
        const [value, setValue] = useState<FileValue[] | null>(null);
        return (
            <FileField
                label="Attachments"
                description={args.description}
                multiple
                uploadSource={source}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.upload(fileInput(canvasElement), [
            exampleFile('interview.txt', 'text/plain', 2048),
            exampleFile('fail.txt', 'text/plain'),
        ]);
        await expect(
            await canvas.findByRole('progressbar', { name: 'interview.txt' }),
        ).toBeVisible();

        await userEvent.click(await canvas.findByRole('button', { name: 'Retry fail.txt' }));
        await waitFor(() => expect(canvas.getByText('interview.txt')).toBeVisible());
        await waitFor(() => expect(canvas.getByText('fail.txt')).toBeVisible());
        await waitFor(() => expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument());
    },
};

/** Files of another type, or too large, are refused before they are sent. */
export const Refused: Story = {
    render: (args) => (
        <FileField
            label={args.label}
            accept={['application/pdf']}
            maxSize={1024}
            uploadSource={null}
            value={null}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.upload(fileInput(canvasElement), exampleFile('photo.jpg', 'image/jpeg'), {
            applyAccept: false,
        });
        await expect(
            canvas.getByText('photo.jpg: this type of file is not accepted.'),
        ).toBeVisible();
    },
};

const PHOTO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#be185d"/></linearGradient></defs><rect width="320" height="240" fill="url(#g)"/><circle cx="240" cy="70" r="28" fill="#fde68a"/><path d="M0 240 110 120 190 200 240 160 320 240Z" fill="#7c2d12"/></svg>',
)}`;

/**
 * The file of a media, as its edit form shows it: the thumbnail of an image (or its preview, for a
 * HEIC), the icon of other types, never a broken image, with the name, type and size.
 */
export const Previews: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<FileValue[] | null>([
            { name: 'sunset.jpg', url: PHOTO_SVG, mime: 'image/jpeg', size: 2_400_000 },
            {
                name: 'IMG_2041.HEIC',
                url: 'https://files.example/IMG_2041.HEIC',
                thumbnailUrl: PHOTO_SVG,
                mime: 'image/heic',
                size: 3_100_000,
            },
            {
                name: 'teaser.mp4',
                thumbnailUrl: 'https://files.invalid/teaser-poster.jpg',
                mime: 'video/mp4',
                size: 48_000_000,
            },
            TERMS,
            {
                name: 'pricing.xlsx',
                mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                size: 180_000,
            },
        ]);
        return (
            <FileField
                label="Files"
                description={args.description}
                multiple
                uploadSource={null}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'sunset.jpg' })).toBeVisible();
        await expect(canvas.getByText(/^XLSX · /)).toBeVisible();
        // The poster of the video doesn't load: its icon shows instead.
        await waitFor(() =>
            expect(canvasElement.querySelector('[data-kind="video"] img')).toBeNull(),
        );
        await expect(canvasElement.querySelectorAll('img')).toHaveLength(2);
    },
};

/** An image just chosen shows before it is saved. */
export const NewImage: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<FileValue | null>(null);
        return (
            <FileField
                label="Image"
                description={args.description}
                accept={['image/*']}
                uploadSource={null}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.upload(
            fileInput(canvasElement),
            new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'logo.svg', {
                type: 'image/svg+xml',
            }),
        );
        await expect(await canvas.findByText('logo.svg')).toBeVisible();
        await waitFor(() =>
            expect(canvasElement.querySelector('img')?.getAttribute('src')).toMatch(/^data:image/),
        );
    },
};

export const ReadOnly: Story = {
    args: { readOnly: true, value: TERMS },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'terms.pdf' })).toBeVisible();
        await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    },
};
