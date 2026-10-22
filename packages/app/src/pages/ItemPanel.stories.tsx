/**
 * The details of an item next to its list, as the show route opens them: fetched through the REST
 * adapter of `@panneau/data` from the mock backend of `@panneau/protocol`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { PanneauProvider, type PreviewProps, resolveResource } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { ItemPanel } from './ItemPanel';

type PreviewMode = 'none' | 'component' | 'iframe';

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

/** The article as the site shows it: what a project's plugin registers in `previews`. */
function ArticlePreview({ item }: PreviewProps) {
    return (
        <article style={{ padding: '1.5rem', background: '#fffbf5', color: '#1c1917' }}>
            <p style={{ font: '700 0.75rem system-ui', letterSpacing: '0.2em' }}>NORTHWIND</p>
            <h1 style={{ fontFamily: 'Georgia, serif' }}>{String(item.title)}</h1>
        </article>
    );
}

function createSetup(mode: PreviewMode) {
    const resourceInput = input.resources[0];
    const definition: DefinitionInput = {
        ...input,
        resources:
            resourceInput !== undefined
                ? [
                      {
                          ...resourceInput,
                          features: {
                              preview:
                                  mode === 'none'
                                      ? null
                                      : mode === 'component'
                                        ? { mode: 'component', component: 'article' }
                                        : { mode: 'iframe' },
                          },
                      },
                  ]
                : [],
    };
    const result = validateDefinition(definition);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    const backend = createMockBackend({
        definition,
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

function Panel({ preview = 'none' }: { preview?: PreviewMode }) {
    const [{ resource, adapter, client }] = useState(() => createSetup(preview));
    if (resource === undefined) {
        return null;
    }
    return (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <RouterProvider navigate={() => undefined}>
                    <PanneauProvider
                        plugins={[{ id: 'site', previews: { article: ArticlePreview } }]}
                    >
                        <ItemPanel
                            resolved={resolveResource(resource)}
                            basePath="/admin"
                            locale="en"
                            id="1"
                            closeHref="/admin/resources/articles"
                        />
                    </PanneauProvider>
                </RouterProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Item panel',
    component: Panel,
    parameters: { layout: 'fullscreen' },
    args: { preview: 'none' },
    beforeEach: () => {
        window.localStorage.removeItem('panneau:item-panel-tab');
    },
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

/** A resource with a component preview: a plugin renders the item as the site shows it. */
export const ComponentPreview: Story = {
    args: { preview: 'component' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const panel = canvas.getByRole('region', { name: 'Details of the article' });
        await expect(await within(panel).findByRole('tab', { name: 'Preview' })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        await expect(
            await within(panel).findByRole('heading', {
                level: 1,
                name: 'The river festival returns',
            }),
        ).toBeInTheDocument();
    },
};

/** A resource with an iframe preview: the item's page on the site, from the backend's URL. */
export const IframePreview: Story = {
    args: { preview: 'iframe' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await canvas.findByTitle('Preview of “The river festival returns”'),
        ).toBeInTheDocument();
    },
};
