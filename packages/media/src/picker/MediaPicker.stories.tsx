import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import {
    createMemorySource,
    documentMedia,
    instantUploadSource,
    libraryMedia,
} from '../__fixtures__/mediaSources';
import { MediaPicker } from './MediaPicker';

const fields: Field[] = [
    { name: 'name', type: 'text', label: 'Title' },
    { name: 'alt', type: 'text', label: 'Alt text' },
    { name: 'description', type: 'textarea', label: 'Description' },
];

const media = () =>
    createMemorySource({
        id: 'media',
        label: 'Media',
        items: libraryMedia,
        fields,
        filters: [
            {
                id: 'tags',
                type: 'select',
                label: 'Tags',
                multiple: true,
                options: [
                    { value: 'nature', label: 'Nature' },
                    { value: 'harbour', label: 'Harbour' },
                ],
            },
        ],
    });

const documents = () =>
    createMemorySource({ id: 'documents', label: 'Documents', items: documentMedia });

const meta = {
    title: 'Media/MediaPicker',
    component: MediaPicker,
    args: {
        isOpen: true,
        sources: [media()],
        uploadSource: instantUploadSource,
        onOpenChange: fn(),
        onSelect: fn(),
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
} satisfies Meta<typeof MediaPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

/** One media: a click selects it, its details show, and "Select" returns it with its library. */
export const Single: Story = {
    play: async ({ args, canvasElement }) => {
        const dialog = await body(canvasElement).findByRole('dialog', { name: 'Choose media' });
        await userEvent.click(await within(dialog).findByRole('row', { name: 'autumn forest' }));
        await expect(
            within(dialog).getByRole('complementary', { name: 'Details of autumn forest' }),
        ).toBeInTheDocument();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Select' }));
        await expect(args.onSelect).toHaveBeenCalledWith([
            expect.objectContaining({ id: 'med_03', resource: 'media' }),
        ]);
    },
};

/** Several media, with a count and "Clear", and a label that counts. */
export const Multiple: Story = {
    args: {
        multiple: true,
        title: 'Add media',
        confirmLabel: (count) => (count === 0 ? 'Use media' : `Use ${String(count)} media`),
    },
    play: async ({ canvasElement }) => {
        const dialog = await body(canvasElement).findByRole('dialog', { name: 'Add media' });
        await userEvent.click(await within(dialog).findByRole('row', { name: 'harbour at dawn' }));
        await userEvent.click(within(dialog).getByRole('row', { name: 'team portrait' }));
        await expect(within(dialog).getByText('2 selected')).toBeInTheDocument();
        await expect(within(dialog).getByRole('button', { name: 'Use 2 media' })).toBeEnabled();
    },
};

/** The opener's value is marked "Current", and a single pick replaces it. */
export const ReplaceCurrent: Story = {
    args: {
        title: 'Replace the cover',
        confirmLabel: 'Replace',
        value: [{ id: 'med_01', resource: 'media' }],
    },
};

/** The opener accepts images up to 5 MB: other media are greyed out, with the reason. */
export const AcceptAndMaxSize: Story = {
    args: { accept: ['image/*'], maxSize: 5 * 1024 * 1024 },
};

/**
 * The library's filters, and a filter the opener applies, which the user can't change. Sorts come
 * from the source.
 */
export const Filters: Story = {
    args: { filter: { type: 'image' } },
    play: async ({ canvasElement }) => {
        const dialog = await body(canvasElement).findByRole('dialog', { name: 'Choose media' });
        await within(dialog).findByRole('row', { name: 'autumn forest' });
        await expect(within(dialog).queryByRole('row', { name: 'press kit' })).toBeNull();
        await expect(within(dialog).getByText('Type: Images')).toBeInTheDocument();
    },
};

/** Two libraries: a segmented control in the header, and a selection across both. */
export const TwoLibraries: Story = {
    args: { sources: [media(), documents()], multiple: true },
    play: async ({ canvasElement }) => {
        const dialog = await body(canvasElement).findByRole('dialog', { name: 'Choose media' });
        await userEvent.click(await within(dialog).findByRole('row', { name: 'harbour at dawn' }));
        await userEvent.click(within(dialog).getByRole('radio', { name: 'Documents' }));
        await userEvent.click(
            await within(dialog).findByRole('row', { name: 'annual report 2025' }),
        );
        await expect(within(dialog).getByText('2 selected in 2 libraries')).toBeInTheDocument();
    },
};

/** More libraries: a select. */
export const ManyLibraries: Story = {
    args: {
        sources: [
            media(),
            documents(),
            createMemorySource({
                id: 'brand',
                label: 'Brand assets',
                items: libraryMedia.slice(0, 3),
            }),
            createMemorySource({
                id: 'podcasts',
                label: 'Podcasts',
                items: libraryMedia.slice(6, 7),
            }),
        ],
    },
};

/** The Upload tab: a file becomes a media of the library shown, and is selected. */
export const Upload: Story = {
    args: { multiple: true },
    play: async ({ canvasElement }) => {
        const dialog = await body(canvasElement).findByRole('dialog', { name: 'Choose media' });
        await userEvent.click(within(dialog).getByRole('tab', { name: 'Upload' }));
        const input = dialog.querySelector<HTMLInputElement>('input[type="file"]');
        if (input === null) {
            throw new Error('No file input.');
        }
        await userEvent.upload(input, new File(['image'], 'poster.jpg', { type: 'image/jpeg' }));
        await waitFor(() =>
            expect(within(dialog).getByRole('row', { name: 'poster' })).toHaveAttribute(
                'aria-selected',
                'true',
            ),
        );
    },
};

/** With `confirmOnUpload`, a single uploaded media is used at once. */
export const ConfirmOnUpload: Story = {
    args: {
        title: 'Insert an image',
        confirmLabel: 'Insert',
        accept: ['image/*'],
        confirmOnUpload: true,
    },
};

export const Loading: Story = {
    args: {
        sources: [createMemorySource({ id: 'media', label: 'Media', items: [], list: 'loading' })],
    },
};

export const LoadError: Story = {
    args: {
        sources: [createMemorySource({ id: 'media', label: 'Media', items: [], list: 'error' })],
    },
    play: async ({ canvasElement }) => {
        await expect(await body(canvasElement).findByRole('alert')).toHaveTextContent(
            'The media couldn’t be loaded',
        );
    },
};

/** An empty library, with a call to upload. */
export const EmptyLibrary: Story = {
    args: { sources: [createMemorySource({ id: 'media', label: 'Media', items: [] })] },
};

/** The user can't add media to the library: the Upload tab is disabled, with the reason. */
export const NoUploadPermission: Story = {
    args: {
        sources: [
            createMemorySource({
                id: 'media',
                label: 'Media',
                items: libraryMedia,
                canCreate: false,
            }),
        ],
    },
};

/** On phones: a full-screen sheet, and the details open over the grid from each card. */
export const Phone: Story = {
    args: { sources: [media(), documents()] },
    globals: { viewport: { value: 'phone', isRotated: false } },
};

export const Dark: Story = {
    args: { multiple: true },
    globals: { colorScheme: 'dark' },
};
