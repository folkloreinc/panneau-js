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

export const ReadOnly: Story = {
    args: { readOnly: true, value: TERMS },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'terms.pdf' })).toBeVisible();
        await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    },
};
