/**
 * A resource list, from the protocol's example definition, fetched through the REST adapter and
 * the query hooks of `@panneau/data` from the mock backend of `@panneau/protocol`: the list state
 * of `@panneau/core` keeps the query, the hooks fetch it, and `ListView` renders it.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider, resolveResource, useList } from '@panneau/core';
import { type DataAdapter, createRestAdapter } from '@panneau/data';
import {
    DataAdapterProvider,
    queryKeys,
    useDefinition,
    useResourceList,
} from '@panneau/data/query';
import type { DefinitionInput, ListQuery, Resource } from '@panneau/protocol';
import { createExampleDefinition, createMockBackend } from '@panneau/protocol/mock';
import { Spinner, useToast } from '@panneau/ui';

import { ListView } from './ListView';
import type { ListActionEvent } from './types';

const TITLES = [
    ['À propos', 'About us'],
    ['Contact', 'Contact'],
    ['Équipe', 'Team'],
    ['Carrières', 'Careers'],
    ['Nouvelles', 'News'],
    ['Presse', 'Press'],
    ['Confidentialité', 'Privacy'],
    ['Conditions', 'Terms'],
    ['Accessibilité', 'Accessibility'],
    ['Blogue', 'Blog'],
    ['Événements', 'Events'],
    ['Partenaires', 'Partners'],
    ['Foire aux questions', 'FAQ'],
    ['Plan du site', 'Sitemap'],
    ['Infolettre', 'Newsletter'],
    ['Projets', 'Projects'],
    ['Services', 'Services'],
    ['Témoignages', 'Testimonials'],
    ['Tarifs', 'Pricing'],
    ['Soutien', 'Support'],
    ['Ressources', 'Resources'],
    ['Histoire', 'History'],
    ['Mission', 'Mission'],
    ['Bureaux', 'Offices'],
] as const;

function createSetup() {
    const definition: DefinitionInput = createExampleDefinition();
    const pages = definition.resources[0] as DefinitionInput['resources'][number];
    // The built-in delete action, which the mock backend runs, in the menu of each row.
    pages.actions = [
        ...(pages.actions ?? []),
        {
            id: 'delete',
            label: 'Supprimer',
            scope: ['item', 'selection'],
            placement: ['menu', 'toolbar'],
            destructive: true,
            confirm: true,
        },
    ];
    const backend = createMockBackend({
        definition,
        items: {
            pages: TITLES.map(([fr, en], index) => ({
                id: String(index + 1),
                title: { fr, en },
                status: index % 3 === 0 ? 'published' : 'draft',
                ...(index % 3 === 0 ? { published_at: '2026-09-01T13:30:00Z' } : {}),
                author: { id: '1', label: 'Ada Lovelace' },
                updated: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`,
            })),
            authors: [{ id: '1', name: 'Ada Lovelace' }],
        },
    });
    const adapter = createRestAdapter({ baseUrl: definition.api.baseUrl, fetch: backend.fetch });
    // The page with id 3 can't be published: its abilities don't list the action.
    const list = adapter.list.bind(adapter);
    adapter.list = async (resource, query, options) => {
        const response = await list(resource, query, options);
        return {
            ...response,
            data: response.data.map((item) =>
                item.id === '3'
                    ? { ...item, abilities: { ...item.abilities, publish: false } }
                    : item,
            ),
        };
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return { adapter, client };
}

/**
 * Runs an action through the adapter. The mock backend only runs `delete`: pages are published
 * through updates instead.
 */
async function runAction(
    adapter: DataAdapter,
    { action, item, selection, skipped }: ListActionEvent,
) {
    const target = item !== undefined ? { ids: [item.id] } : selection;
    if (action.id !== 'publish' || target === undefined) {
        return adapter.runAction(
            'pages',
            action.id,
            target !== undefined ? { selection: target } : {},
        );
    }
    const ids: string[] =
        'ids' in target
            ? (target.ids as string[])
            : (await adapter.list('pages', { ...(target.query as ListQuery), perPage: 1000 })).data
                  .map((page) => page.id)
                  .filter((id) => !((target.except as string[] | undefined) ?? []).includes(id));
    // Like a backend, skip the pages that don't allow the action.
    const allowed = ids.filter((id) => !skipped.some((page) => page.id === id));
    await Promise.all(
        allowed.map((id) =>
            adapter.update('pages', id, {
                status: 'published',
                published_at: '2026-10-16T13:30:00Z',
            }),
        ),
    );
    return null;
}

function PagesList({ resource, adapter }: { resource: Resource; adapter: DataAdapter }) {
    const client = useQueryClient();
    const toasts = useToast();
    const { list: resolved } = resolveResource(resource);
    const { query, list } = useList({ list: resolved, router: null });
    const { data, error, isFetching, refetch } = useResourceList('pages', query, {
        placeholderData: (previous) => previous,
    });
    return (
        <ListView
            {...resolved}
            aria-label="Pages"
            list={list}
            items={data?.data}
            total={data?.meta.total}
            isLoading={isFetching}
            error={error}
            onRetry={() => void refetch()}
            fields={resource.fields}
            itemTitle={resource.itemTitle}
            layouts={['table', 'cards']}
            perPageOptions={[10, 20, 50]}
            getItemHref={(item) => `/pages/${item.id}/edit`}
            onAction={async (event) => {
                await runAction(adapter, event);
                await client.invalidateQueries({ queryKey: queryKeys.lists('pages') });
                toasts.show({
                    title: `${event.action.label}: ${String(event.count)}`,
                    tone: 'success',
                });
            }}
        />
    );
}

function ResourceList() {
    const [{ adapter, client }] = useState(createSetup);
    return (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <Loaded adapter={adapter} />
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

function Loaded({ adapter }: { adapter: DataAdapter }) {
    const toasts = useToast();
    const { data: definition } = useDefinition();
    const resource = definition?.resources.find((candidate) => candidate.id === 'pages');
    if (definition === undefined || resource === undefined) {
        return <Spinner showLabel />;
    }
    return (
        // Links of the list (titles, the edit action) go through the app's router.
        <RouterProvider navigate={(href) => toasts.show({ title: `Navigate to ${href}` })}>
            <PanneauProvider definition={definition}>
                <PagesList resource={resource} adapter={adapter} />
            </PanneauProvider>
        </RouterProvider>
    );
}

const meta = {
    title: 'Lists/Resource list',
    component: ResourceList,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof ResourceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = await canvas.findByRole('table', { name: 'Pages' });
        await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(21));
        await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent(
            '1–20 of 24',
        );
        // Sorted by title (the default sort of the definition).
        await expect(within(table).getAllByRole('row')[1]).toHaveTextContent('About us');
    },
};

export const FilterAndPublish: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const table = await canvas.findByRole('table', { name: 'Pages' });
        await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(21));

        // Drafts only (the options come from the status field).
        await userEvent.click(canvas.getByRole('button', { name: /status/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Brouillon' }));
        await waitFor(() => expect(canvas.getByRole('navigation')).toHaveTextContent('1–16 of 16'));

        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Select every item of the page' }),
        );
        await expect(canvas.getByText('16 items selected')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Publier' }));
        const dialog = await body.findByRole('alertdialog');
        // The confirmation of the definition, and the page that doesn't allow publishing.
        await expect(dialog).toHaveTextContent('Publier 16 pages ?');
        await expect(dialog).toHaveTextContent(
            '1 selected item doesn’t allow it and will be skipped.',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Publier' }));

        // Every draft is published, except the one that doesn't allow it.
        await waitFor(() => expect(canvas.getByRole('navigation')).toHaveTextContent('1–1 of 1'));
        await expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Team');
    },
};
