import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stamp } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { harbour, harbourBanner, hiker } from '../__fixtures__/images';
import { renderInRoot } from '../__fixtures__/render';
import { ImageEditor } from './ImageEditor';
import type { ImageEditorProps } from './types';

function open(props: Partial<ImageEditorProps> = {}) {
    const onApply = vi.fn<ImageEditorProps['onApply']>();
    renderInRoot(<ImageEditor image={harbour} value={null} onApply={onApply} {...props} />);
    const dialog = within(screen.getByRole('group', { name: 'Edit image' }));
    return { dialog, onApply };
}

const apply = (dialog: ReturnType<typeof within>, name = 'Apply') =>
    userEvent.click(dialog.getByRole('button', { name }));

describe('ImageEditor', () => {
    it('proposes the largest crop of the first ratio a field requires, around the focal point', async () => {
        const { dialog, onApply } = open({
            ratios: ['16:9', '1:1'],
            enforceRatios: true,
            cropRequired: true,
        });

        expect(dialog.getByText(/this one is proposed around the focal point/)).toBeInTheDocument();
        expect(dialog.getByRole('radio', { name: '16:9' })).toBeChecked();
        expect(dialog.queryByRole('radio', { name: 'Free' })).not.toBeInTheDocument();
        await apply(dialog);

        expect(onApply).toHaveBeenCalledWith({ crop: { x: 0, y: 375, width: 4000, height: 2250 } });
    });

    it('fits the crop to the ratio chosen', async () => {
        const { dialog, onApply } = open({
            value: harbourBanner,
            ratios: ['16:9', '1:1'],
            enforceRatios: true,
        });

        await userEvent.click(dialog.getByRole('radio', { name: '1:1' }));
        await apply(dialog);

        const crop = onApply.mock.calls[0]?.[0]?.crop;
        expect(crop?.width).toBe(crop?.height);
        expect(crop?.height).toBe(3000);
    });

    it('waits for a crop the field requires, and says why', async () => {
        const { dialog, onApply } = open({ cropRequired: true });

        expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled();
        expect(dialog.getByText('Crop the image to apply.')).toBeInTheDocument();
        // Shift + arrow keys resize the frame, which makes a crop.
        dialog.getByRole('group', { name: /^Crop, / }).focus();
        await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowUp}{/Shift}');
        expect(dialog.getByRole('button', { name: 'Apply' })).toBeEnabled();
        await apply(dialog);
        expect(onApply).toHaveBeenCalledWith({ crop: { x: 0, y: 0, width: 3960, height: 2960 } });
    });

    it('moves the crop with the arrow keys', async () => {
        const { dialog, onApply } = open({ value: harbourBanner });

        dialog.getByRole('group', { name: /^Crop, / }).focus();
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        await apply(dialog);

        expect(onApply).toHaveBeenCalledWith({
            ...harbourBanner,
            crop: { ...harbourBanner.crop, x: 1020 },
        });
    });

    it("applies over the library's version, and keeps the transform it was made on", async () => {
        const { dialog, onApply } = open({ image: hiker });

        expect(dialog.getByText(/Starts from the library’s version/)).toBeInTheDocument();
        await userEvent.click(dialog.getByRole('radio', { name: 'Rotate' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Rotate right' }));
        await apply(dialog);

        expect(onApply).toHaveBeenCalledWith({
            base: 'media',
            baseTransform: { rotate: 90 },
            rotate: 90,
        });
    });

    it('starts from the original file when the user chooses it', async () => {
        const { dialog, onApply } = open({ image: hiker, canChooseBase: true });

        await userEvent.click(dialog.getByRole('radio', { name: 'Original file' }));
        expect(dialog.getByText(/Starts from the original file/)).toBeInTheDocument();
        await userEvent.click(dialog.getByRole('radio', { name: 'Rotate' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Rotate right' }));
        await apply(dialog);

        expect(onApply).toHaveBeenCalledWith({ rotate: 90 });
    });

    it("moves a crop inside the library's version when it changed, and says so", async () => {
        const { dialog, onApply } = open({
            image: hiker,
            value: {
                base: 'media',
                baseTransform: { rotate: 270 },
                crop: { x: 0, y: 3500, width: 3024, height: 1701 },
            },
        });

        expect(dialog.getByText('The library’s version of this image changed')).toBeInTheDocument();
        await apply(dialog);

        expect(onApply).toHaveBeenCalledWith({
            base: 'media',
            baseTransform: { rotate: 90 },
            crop: { x: 0, y: 3500, width: 3024, height: 532 },
        });
    });

    it('keeps the keys it does not know, and gives null without edits', async () => {
        const kept = open({ value: { rotate: 90, filter: 'sepia' } });
        await apply(kept.dialog);
        expect(kept.onApply).toHaveBeenCalledWith({ rotate: 90, filter: 'sepia' });
    });

    it('gives null when there is nothing to apply', async () => {
        const { dialog, onApply } = open({ value: { rotate: 90 } });

        await userEvent.click(dialog.getByRole('button', { name: 'Reset' }));
        await apply(dialog);

        expect(onApply).toHaveBeenCalledWith(null);
    });

    it("takes a product's own tools, and what they require", () => {
        const { dialog } = open({
            tools: [
                {
                    id: 'stamp',
                    label: 'Stamp',
                    icon: Stamp,
                    renderPanel: () => <p>The stamp panel</p>,
                    validate: (transform) =>
                        transform.stamp === undefined ? 'Add a stamp.' : null,
                },
            ],
        });

        expect(dialog.getByText('The stamp panel')).toBeInTheDocument();
        // A single tool needs no switcher.
        expect(dialog.queryByRole('radiogroup', { name: 'Tool' })).not.toBeInTheDocument();
        expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled();
        expect(dialog.getByText('Add a stamp.')).toBeInTheDocument();
    });

    it('fits in a page, and shows Cancel only when it can cancel', async () => {
        const onApply = vi.fn();
        renderInRoot(
            <ImageEditor image={harbour} value={null} aria-label="Cover crop" onApply={onApply} />,
        );
        const editor = within(screen.getByRole('group', { name: 'Cover crop' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(editor.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
        await apply(editor);
        expect(onApply).toHaveBeenCalledWith(null);

        cleanup();
        const onCancel = vi.fn();
        const { dialog } = open({ onCancel });
        await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
        expect(onCancel).toHaveBeenCalled();
    });
});
