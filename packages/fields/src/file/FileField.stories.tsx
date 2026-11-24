import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { afterSlides, dragHandle } from '../__fixtures__/reorder';
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

const FILES: FileValue[] = [
    TERMS,
    {
        name: 'minutes.txt',
        url: 'https://files.example/minutes.txt',
        mime: 'text/plain',
        size: 800,
    },
    { name: 'budget.csv', url: 'https://files.example/budget.csv', mime: 'text/csv', size: 4_200 },
];

const handleNames = (element: HTMLElement) =>
    [...element.querySelectorAll('[data-reorder-handle]')].map((handle) =>
        handle.getAttribute('aria-label'),
    );

function Reorderable() {
    const [value, setValue] = useState<FileValue[] | null>(FILES);
    return (
        <FileField
            label="Attachments"
            multiple
            uploadSource={null}
            value={value}
            onChange={setValue}
        />
    );
}

/**
 * Several files reorder (decision 0111): by the handle at the start of each file, with the
 * pointer or the keyboard, or from the menu of moves before its button to remove it.
 */
export const Reorder: Story = {
    render: () => <Reorderable />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);

        // The pointer: on the upper half of the first file
        const first = canvas.getAllByRole('listitem')[0] as HTMLElement;
        await dragHandle(
            canvas.getByRole('button', { name: 'Move budget.csv' }),
            first,
            first.getBoundingClientRect().top + 4,
        );
        await waitFor(() =>
            expect(handleNames(canvasElement)).toEqual([
                'Move budget.csv',
                'Move terms.pdf',
                'Move minutes.txt',
            ]),
        );
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'budget.csv moved to position 1 of 3',
        );
        await afterSlides();

        // The keyboard: the places of the list, not the drop zone of the field
        canvas.getByRole('button', { name: 'Move minutes.txt' }).focus();
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        await userEvent.keyboard('{ArrowUp}');
        await waitFor(() =>
            expect(document.activeElement).toHaveAccessibleName('Before budget.csv'),
        );
        await userEvent.keyboard('{Enter}');
        await waitFor(() =>
            expect(handleNames(canvasElement)).toEqual([
                'Move minutes.txt',
                'Move budget.csv',
                'Move terms.pdf',
            ]),
        );
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move minutes.txt' })).toHaveFocus(),
        );
        await afterSlides();

        // The menu
        await userEvent.click(canvas.getByRole('button', { name: 'Reorder minutes.txt' }));
        await userEvent.click(await body.findByRole('menuitem', { name: 'Move to the end' }));
        await waitFor(() =>
            expect(handleNames(canvasElement)).toEqual([
                'Move budget.csv',
                'Move terms.pdf',
                'Move minutes.txt',
            ]),
        );
    },
};

/** In a narrow column, as the sidebar of a form: the files keep their tools, and cut their names. */
export const ReorderInANarrowColumn: Story = {
    render: () => (
        <div style={{ maxWidth: '16rem' }}>
            <Reorderable />
        </div>
    ),
    play: async ({ canvasElement }) => {
        for (const file of canvasElement.querySelectorAll<HTMLElement>('li')) {
            await expect(file.scrollWidth).toBeLessThanOrEqual(file.clientWidth);
        }
    },
};
