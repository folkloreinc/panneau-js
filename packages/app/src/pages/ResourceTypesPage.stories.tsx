/**
 * The create route of a resource with types (decision 0075), without a type: a card for each type
 * the user can create, which opens its form.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouterProvider } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { resolveResource } from '@panneau/core';
import { Resource } from '@panneau/protocol';

import { ResourceTypesPage } from './ResourceTypesPage';

const pages = Resource.parse({
    id: 'pages',
    label: { singular: 'page', plural: 'pages' },
    fields: [{ name: 'title', type: 'text' }],
    types: [
        { id: 'home', label: 'Home page', fields: [], abilities: { create: false } },
        {
            id: 'event',
            label: 'Event',
            icon: 'calendar',
            description: 'A date, a place and a ticket link',
            fields: [{ name: 'starts_at', type: 'datetime' }],
        },
        {
            id: 'article',
            label: 'Article',
            icon: 'newspaper',
            description: 'A story with an author',
            fields: [{ name: 'author', type: 'text' }],
        },
        { id: 'contact', label: 'Contact', fields: [] },
    ],
});

const meta = {
    title: 'App/Resource types page',
    component: ResourceTypesPage,
    parameters: { layout: 'padded' },
    args: { resolved: resolveResource(pages), basePath: '/admin', locale: 'en' },
    decorators: [
        (Story) => (
            <RouterProvider navigate={() => undefined}>
                <Story />
            </RouterProvider>
        ),
    ],
} satisfies Meta<typeof ResourceTypesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The home page is a singleton: it isn't offered. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('New page');
        const links = canvas.getAllByRole('link').filter((link) => link.closest('li') !== null);
        await expect(links.map((link) => link.getAttribute('href'))).toEqual([
            '/admin/resources/pages/create/event',
            '/admin/resources/pages/create/article',
            '/admin/resources/pages/create/contact',
        ]);
        await expect(canvas.queryByRole('link', { name: /Home page/ })).toBeNull();
    },
};
