import { act, fireEvent, screen, waitFor } from '@testing-library/react';
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
        expect(screen.getByText('PDF · 51 KB')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Replace the file' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Remove terms.pdf' }));
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('shows the thumbnail of an image, and the icon of a document', () => {
        const { container } = renderInRoot(
            <FileField
                label="Files"
                multiple
                value={[
                    TERMS,
                    {
                        name: 'photo.heic',
                        url: 'https://files.test/photo.heic',
                        thumbnailUrl: 'https://files.test/photo.jpg',
                        mime: 'image/heic',
                        size: 1000,
                    },
                    {
                        name: 'cover.png',
                        url: 'https://files.test/cover.png',
                        mime: 'image/png',
                        size: 1000,
                    },
                ]}
            />,
        );
        const images = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'));
        expect(images).toEqual(['https://files.test/photo.jpg', 'https://files.test/cover.png']);
        expect(container.querySelector('[data-kind="document"]')).toHaveTextContent('PDF');
    });

    it('falls back to the icon when the thumbnail fails to load', () => {
        const { container } = renderInRoot(
            <FileField
                label="Video"
                value={{
                    name: 'clip.mp4',
                    thumbnailUrl: 'https://files.test/missing.jpg',
                    mime: 'video/mp4',
                    size: 1000,
                }}
            />,
        );
        const image = container.querySelector('img');
        expect(image).not.toBeNull();
        fireEvent.error(image as HTMLImageElement);
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText(/^MP4 · /)).toBeInTheDocument();
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

describe('FileField: reorder', () => {
    const NOTES = { name: 'notes.txt', upload: 'upload-1', mime: 'text/plain', size: 12 };
    const PHOTO = file('photo.jpg', 'image/jpeg');
    const names = () =>
        [...document.querySelectorAll('[data-reorder-handle]')].map((handle) =>
            handle.getAttribute('aria-label'),
        );

    function Files({
        onChange,
        readOnly,
    }: {
        onChange?: (value: FileValue[] | null) => void;
        readOnly?: boolean;
    }) {
        return (
            <Controlled<FileValue[] | null> initial={[TERMS, NOTES, PHOTO]} onChange={onChange}>
                {(value, setValue) => (
                    <FileField
                        label="Files"
                        multiple
                        uploadSource={null}
                        value={value}
                        onChange={setValue}
                        {...(readOnly !== undefined ? { readOnly } : {})}
                    />
                )}
            </Controlled>
        );
    }

    it('moves a file by its handle with the keyboard, and the value follows', async () => {
        const onChange = vi.fn();
        renderInRoot(<Files onChange={onChange} />);
        expect(names()).toEqual(['Move terms.pdf', 'Move notes.txt', 'Move photo.jpg']);
        act(() => screen.getByRole('button', { name: 'Move photo.jpg' }).focus());
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        act(() => screen.getByRole('button', { name: 'Before terms.pdf' }).focus());
        await userEvent.keyboard('{Enter}');
        expect(onChange).toHaveBeenLastCalledWith([PHOTO, TERMS, NOTES]);
        expect(names()).toEqual(['Move photo.jpg', 'Move terms.pdf', 'Move notes.txt']);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Move photo.jpg' })).toHaveFocus(),
        );
        expect(screen.getByRole('status')).toHaveTextContent('photo.jpg moved to position 1 of 3');
    });

    it('moves a file from its menu, then removes the file at its new place', async () => {
        const onChange = vi.fn();
        renderInRoot(<Files onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Reorder terms.pdf' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'Move to the end' }));
        expect(onChange).toHaveBeenLastCalledWith([NOTES, PHOTO, TERMS]);
        await userEvent.click(screen.getByRole('button', { name: 'Remove photo.jpg' }));
        expect(onChange).toHaveBeenLastCalledWith([NOTES, TERMS]);
    });

    it('has no handle or menu when it is read-only, or with a single file', () => {
        const { unmount } = renderInRoot(<Files readOnly />);
        expect(document.querySelector('[data-reorder-handle]')).toBeNull();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        unmount();
        renderInRoot(<FileField label="Files" multiple value={[TERMS]} onChange={() => {}} />);
        expect(screen.getByRole('button', { name: 'Move terms.pdf' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        expect(screen.queryByRole('button', { name: 'Reorder terms.pdf' })).not.toBeInTheDocument();
    });
});
