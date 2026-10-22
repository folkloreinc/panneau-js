import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ImageEditorMockup } from './ImageEditorMockup';
import { harbour, harbourBanner, hiker } from './fixtures';

/**
 * Mockups of the image editor (#100), for review before it is built: static data, no network. See
 * `docs/mockups/image-editor/` for their screenshots.
 */
const meta = {
    title: 'Mockups/Image editor',
    component: ImageEditorMockup,
    args: { image: harbour },
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
} satisfies Meta<typeof ImageEditorMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

const phone = { viewport: { value: 'phone', isRotated: false } };

/** The editor, once its entering animation is over. */
const editor = async (canvasElement: HTMLElement, name = 'Edit image') => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name });
    await waitFor(() => expect(dialog).toBeVisible());
    return within(dialog);
};

/** A free crop: the frame, its handles and the thirds, with common ratios on the side. */
export const CropFree: Story = {
    args: { initial: { crop: { x: 900, y: 450, width: 2600, height: 1800 } } },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('radio', { name: 'Free' })).toBeChecked();
        await expect(dialog.getByRole('textbox', { name: 'Width' })).toHaveValue('2,600');
    },
};

/** The field allows 16:9 or 1:1: only those ratios, and the frame keeps the ratio chosen. */
export const CropToTheFieldsRatios: Story = {
    args: {
        initial: harbourBanner,
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        cropRequired: true,
        title: 'Crop for this use',
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement, 'Crop for this use');
        await expect(dialog.getByRole('radio', { name: '16:9' })).toBeChecked();
        await expect(dialog.queryByRole('radio', { name: 'Free' })).not.toBeInTheDocument();
        await userEvent.click(dialog.getByRole('radio', { name: '1:1' }));
        await expect(dialog.getByText(/· 1:1/)).toBeInTheDocument();
    },
};

/**
 * The field requires a crop of 16:9 or 1:1, and the image has none yet: the editor proposes the
 * largest 16:9 crop around the focal point.
 */
export const CropRequired: Story = {
    args: {
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        cropRequired: true,
        title: 'Crop for this use',
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement, 'Crop for this use');
        await expect(dialog.getByText(/this one is proposed around the focal point/)).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Apply' })).toBeEnabled();
    },
};

/** A crop is required, of any ratio, and none is made: Apply is disabled, and says why. */
export const CropRequiredAnyRatio: Story = {
    args: { cropRequired: true, title: 'Crop for this use' },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement, 'Crop for this use');
        await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled();
        await expect(dialog.getByText('Crop the image to apply.')).toBeVisible();
        // Shift + arrow keys resize the frame, which makes a crop.
        dialog.getByRole('group', { name: /^Crop, / }).focus();
        await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowUp}{/Shift}');
        await expect(dialog.getByRole('button', { name: 'Apply' })).toBeEnabled();
    },
};

/** Rotate and flip: the image shows as it will be rendered, and the crop follows it. */
export const RotateAndFlip: Story = {
    args: {
        initial: { ...harbourBanner, rotate: 90, flipX: true },
        initialTool: 'rotate',
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('button', { name: 'Flip horizontally' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        await expect(dialog.getByText(/Rotated 90°/)).toBeVisible();
    },
};

/** The focal point, with the automatic crops that keep it in view. */
export const FocalPoint: Story = {
    args: { initial: harbourBanner, initialTool: 'focal' },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('img', { name: 'Automatic 1:1 crop' })).toBeVisible();
        await expect(dialog.getByRole('textbox', { name: 'From the left' })).toHaveValue('68');
    },
};

/** The crop frame with the keyboard: arrow keys move it, Shift + arrow keys resize it. */
export const Keyboard: Story = {
    args: { initial: harbourBanner },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        const frame = dialog.getByRole('group', { name: /^Crop, / });
        frame.focus();
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        await expect(dialog.getByRole('textbox', { name: 'X' })).toHaveValue('1,020');
    },
};

/**
 * A photo stored sideways, which its library turns upright. The crop for this use applies over
 * the library's version, and the user can start from the original instead.
 */
export const OverTheLibraryVersion: Story = {
    args: {
        image: hiker,
        initial: { crop: { x: 0, y: 900, width: 3024, height: 1701 } },
        canChooseBase: true,
        title: 'Crop for this use',
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement, 'Crop for this use');
        await expect(dialog.getByRole('radio', { name: 'Library version' })).toBeChecked();
        await expect(dialog.getByText(/Starts from the library's version/)).toBeVisible();
    },
};

/** The same photo, from the original file: the library's edits don't apply. */
export const FromTheOriginal: Story = {
    args: { image: hiker, base: 'original', canChooseBase: true, title: 'Crop for this use' },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement, 'Crop for this use');
        await expect(dialog.getByRole('radio', { name: 'Original file' })).toBeChecked();
        await expect(dialog.getByText(/Starts from the original file/)).toBeVisible();
    },
};

/** The library's version changed since this crop was made: the crop was moved, check it. */
export const LibraryVersionChanged: Story = {
    args: {
        image: hiker,
        initial: { crop: { x: 0, y: 1200, width: 3024, height: 1701 } },
        mediaChanged: true,
        title: 'Crop for this use',
    },
};

/** In the dark scheme. */
export const Dark: Story = {
    args: { initial: harbourBanner },
    globals: { colorScheme: 'dark' },
};

/** On a phone: the image on top, the tools under it, full screen. */
export const PhoneCrop: Story = {
    args: {
        initial: harbourBanner,
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        title: 'Crop for this use',
    },
    globals: phone,
};

export const PhoneFocalPoint: Story = {
    args: { initial: harbourBanner, initialTool: 'focal' },
    globals: phone,
};

export const PhoneDark: Story = {
    args: { image: hiker, initial: { crop: { x: 0, y: 900, width: 3024, height: 1701 } } },
    globals: { ...phone, colorScheme: 'dark' },
};
