import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import type { MediaReference } from '@panneau/protocol';

import { ImageField } from './MediaField';
import {
    harbour,
    harbourBanner,
    harbourSquareThumbnail,
    harbourThumbnail,
    hiker,
    referenceTo,
} from './__fixtures__/images';
import { createMemorySource, libraryMedia } from './__fixtures__/mediaSources';
import { afterSlides, dragHandle } from './__fixtures__/reorder';

const cover = referenceTo(harbour, 'med_h', { transform: harbourBanner });

/** The cover, with a thumbnail smaller than the original. */
const withThumbnail = (thumbnailUrl: string): MediaReference => ({
    ...cover,
    media: { ...cover.media, type: 'image', thumbnailUrl },
});

/** The URLs of the images a part of the page draws. */
const drawnUrls = (element: Element) =>
    Array.from(element.querySelectorAll('image, img'), (image) =>
        image instanceof HTMLImageElement ? image.src : image.getAttribute('href'),
    );

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

/**
 * The image has a thumbnail: its preview draws it, at the size of the original, with the same crop.
 * The original is only loaded by the editor.
 */
export const WithThumbnail: Story = {
    render: () => <Cover initial={withThumbnail(harbourThumbnail)} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const preview = canvasElement.querySelector('li svg');
        await expect(preview).not.toBeNull();
        // The crop of the original, drawn over the thumbnail stretched to the original's size.
        await expect(preview?.getAttribute('viewBox')).toBe('1100 600 2800 1575');
        const image = preview?.querySelector('image');
        await expect(image?.getAttribute('width')).toBe('4000');
        await expect(image?.getAttribute('height')).toBe('3000');
        await expect(canvas.getByText(/2,?800 × 1,?575 · 16:9/)).toBeVisible();
        // The thumbnail has the proportions of the original: it stays, once it has loaded.
        await new Promise((resolve) => {
            const loaded = new Image();
            loaded.onload = resolve;
            loaded.src = harbourThumbnail;
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        await expect(drawnUrls(canvasElement.ownerDocument.body)).toEqual([harbourThumbnail]);

        await userEvent.click(canvas.getByRole('button', { name: 'Edit harbour at dawn' }));
        const dialog = await screen.findByRole('dialog', { name: 'Edit image' });
        await expect(drawnUrls(dialog)).toContain(harbour.url);
        await expect(drawnUrls(dialog)).not.toContain(harbourThumbnail);
    },
};

/** A thumbnail without the proportions of the original: the preview draws the original. */
export const WithSquareThumbnail: Story = {
    render: () => <Cover initial={withThumbnail(harbourSquareThumbnail)} />,
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(drawnUrls(canvasElement.querySelector('li svg') ?? canvasElement)).toEqual([
                harbour.url,
            ]),
        );
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

const handleNames = (element: HTMLElement) =>
    [...element.querySelectorAll('[data-reorder-handle]')].map((handle) =>
        handle.getAttribute('aria-label'),
    );

function ReorderableGallery() {
    const [value, setValue] = useState<MediaReference[] | null>([
        referenceTo(harbour, 'med_1', { label: 'harbour' }),
        referenceTo(hiker, 'med_2', { label: 'hiker' }),
        referenceTo(harbour, 'med_3', { label: 'lighthouse', transform: harbourBanner }),
        referenceTo(hiker, 'med_4', { label: 'summit' }),
    ]);
    return (
        <ImageField
            label="Gallery"
            resource="media"
            multiple
            adapter={null}
            value={value}
            onChange={setValue}
        />
    );
}

/**
 * The images of a gallery reorder (decision 0111): by the handle at the start of their name, with
 * the pointer, on the side of a tile in its row, or the keyboard; or from the menu of moves at the
 * end of their name. The tools over the image stay as they are.
 */
export const ReorderGallery: Story = {
    render: () => (
        <div style={{ maxWidth: '40rem' }}>
            <ReorderableGallery />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('list')).toHaveAttribute('data-layout', 'grid');

        // The pointer: on the left half of the first tile, in its row
        const [first] = canvas.getAllByRole('listitem') as HTMLElement[];
        const rect = (first as HTMLElement).getBoundingClientRect();
        await dragHandle(
            canvas.getByRole('button', { name: 'Move lighthouse' }),
            first as HTMLElement,
            rect.top + rect.height / 2,
            rect.left + 8,
        );
        await waitFor(() =>
            expect(handleNames(canvasElement)).toEqual([
                'Move lighthouse',
                'Move harbour',
                'Move hiker',
                'Move summit',
            ]),
        );
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'lighthouse moved to position 1 of 4',
        );
        await afterSlides();

        // The keyboard: the arrows go from one place to the next
        canvas.getByRole('button', { name: 'Move summit' }).focus();
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        for (let step = 0; step < 5; step += 1) {
            if (document.activeElement?.getAttribute('aria-label') === 'Before harbour') {
                break;
            }
            await userEvent.keyboard('{ArrowRight}');
            await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        await expect(document.activeElement).toHaveAccessibleName('Before harbour');
        await userEvent.keyboard('{Enter}');
        await waitFor(() =>
            expect(handleNames(canvasElement)).toEqual([
                'Move lighthouse',
                'Move summit',
                'Move harbour',
                'Move hiker',
            ]),
        );
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move summit' })).toHaveFocus(),
        );
        await afterSlides();

        // The menu
        await userEvent.click(canvas.getByRole('button', { name: 'Reorder lighthouse' }));
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Move to the end' }));
        await waitFor(() =>
            expect(handleNames(canvasElement)).toEqual([
                'Move summit',
                'Move harbour',
                'Move hiker',
                'Move lighthouse',
            ]),
        );
    },
};

/** In a narrow column, as the sidebar of a form: two tiles a row, which keep their tools. */
export const ReorderGalleryInANarrowColumn: Story = {
    render: () => (
        <div style={{ maxWidth: '18rem' }}>
            <ReorderableGallery />
        </div>
    ),
    play: async ({ canvasElement }) => {
        for (const tile of canvasElement.querySelectorAll<HTMLElement>('li')) {
            await expect(tile.scrollWidth).toBeLessThanOrEqual(tile.clientWidth);
            const handle = tile.querySelector('[data-reorder-handle]');
            const menu = tile.querySelector('.panneau-reorder-menu');
            await expect(handle).toBeVisible();
            await expect(menu).toBeVisible();
        }
    },
};

/** A field whose values keep no transform: the image as the media is, without Edit (decision 0087). */
export const WithoutTransforms: Story = {
    render: function Render() {
        const [value, setValue] = useState<MediaReference | null>(cover);
        return (
            <ImageField
                label="Photo"
                resource="media"
                adapter={null}
                value={value}
                onChange={setValue}
                transforms={false}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/4,?000 × 3,?000 · 4:3/)).toBeVisible();
        await expect(canvas.queryByText('Cropped for this use')).not.toBeInTheDocument();
        await expect(
            canvas.queryByRole('button', { name: 'Edit harbour at dawn' }),
        ).not.toBeInTheDocument();
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
