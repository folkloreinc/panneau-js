import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField as renderInRoot } from '../__fixtures__/render';
import { createExampleUploadSource, exampleFile as file, fileInput } from '../__fixtures__/uploads';
import { FileField, FileFieldEntry, type FileValue } from './FileField';

const TERMS = {
    name: 'terms.pdf',
    url: 'https://files.test/terms.pdf',
    mime: 'application/pdf',
    size: 52000,
};

describe('FileField', () => {
    it('shows a stored file with a link, and removes it', async () => {
        const onChange = vi.fn();
        renderInRoot(<FileField label="Attachment" value={TERMS} onChange={onChange} />);

        expect(screen.getByRole('link', { name: 'terms.pdf' })).toHaveAttribute(
            'href',
            'https://files.test/terms.pdf',
        );
        expect(screen.getByText('51 KB')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Replace the file' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Remove terms.pdf' }));
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('gives the file itself without direct uploads', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <Controlled<FileValue | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <FileField label="Attachment" value={value} onChange={setValue} />
                )}
            </Controlled>,
        );
        expect(screen.getByText('No file')).toBeInTheDocument();

        const chosen = file('notes.txt', 'text/plain');
        await userEvent.upload(fileInput(container), chosen);

        expect(onChange).toHaveBeenCalledWith(chosen);
        expect(screen.getByText('notes.txt')).toBeInTheDocument();
    });

    it('adds files to a multiple value', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <FileField label="Files" multiple value={[TERMS]} onChange={onChange} />,
        );

        const chosen = file('notes.txt', 'text/plain');
        await userEvent.upload(fileInput(container), [chosen]);

        expect(onChange).toHaveBeenCalledWith([TERMS, chosen]);
    });

    it('refuses files of other types, or too large, with a message', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <FileField
                label="Attachment"
                accept={['application/pdf']}
                maxSize={100}
                value={null}
                onChange={onChange}
            />,
        );

        await userEvent.upload(fileInput(container), file('big.pdf', 'application/pdf', 200), {
            applyAccept: false,
        });
        await userEvent.upload(fileInput(container), file('photo.jpg', 'image/jpeg'), {
            applyAccept: false,
        });

        expect(onChange).not.toHaveBeenCalled();
        expect(
            screen.getByText('photo.jpg: this type of file is not accepted.'),
        ).toBeInTheDocument();
    });

    it('only shows its files when it is read-only', () => {
        renderInRoot(<FileField label="Attachment" value={TERMS} readOnly />);

        expect(screen.getByRole('link', { name: 'terms.pdf' })).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('reads its accept rule and multiple from the definition', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <FileFieldEntry
                field={{
                    name: 'attachments',
                    type: 'file',
                    label: 'Attachments',
                    multiple: true,
                    rules: [{ rule: 'accept', value: ['application/pdf'] }],
                }}
                path="attachments"
                value={null}
                onChange={onChange}
            />,
        );

        expect(fileInput(container)).toHaveAttribute('accept', 'application/pdf');
        expect(fileInput(container)).toHaveAttribute('multiple');
        const chosen = file('terms.pdf', 'application/pdf');
        await userEvent.upload(fileInput(container), chosen);
        expect(onChange).toHaveBeenCalledWith([chosen]);
    });

    it('uploads through the upload source of the fields context, and replaces the file', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <Controlled<FileValue | null> initial={TERMS} onChange={onChange}>
                {(value, setValue) => (
                    <FileField label="Attachment" value={value} onChange={setValue} />
                )}
            </Controlled>,
            { uploadSource: createExampleUploadSource({ interval: 40 }) },
        );

        await userEvent.upload(fileInput(container), file('notes.txt', 'text/plain'));

        expect(await screen.findByRole('progressbar', { name: 'notes.txt' })).toBeInTheDocument();
        await waitFor(() =>
            expect(onChange).toHaveBeenCalledWith({
                upload: 'upl_1',
                name: 'notes.txt',
                mime: 'text/plain',
                size: 10,
            }),
        );
        expect(screen.queryByRole('link', { name: 'terms.pdf' })).not.toBeInTheDocument();
        expect(screen.getByText('notes.txt')).toBeInTheDocument();
    });

    it('gives the file itself when its upload source is null, over the context', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <FileField label="Attachment" uploadSource={null} value={null} onChange={onChange} />,
            { uploadSource: createExampleUploadSource() },
        );

        const chosen = file('notes.txt', 'text/plain');
        await userEvent.upload(fileInput(container), chosen);

        expect(onChange).toHaveBeenCalledWith(chosen);
    });

    it('reads its maxSize rule from the definition', async () => {
        const onChange = vi.fn();
        const { container } = renderInRoot(
            <FileFieldEntry
                field={{
                    name: 'attachment',
                    type: 'file',
                    label: 'Attachment',
                    accept: ['text/plain'],
                    rules: [{ rule: 'maxSize', value: 5 }],
                }}
                path="attachment"
                value={null}
                onChange={onChange}
            />,
        );

        expect(fileInput(container)).toHaveAttribute('accept', 'text/plain');
        await userEvent.upload(fileInput(container), file('notes.txt', 'text/plain', 10));

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByText('notes.txt: files can’t be larger than 5 B.')).toBeInTheDocument();
    });
});
