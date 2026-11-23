import { act, screen, waitFor } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';

import { Button, TextInput } from '@panneau/ui';

import { dragFiles, pasteFiles } from '../__fixtures__/dataTransfer';
import { renderField } from '../__fixtures__/render';
import { FileDropZone } from './FileDropZone';

const dropFiles = (target: Element, files: readonly File[], options?: { drop?: boolean }) =>
    act(async () => {
        dragFiles(target, files, options);
        await Promise.resolve();
    });

const file = (name: string, type = 'image/png') => new File(['x'], name, { type });

function Zone({
    onSelect,
    isDisabled,
    portal,
}: {
    onSelect: (files: File[]) => void;
    isDisabled?: boolean;
    portal?: boolean;
}) {
    return (
        <FileDropZone onSelect={onSelect} {...(isDisabled === true ? { isDisabled } : {})}>
            <p>An item of the field</p>
            <Button>Remove</Button>
            <TextInput aria-label="Caption" />
            {portal === true ? createPortal(<Button>In a dialog</Button>, document.body) : null}
        </FileDropZone>
    );
}

describe('FileDropZone', () => {
    it('takes files dropped anywhere on its content', async () => {
        const onSelect = vi.fn();
        renderField(<Zone onSelect={onSelect} />);
        const dropped = [file('a.png'), file('b.png')];

        await dropFiles(screen.getByText('An item of the field'), dropped);

        await waitFor(() => expect(onSelect).toHaveBeenCalledWith(dropped));
    });

    it('shows and announces where files go while they are dragged over it', async () => {
        renderField(<Zone onSelect={vi.fn()} />);
        const status = screen.getByRole('status');
        expect(status).toBeEmptyDOMElement();

        await dropFiles(screen.getByText('An item of the field'), [file('a.png')], {
            drop: false,
        });

        expect(status).toHaveTextContent('Drop to upload');
    });

    it('takes files pasted while the focus is inside it', () => {
        const onSelect = vi.fn();
        renderField(<Zone onSelect={onSelect} />);
        const pasted = [file('screenshot.png')];
        const button = screen.getByRole('button', { name: 'Remove' });
        button.focus();

        const handled = !pasteFiles(button, pasted);

        expect(onSelect).toHaveBeenCalledWith(pasted);
        expect(handled).toBe(true);
    });

    it('leaves a paste in a text input, a paste of text, and a paste in a portal alone', () => {
        const onSelect = vi.fn();
        renderField(<Zone onSelect={onSelect} portal />);

        expect(pasteFiles(screen.getByRole('textbox', { name: 'Caption' }), [file('a.png')])).toBe(
            true,
        );
        pasteFiles(screen.getByRole('button', { name: 'Remove' }), [], 'some text');
        pasteFiles(screen.getByRole('button', { name: 'In a dialog' }), [file('b.png')]);

        expect(onSelect).not.toHaveBeenCalled();
    });

    it('takes nothing when it is disabled', async () => {
        const onSelect = vi.fn();
        renderField(<Zone onSelect={onSelect} isDisabled />);

        pasteFiles(screen.getByRole('button', { name: 'Remove' }), [file('a.png')]);
        await dropFiles(screen.getByText('An item of the field'), [file('b.png')]);

        expect(onSelect).not.toHaveBeenCalled();
    });
});
