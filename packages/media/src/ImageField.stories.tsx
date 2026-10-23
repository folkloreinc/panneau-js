import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import type { MediaReference } from '@panneau/protocol';

import { ImageField } from './MediaField';
import { harbour, harbourBanner, hiker, referenceTo } from './__fixtures__/images';
import { createMemorySource, libraryMedia } from './__fixtures__/mediaSources';

const cover = referenceTo(harbour, 'med_h', { transform: harbourBanner });

/** An image field with its value in state, on a library of the fixtures. */
function Cover({
    initial,
    readOnly = false,
    cropRequired = true,
}: {
    initial: MediaReference | null;
    readOnly?: boolean;
    cropRequired?: boolean;
}) {
    const [value, setValue] = useState(initial);
    const [sources] = useState(() => [
        createMemorySource({ id: 'media', label: 'Media', items: libraryMedia }),
    ]);
    return (
        <ImageField
            label="Cover"
            description="Shown at the top of the article and when it is shared."
            resource="media"
            adapter={null}
            sources={sources}
            readOnly={readOnly}
            value={value}
            onChange={setValue}
            ratios={['16:9', '1:1']}
            enforceRatios
            cropRequired={cropRequired}
        />
    );
}

const meta = {
    title: 'Media/ImageField',
    component: ImageField,
    args: { label: 'Cover', resource: 'media' },
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
} satisfies Meta<typeof ImageField>;

export default meta;
type Story = StoryObj<typeof meta>;

const phone = { viewport: { value: 'phone', isRotated: false } };

/** An image cropped for this use: its preview is the crop, computed in the browser. */
export const WithImage: Story = {
    render: () => <Cover initial={cover} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Cropped for this use')).toBeVisible();
        await expect(canvas.getByText('16:9 or 1:1')).toBeVisible();
        await expect(canvas.getByText(/2,?800 × 1,?575 · 16:9/)).toBeVisible();
    },
};

/** Edit opens the editor on the transform for this use, and Apply keeps it. */
export const Edit: Story = {
    render: () => <Cover initial={cover} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Edit harbour at dawn' }));
        const dialog = await screen.findByRole('dialog', { name: 'Edit image' });
        await waitFor(() => expect(dialog).toBeVisible());
        await userEvent.click(within(dialog).getByRole('radio', { name: '1:1' }));
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        await expect(canvas.getByText(/3,?000 × 3,?000 · 1:1/)).toBeVisible();
    },
};

/** The field requires a crop: the editor is the step right after the pick of an image. */
export const PickThenCrop: Story = {
    render: () => <Cover initial={null} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Choose image' }));
        const picker = within(await screen.findByRole('dialog', { name: 'Choose image' }));
        await userEvent.click(await picker.findByRole('row', { name: 'autumn forest' }));
        await userEvent.click(picker.getByRole('button', { name: 'Next: crop' }));
        const crop = within(await screen.findByRole('dialog', { name: 'Crop for this use' }));
        await expect(crop.getByRole('button', { name: 'Back to the library' })).toBeInTheDocument();
        await expect(crop.getByRole('button', { name: 'Use this crop' })).toBeEnabled();
    },
};

/** The image has no crop yet, and the field requires one: Edit leads. */
export const NeedsCrop: Story = {
    render: () => <Cover initial={referenceTo(harbour, 'med_h')} />,
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText('Needs a crop')).toBeVisible();
    },
};

/** The library's version changed since the crop was made: the field asks to check it. */
export const LibraryVersionChanged: Story = {
    render: () => (
        <Cover
            initial={referenceTo(hiker, 'med_k', {
                transform: {
                    base: 'media',
                    baseTransform: { rotate: 270 },
                    crop: { x: 0, y: 900, width: 3024, height: 1701 },
                },
            })}
        />
    ),
    play: async ({ canvasElement }) => {
        await expect(
            within(canvasElement).getByText('Library version changed: check the crop'),
        ).toBeVisible();
    },
};

/** A gallery: each image has its own crop for this use. */
export const Gallery: Story = {
    render: function Render() {
        const [value, setValue] = useState<MediaReference[] | null>([
            cover,
            referenceTo(hiker, 'med_k'),
            referenceTo(harbour, 'med_r', { label: 'harbour, turned', transform: { rotate: 90 } }),
        ]);
        return (
            <ImageField
                label="Gallery"
                resource="media"
                multiple
                adapter={null}
                value={value}
                onChange={setValue}
                ratios={['4:3', '1:1', '3:4']}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Suggested: 4:3, 1:1, or 3:4')).toBeVisible();
        await expect(
            canvas.getByRole('button', { name: 'Edit hiker under the pine' }),
        ).toBeVisible();
    },
};

/** Without an image yet. */
export const Empty: Story = {
    render: () => <Cover initial={null} cropRequired={false} />,
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText('No image')).toBeVisible();
    },
};

/** Read-only: the image as it is rendered, without actions. */
export const ReadOnly: Story = {
    render: () => <Cover initial={cover} readOnly />,
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
    },
};

/** In the dark scheme. */
export const Dark: Story = {
    render: () => <Cover initial={cover} />,
    globals: { colorScheme: 'dark' },
};

/** On a phone. */
export const PhoneWithImage: Story = {
    render: () => <Cover initial={cover} />,
    globals: phone,
};
