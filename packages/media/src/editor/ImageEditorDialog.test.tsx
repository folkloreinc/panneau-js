import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { MediaTransform } from '@panneau/protocol';

import { harbour, harbourBanner } from '../__fixtures__/images';
import { renderInRoot } from '../__fixtures__/render';
import { ImageEditorDialog } from './ImageEditor';

/** A button that opens the editor on a value, which Apply replaces. */
function Opener({ onApply }: { onApply: (transform: MediaTransform | null) => void }) {
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState<MediaTransform | null>(harbourBanner);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Edit
            </button>
            <ImageEditorDialog
                isOpen={isOpen}
                onOpenChange={setOpen}
                image={harbour}
                value={value}
                title="Crop for this use"
                onApply={(transform) => {
                    onApply(transform);
                    setValue(transform);
                }}
            />
        </>
    );
}

async function openDialog() {
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    return within(await screen.findByRole('dialog', { name: 'Crop for this use' }));
}

describe('ImageEditorDialog', () => {
    it('renders nothing while closed', () => {
        renderInRoot(<Opener onApply={vi.fn()} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('applies, then closes', async () => {
        const onApply = vi.fn();
        renderInRoot(<Opener onApply={onApply} />);

        const dialog = await openDialog();
        await userEvent.click(dialog.getByRole('button', { name: 'Reset' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Apply' }));

        expect(onApply).toHaveBeenCalledWith(null);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('cancels without applying, and starts from the value again when it opens', async () => {
        const onApply = vi.fn();
        renderInRoot(<Opener onApply={onApply} />);

        let dialog = await openDialog();
        await userEvent.click(dialog.getByRole('button', { name: 'Reset' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(onApply).not.toHaveBeenCalled();

        dialog = await openDialog();
        await userEvent.click(dialog.getByRole('button', { name: 'Apply' }));
        expect(onApply).toHaveBeenCalledWith(harbourBanner);
    });
});
