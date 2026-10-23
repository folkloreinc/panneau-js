import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stamp } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Text } from '@panneau/ui';

import { harbour, harbourBanner, hiker } from '../__fixtures__/images';
import { ImageEditor } from './ImageEditor';

const meta = {
    title: 'Media/ImageEditor',
    component: ImageEditor,
    args: {
        onApply: fn(),
        image: harbour,
        value: null,
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
} satisfies Meta<typeof ImageEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const phone = { viewport: { value: 'phone', isRotated: false } };

/** The editor, in the page. */
async function editor(canvasElement: HTMLElement) {
    return within(await within(canvasElement).findByRole('group', { name: 'Edit image' }));
}

/** A free crop: the frame, its handles and the thirds, with common ratios on the side. */
export const Crop: Story = {
    args: { value: { crop: { x: 900, y: 450, width: 2600, height: 1800 } } },
    play: async ({ canvasElement, args }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('radio', { name: 'Free' })).toBeChecked();
        await expect(dialog.getByRole('textbox', { name: 'Width' })).toHaveValue('2,600');
        await userEvent.click(dialog.getByRole('button', { name: 'Apply' }));
        await expect(args.onApply).toHaveBeenCalledWith({
            crop: { x: 900, y: 450, width: 2600, height: 1800 },
        });
    },
};

/** The field allows 16:9 or 1:1: only those ratios, and the frame keeps the ratio chosen. */
export const FieldRatios: Story = {
    args: {
        value: harbourBanner,
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
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
export const RequiredCrop: Story = {
    args: {
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        cropRequired: true,
        applyLabel: 'Use this crop',
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByText(/this one is proposed around the focal point/)).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Use this crop' })).toBeEnabled();
    },
};

/** A crop is required, of any ratio, and none is made: Apply is disabled, and says why. */
export const RequiredCropAnyRatio: Story = {
    args: { cropRequired: true },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled();
        await expect(dialog.getByText('Crop the image to apply.')).toBeVisible();
        // Shift + arrow keys resize the frame, which makes a crop.
        dialog.getByRole('group', { name: /^Crop, / }).focus();
        await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowUp}{/Shift}');
        await expect(dialog.getByRole('button', { name: 'Apply' })).toBeEnabled();
    },
};

/** The crop frame with the keyboard: arrow keys move it, Shift + arrow keys resize it. */
export const Keyboard: Story = {
    args: { value: harbourBanner },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        dialog.getByRole('group', { name: /^Crop, / }).focus();
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        await expect(dialog.getByRole('textbox', { name: 'X' })).toHaveValue('1,020');
    },
};

/** Rotate and flip: the image shows as it will be rendered, and the crop follows it. */
export const RotateAndFlip: Story = {
    args: { value: { ...harbourBanner, rotate: 90, flipX: true }, ratios: ['16:9', '9:16'] },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await userEvent.click(dialog.getByRole('radio', { name: 'Rotate' }));
        await expect(dialog.getByRole('button', { name: 'Flip horizontally' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        await expect(dialog.getByText(/Rotated 90°/)).toBeVisible();
    },
};

/** The focal point, with the automatic crops that keep it in view. */
export const FocalPoint: Story = {
    args: { value: harbourBanner },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await userEvent.click(dialog.getByRole('radio', { name: 'Focal point' }));
        await expect(dialog.getByRole('img', { name: 'Automatic 1:1 crop' })).toBeVisible();
        await expect(dialog.getByRole('textbox', { name: 'From the left' })).toHaveValue('68');
        dialog.getByRole('group', { name: /^Focal point, / }).focus();
        await userEvent.keyboard('{ArrowRight}');
        await expect(dialog.getByRole('textbox', { name: 'From the left' })).toHaveValue('69');
    },
};

/**
 * A photo stored sideways, which its library turns upright: the crop for this use applies over
 * the library's version, and the user can start from the original file instead.
 */
export const OverTheLibraryVersion: Story = {
    args: {
        image: hiker,
        value: {
            base: 'media',
            baseTransform: { rotate: 90 },
            crop: { x: 0, y: 900, width: 3024, height: 1701 },
        },
        canChooseBase: true,
    },
    play: async ({ canvasElement, args }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('radio', { name: 'Library version' })).toBeChecked();
        await userEvent.click(dialog.getByRole('button', { name: 'Apply' }));
        await expect(args.onApply).toHaveBeenCalledWith(
            expect.objectContaining({ base: 'media', baseTransform: { rotate: 90 } }),
        );
    },
};

/** The same photo, from the original file: the library's edits don't apply. */
export const FromTheOriginal: Story = {
    args: { image: hiker, value: { rotate: 90 }, canChooseBase: true },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('radio', { name: 'Original file' })).toBeChecked();
        await expect(dialog.getByText(/Starts from the original file/)).toBeVisible();
    },
};

/** The library's version changed since this crop was made: the crop was moved, check it. */
export const LibraryVersionChanged: Story = {
    args: {
        image: hiker,
        value: {
            base: 'media',
            baseTransform: { rotate: 270 },
            crop: { x: 0, y: 3500, width: 3024, height: 1701 },
        },
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByText('The library’s version of this image changed')).toBeVisible();
    },
};

/** A product's own tool, next to the crop: its panel, and what it requires before applying. */
export const ProductTool: Story = {
    render: function Render(args) {
        return (
            <ImageEditor
                {...args}
                tools={[
                    {
                        id: 'stamp',
                        label: 'Stamp',
                        icon: Stamp,
                        renderPanel: (context) => (
                            <Text size="sm">
                                {context.transform.stamp === undefined
                                    ? 'No stamp yet.'
                                    : 'Stamped.'}
                            </Text>
                        ),
                        validate: (transform) =>
                            transform.stamp === undefined ? 'Add a stamp.' : null,
                    },
                ]}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByText('No stamp yet.')).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled();
    },
};

/** In the dark scheme. */
export const Dark: Story = {
    args: { value: harbourBanner },
    globals: { colorScheme: 'dark' },
};

/** In a narrow panel: the image on top, the tools under it, as on a phone. */
export const InANarrowPanel: Story = {
    args: { value: harbourBanner, ratios: ['16:9', '1:1'], enforceRatios: true },
    render: (args) => (
        <div style={{ width: '24rem', maxWidth: '100%' }}>
            <ImageEditor {...args} />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const dialog = await editor(canvasElement);
        await expect(dialog.getByRole('radio', { name: '16:9' })).toBeChecked();
    },
};

/** On a phone. */
export const Phone: Story = {
    args: { image: hiker, value: null, onCancel: fn() },
    globals: phone,
};
