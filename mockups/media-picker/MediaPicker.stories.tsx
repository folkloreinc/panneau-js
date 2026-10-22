import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { MediaPickerMockup } from './MediaPickerMockup';
import { documents, images, processing, rejected, uploaded, uploads } from './fixtures';

/**
 * Mockups of the media picker, for review before it is built: static data, no network. See
 * `docs/mockups/media-picker/` for their screenshots.
 */
const meta = {
    title: 'Mockups/Media picker',
    component: MediaPickerMockup,
    args: {
        libraries: [{ id: 'media', label: 'Media', items: images, total: 248 }],
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
} satisfies Meta<typeof MediaPickerMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An "Images" library, next to a "Documents" one. */
const visuals = images.filter((item) => ['image', 'video'].includes(item.media.type));

const phone = { viewport: { value: 'phone', isRotated: false } };

const selectedIds = (count: number, from = 0) =>
    images
        .filter((item) => item.media.type === 'image')
        .slice(from, from + count)
        .map((item) => item.id);

const countLabel = (count: number) => (count === 0 ? 'Use media' : `Use ${count} media`);

/** Single selection: one media selected, its details on the side. */
export const SingleSelection: Story = {
    args: { selected: selectedIds(1) },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('dialog', { name: 'Choose media' });
        await expect(within(dialog).getByRole('button', { name: 'Select' })).toBeEnabled();
        // Picking another media replaces the selection.
        await userEvent.click(within(dialog).getByRole('row', { name: 'autumn forest' }));
        await expect(within(dialog).getByText(/Selected:/)).toHaveTextContent('autumn forest');
    },
};

/** Nothing selected yet: the primary button is disabled. */
export const NothingSelected: Story = {
    play: async ({ canvasElement }) => {
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
        await expect(within(dialog).getByRole('button', { name: 'Select' })).toBeDisabled();
    },
};

/** Multiple selection, with a count, "Clear", and a label that counts. */
export const MultipleSelection: Story = {
    args: {
        multiple: true,
        title: 'Add media',
        confirmLabel: countLabel,
        selected: selectedIds(3),
    },
    play: async ({ canvasElement }) => {
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
        await expect(within(dialog).getByRole('button', { name: 'Use 3 media' })).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Clear' }));
        await expect(within(dialog).getByRole('button', { name: 'Use media' })).toBeDisabled();
    },
};

/** Opened from a field that has a media: it is marked "Current", and a pick replaces it. */
export const ReplaceCurrent: Story = {
    args: {
        title: 'Replace the cover',
        confirmLabel: 'Replace',
        current: [images[0]?.id ?? ''],
        selected: [images[2]?.id ?? ''],
    },
};

/** The field accepts images up to 5 MB: other media are greyed out, with the reason. */
export const AcceptAndMaxSize: Story = {
    args: {
        accept: ['image/*'],
        maxSize: 5 * 1024 * 1024,
        selected: selectedIds(1),
    },
};

/** Media still processing can be picked (proposal); a failed one can't. */
export const Processing: Story = {
    args: {
        libraries: [{ id: 'media', label: 'Media', items: [...processing, ...images], total: 251 }],
        selected: [processing[1]?.id ?? ''],
    },
};

/** The type filter and a search narrow the grid. */
export const Filtered: Story = {
    args: { type: 'image', query: 'a' },
};

/** A search that finds nothing. */
export const NoResults: Story = {
    args: { query: 'sunset' },
};

/** The first page is loading: skeletons. */
export const Loading: Story = {
    args: { state: 'loading' },
};

/** The first page failed to load, with a retry. */
export const LoadError: Story = {
    args: { state: 'error' },
};

/** An empty library, with a call to upload. */
export const EmptyLibrary: Story = {
    args: { libraries: [{ id: 'media', label: 'Media', items: [] }] },
    play: async ({ canvasElement }) => {
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Upload files' }));
        await expect(within(dialog).getByRole('tab', { name: 'Upload' })).toHaveAttribute(
            'aria-selected',
            'true',
        );
    },
};

/** The user can't add media to the library: the Upload tab is disabled, with the reason. */
export const NoUploadPermission: Story = {
    args: {
        libraries: [{ id: 'media', label: 'Media', items: images, total: 248, canCreate: false }],
    },
    play: async ({ canvasElement }) => {
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
        await expect(within(dialog).getByRole('tab', { name: 'Upload' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    },
};

/** An empty library the user can't add to. */
export const EmptyWithoutPermission: Story = {
    args: { libraries: [{ id: 'media', label: 'Media', items: [], canCreate: false }] },
};

/**
 * The Upload tab: files being sent (pause, resume, cancel, retry), files refused before sending,
 * and the media they became, selected.
 */
export const Upload: Story = {
    args: {
        multiple: true,
        title: 'Add media',
        confirmLabel: countLabel,
        tab: 'upload',
        uploads,
        rejected,
        uploaded,
        selected: uploaded.map((item) => item.id),
    },
};

/** Two libraries: a segmented control. Uploads go to the library shown. */
export const TwoLibraries: Story = {
    args: {
        libraries: [
            { id: 'images', label: 'Images', items: visuals, total: 196 },
            { id: 'documents', label: 'Documents', items: documents },
        ],
        library: 'documents',
        selected: [documents[0]?.id ?? ''],
    },
};

/** More libraries, with the project's names: a select. */
export const ManyLibraries: Story = {
    args: {
        libraries: [
            { id: 'media', label: 'Médiathèque', items: images, total: 248 },
            { id: 'documents', label: 'Fichiers', items: documents },
            { id: 'brand', label: 'Brand assets', items: images.slice(3, 6) },
            { id: 'podcasts', label: 'Podcasts', items: images.slice(8, 9) },
        ],
        selected: selectedIds(1, 2),
    },
};

/**
 * Opened by a product's own screen (an editor inserting an image), with its title and button, in
 * the reference theme: nothing in the picker is Panneau's admin.
 */
export const OpenedByAProduct: Story = {
    args: {
        title: 'Insert an image',
        confirmLabel: 'Insert',
        accept: ['image/*'],
        type: 'image',
        selected: selectedIds(1, 3),
    },
    globals: { theme: 'reference' },
};

export const DarkSingle: Story = {
    ...SingleSelection,
    play: undefined,
    globals: { colorScheme: 'dark' },
};

export const DarkMultiple: Story = {
    ...MultipleSelection,
    play: undefined,
    globals: { colorScheme: 'dark' },
};

export const DarkUpload: Story = {
    ...Upload,
    globals: { colorScheme: 'dark' },
};

export const DarkProcessing: Story = {
    ...Processing,
    globals: { colorScheme: 'dark' },
};

export const PhoneSingle: Story = {
    ...SingleSelection,
    play: undefined,
    globals: phone,
};

export const PhoneMultiple: Story = {
    ...MultipleSelection,
    play: undefined,
    globals: phone,
};

export const PhoneUpload: Story = {
    ...Upload,
    globals: phone,
};

export const PhoneTwoLibraries: Story = {
    ...TwoLibraries,
    globals: phone,
};

export const PhoneEmpty: Story = {
    ...EmptyLibrary,
    play: undefined,
    globals: phone,
};

export const PhoneDark: Story = {
    ...MultipleSelection,
    play: undefined,
    globals: { ...phone, colorScheme: 'dark' },
};
