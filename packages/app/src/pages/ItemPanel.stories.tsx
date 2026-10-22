/**
 * The details of an item next to its list, as the show route opens them: fetched through the REST
 * adapter of `@panneau/data` from the mock backend of `@panneau/protocol`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { resolveResource } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { ItemPanel } from './ItemPanel';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    api: { baseUrl: '/api' },
    resources: [
        {
            id: 'articles',
            label: { singular: 'article', plural: 'articles' },
            itemTitle: 'title',
            fields: [
                { name: 'title', type: 'text', label: 'Title' },
                {
                    name: 'status',
                    type: 'select',
                    label: 'Status',
                    options: [
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                    ],
                },
                { name: 'published_at', type: 'date', label: 'Publication date' },
                { name: 'featured', type: 'boolean', label: 'Featured' },
            ],
            actions: [
                {
                    id: 'view',
                    label: 'View on the site',
                    kind: 'link',
                    url: 'https://example.com/articles/{id}',
                    scope: ['item'],
                },
            ],
        },
    ],
};

function createSetup() {
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    const backend = createMockBackend({
        definition: input,
        items: {
            articles: [
                {
                    id: '1',
                    title: 'The river festival returns',
                    status: 'published',
                    published_at: '2026-10-28',
                    featured: true,
                },
            ],
        },
    });
    return {
        resource: result.data.resources[0],
        adapter: createRestAdapter({ baseUrl: '/api', fetch: backend.fetch }),
        client: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    };
}

function Panel() {
    const [{ resource, adapter, client }] = useState(createSetup);
    if (resource === undefined) {
        return null;
    }
    return (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <RouterProvider navigate={() => undefined}>
                    <ItemPanel
                        resolved={resolveResource(resource)}
                        basePath="/admin"
                        locale="en"
                        id="1"
                        closeHref="/admin/resources/articles"
                    />
                </RouterProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Item panel',
    component: Panel,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const panel = canvas.getByRole('region', { name: 'Details of the article' });
        await expect(
            await within(panel).findByRole('heading', { name: 'The river festival returns' }),
        ).toBeInTheDocument();
        await expect(within(panel).getByRole('link', { name: 'Edit' })).toHaveAttribute(
            'href',
            '/admin/resources/articles/1/edit',
        );
        await expect(within(panel).getByRole('link', { name: 'View on the site' })).toHaveAttribute(
            'href',
            'https://example.com/articles/1',
        );
        await expect(within(panel).getAllByRole('term')).toHaveLength(4);
    },
};
