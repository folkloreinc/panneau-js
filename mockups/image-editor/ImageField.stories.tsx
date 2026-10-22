import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ImageFieldMockup } from './ImageFieldMockup';
import { citySquare, harbour, harbourBanner, hiker, lake } from './fixtures';

/**
 * Mockups of the `image` field (#100): a `media` field for images, with the editor. Static data,
 * no network. See `docs/mockups/image-field/` for their screenshots.
 */
const meta = {
    title: 'Mockups/Image field',
    component: ImageFieldMockup,
    args: {
        label: 'Cover',
        description: 'Shown at the top of the article and when it is shared.',
        ratios: ['16:9', '1:1'],
        enforceRatios: true,
        cropRequired: true,
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
} satisfies Meta<typeof ImageFieldMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

const phone = { viewport: { value: 'phone', isRotated: false } };

/** Empty, with the field's constraints next to its description. */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: 'Choose image' })).toBeVisible();
        await expect(canvas.getByText('16:9 or 1:1')).toBeVisible();
    },
};

/** An image cropped for this use: its preview is the crop, computed in the browser. */
export const WithImage: Story = {
    args: { value: [{ image: harbour, transform: harbourBanner }] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Cropped for this use')).toBeVisible();
        await expect(canvas.getByText(/2800 × 1575 · 16:9/)).toBeVisible();
    },
};

/** The field requires a crop, and this image has none: the field says so, and Edit leads. */
export const NeedsCrop: Story = {
    args: { value: [{ image: lake }] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Crop “mountain lake” to 16:9 or 1:1.')).toBeVisible();
        await expect(canvas.getByText('Needs a crop')).toBeVisible();
    },
};

/** A photo its library turned upright: the crop for this use applies over the library's edits. */
export const OverTheLibraryVersion: Story = {
    args: {
        transformBase: 'choose',
        value: [
            {
                image: hiker,
                transform: { crop: { x: 0, y: 900, width: 3024, height: 1701 } },
                base: 'media',
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Over the library’s edits')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
        const body = within(canvasElement.ownerDocument.body);
        const dialog = within(await body.findByRole('dialog', { name: 'Edit image' }));
        await expect(dialog.getByRole('radio', { name: 'Library version' })).toBeChecked();
    },
};

/** A gallery: each image has its own crop for this use. */
export const Gallery: Story = {
    args: {
        label: 'Gallery',
        description: undefined,
        multiple: true,
        ratios: ['4:3', '1:1', '3:4'],
        enforceRatios: false,
        cropRequired: false,
        value: [
            { image: harbour, transform: { crop: { x: 400, y: 0, width: 3000, height: 3000 } } },
            { image: hiker },
            { image: citySquare, transform: { rotate: 90 } },
            { image: lake, transform: { crop: { x: 0, y: 167, width: 4000, height: 2500 } } },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('button', { name: 'Edit hiker under the pine' }),
        ).toBeVisible();
        await expect(canvas.getByText('Suggested: 4:3, 1:1 or 3:4')).toBeVisible();
    },
};

/** Picking an image when the field requires a crop: the editor is the next step of the picker. */
export const PickThenCrop: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Choose image' }));
        const picker = within(await body.findByRole('dialog', { name: 'Choose image' }));
        await userEvent.click(await picker.findByRole('row', { name: 'harbour at dawn' }));
        await userEvent.click(picker.getByRole('button', { name: 'Next: crop' }));
        const crop = within(await body.findByRole('dialog', { name: 'Crop for this use' }));
        await expect(crop.getByRole('button', { name: 'Back to the library' })).toBeInTheDocument();
        // The editor proposes a crop of the field's first ratio.
        await expect(crop.getByRole('button', { name: 'Use this crop' })).toBeEnabled();
    },
};

/** Read-only: the image and its crop, without actions. */
export const ReadOnly: Story = {
    args: { readOnly: true, value: [{ image: harbour, transform: harbourBanner }] },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
    },
};

/** In the dark scheme. */
export const Dark: Story = {
    args: { value: [{ image: harbour, transform: harbourBanner }] },
    globals: { colorScheme: 'dark' },
};

/** On a phone. */
export const PhoneWithImage: Story = {
    args: { value: [{ image: harbour, transform: harbourBanner }] },
    globals: phone,
};

export const PhoneGallery: Story = {
    args: {
        label: 'Gallery',
        description: undefined,
        multiple: true,
        enforceRatios: false,
        cropRequired: false,
        value: [{ image: harbour, transform: harbourBanner }, { image: hiker }, { image: lake }],
    },
    globals: phone,
};
