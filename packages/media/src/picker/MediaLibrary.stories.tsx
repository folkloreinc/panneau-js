import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import {
    createMemorySource,
    documentMedia,
    instantUploadSource,
    libraryMedia,
} from '../__fixtures__/mediaSources';
import { MediaLibrary } from './MediaLibrary';

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
        perPage: 8,
    });

const documents = () =>
    createMemorySource({ id: 'documents', label: 'Documents', items: documentMedia });

const meta = {
    title: 'Media/MediaLibrary',
    component: MediaLibrary,
    args: {
        sources: [media()],
        uploadSource: instantUploadSource,
    },
    parameters: {
        layout: 'padded',
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
} satisfies Meta<typeof MediaLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The library as a page: a click opens the details of a media, which edit its fields. */
export const Page: Story = {
    play: async ({ canvasElement }) => {
        const library = within(canvasElement).getByRole('region', { name: 'Media' });
        await userEvent.click(await within(library).findByRole('row', { name: 'autumn forest' }));
        await expect(
            within(canvasElement).getByRole('complementary', { name: 'Details of autumn forest' }),
        ).toBeInTheDocument();
        await expect(within(library).queryByRole('button', { name: 'Select' })).toBeNull();
    },
};

/** Two libraries, switched from the header. */
export const TwoLibraries: Story = {
    args: { sources: [media(), documents()], 'aria-label': 'Library' },
};

export const Loading: Story = {
    args: {
        sources: [createMemorySource({ id: 'media', label: 'Media', items: [], list: 'loading' })],
    },
    play: async ({ canvasElement }) => {
        const library = within(canvasElement).getByRole('region', { name: 'Media' });
        await expect(within(library).getByText('Loading media…')).toHaveAttribute('role', 'status');
        const region = library.querySelector('[aria-busy="true"]');
        await expect(region?.querySelectorAll('.panneau-skeleton').length).toBeGreaterThan(0);
    },
};

/** An empty library, with a call to upload. */
export const Empty: Story = {
    args: { sources: [createMemorySource({ id: 'media', label: 'Media', items: [] })] },
};

/** On phones, the details open over the grid. */
export const Phone: Story = {
    globals: { viewport: { value: 'phone', isRotated: false } },
};

export const Dark: Story = {
    globals: { colorScheme: 'dark' },
};
