import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { harbour, harbourBanner, hiker } from '../__fixtures__/images';
import { ImageEditorDialog } from './ImageEditor';

const meta = {
    title: 'Media/ImageEditorDialog',
    component: ImageEditorDialog,
    args: {
        isOpen: true,
        onOpenChange: fn(),
        onApply: fn(),
        image: harbour,
        value: harbourBanner,
    },
    parameters: {
        viewport: {
            options: {
                phone: {
                    name: 'Phone',
                    styles: { width: '390px', height: '844px' },
                    type: 'mobile',
                },
            },
        },
    },
} satisfies Meta<typeof ImageEditorDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const phone = { viewport: { value: 'phone', isRotated: false } };

/** The editor, once the dialog's entering animation is over. */
async function editor(canvasElement: HTMLElement) {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    return within(dialog);
}

/** In a large dialog: Apply gives the transform, then closes it. */
export const Default: Story = {
    play: async ({ canvasElement, args }) => {
        const dialog = await editor(canvasElement);
        await userEvent.click(dialog.getByRole('button', { name: 'Apply' }));
        await expect(args.onApply).toHaveBeenCalledWith(harbourBanner);
        await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    },
};

/**
 * The step right after a pick in the picker, when the field requires a crop: its own title, "Use
 * this crop", and "Back to the library". The choice of the base is in the header.
 */
export const AfterThePicker: Story = {
    args: {
        image: hiker,
        value: null,
        canChooseBase: true,
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        cropRequired: true,
        title: 'Crop for this use',
        applyLabel: 'Use this crop',
        onBack: fn(),
    },
    play: async ({ canvasElement, args }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('radio', { name: 'Library version' })).toBeChecked();
        await userEvent.click(dialog.getByRole('button', { name: 'Back to the library' }));
        await expect(args.onBack).toHaveBeenCalled();
    },
};

/** In the dark scheme. */
export const Dark: Story = {
    globals: { colorScheme: 'dark' },
};

/** On a phone: the image on top, the tools under it, full screen. */
export const PhoneCrop: Story = {
    args: {
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        title: 'Crop for this use',
    },
    globals: phone,
};

export const PhoneDark: Story = {
    args: { image: hiker, value: null },
    globals: { ...phone, colorScheme: 'dark' },
};
