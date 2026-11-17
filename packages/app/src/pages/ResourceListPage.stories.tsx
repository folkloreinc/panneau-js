/**
 * The list of a resource with a summary above it (decision 0084): its widgets in the grid of a
 * dashboard, which follow the filters of the list, from the mock backend of `@panneau/protocol`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ActionRunnerProvider } from '@panneau/actions';
import { PanneauProvider, createMemoryRouter, resolveResource } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type OverviewPeriod, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import {
    DASHBOARD_ITEMS,
    SUMMARY_DATA,
    SUMMARY_WIDGETS,
    createRecentItems,
    createSummaryDefinition,
} from '../__fixtures__/dashboard';
import { ResourceListPage } from './ResourceListPage';

interface ListStoryProps {
    /** `collapsed`: the resource opens on its summary, its list folded under it. */
    list?: 'collapsed';
    /** The query string of the list, as a link to it gives it. */
    search?: string;
    /** Requests never answer: the list and every widget load. */
    pending?: boolean;
    /** The period of the summary, with entries submitted in the last days. */
    period?: OverviewPeriod;
}

function ListStory({ list, search = '', pending = false, period }: ListStoryProps) {
    const [state] = useState(() => {
        // Each story starts with the summary open
        window.localStorage.removeItem('panneau:summary:entries');
        const input = createSummaryDefinition(SUMMARY_WIDGETS, list, period);
        const backend = createMockBackend({
            definition: input,
            items: period !== undefined ? createRecentItems() : DASHBOARD_ITEMS,
            widgets: SUMMARY_DATA,
        });
        const parsed = validateDefinition(input);
        if (!parsed.success) {
            throw new Error('Invalid definition.');
        }
        const adapter = createRestAdapter({
            baseUrl: '/panneau/api',
            fetch: pending ? () => new Promise<Response>(() => undefined) : backend.fetch,
        });
        return {
            definition: parsed.data,
            adapter,
            router: createMemoryRouter(search),
            queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        };
    });
    const resource = state.definition.resources[0];
    if (resource === undefined) {
        return null;
    }
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <ActionRunnerProvider adapter={state.adapter}>
                    <RouterProvider navigate={() => undefined}>
                        <PanneauProvider definition={state.definition} router={state.router}>
                            <ResourceListPage
                                resolved={resolveResource(resource)}
                                basePath="/panneau"
                                locale="en"
                            />
                        </PanneauProvider>
                    </RouterProvider>
                </ActionRunnerProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/List with a summary',
    component: ListStory,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const widgetOf = (canvasElement: HTMLElement, id: string) => {
    const element = canvasElement.querySelector(`[data-widget="${id}"]`);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`No widget ${id}.`);
    }
    return within(element);
};

/** The summary of the entries above their list: counts, a sum, a breakdown, and a widget of its own. */
export const Summary: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await widgetOf(canvasElement, 'shown').findByRole('link', { name: /^Entries 6/ }),
        ).toBeVisible();
        await expect(
            await widgetOf(canvasElement, 'status').findByRole('link', { name: 'Accepted' }),
        ).toHaveAttribute('href', '/panneau/resources/entries?filter%5Bstatus%5D=accepted');
        await expect(await canvas.findByRole('table', { name: 'Entries' })).toBeVisible();

        // Hidden, then shown again
        const toggle = canvas.getByRole('button', { name: 'Summary' });
        await userEvent.click(toggle);
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(canvasElement.querySelector('[data-widget]')).toBeNull();
        await userEvent.click(toggle);
        await expect(
            await widgetOf(canvasElement, 'shown').findByRole('link', { name: /^Entries 6/ }),
        ).toBeVisible();
    },
};

/** A log read through its summary first: its list folded under it, behind "Show the 6 entries". */
export const ListCollapsed: Story = {
    args: { list: 'collapsed' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await widgetOf(canvasElement, 'everything').findByRole('link', {
                name: /^All entries 6/,
            }),
        ).toBeVisible();
        await expect(canvas.queryByRole('table')).toBeNull();
        await userEvent.click(await canvas.findByRole('button', { name: 'Show the 6 entries' }));
        await expect(await canvas.findByRole('table', { name: 'Entries' })).toBeVisible();
    },
};

/**
 * The list filtered by a status: the widgets that follow it count the accepted entries, "All
 * entries" counts every one.
 */
export const FollowingAFilter: Story = {
    args: { search: 'filter%5Bstatus%5D=accepted' },
    play: async ({ canvasElement }) => {
        await expect(
            await widgetOf(canvasElement, 'shown').findByRole('link', { name: /^Entries 3/ }),
        ).toHaveAttribute('href', '/panneau/resources/entries?filter%5Bstatus%5D=accepted');
        await expect(
            await widgetOf(canvasElement, 'everything').findByRole('link', {
                name: /^All entries 6/,
            }),
        ).toBeVisible();
        await expect(
            await widgetOf(canvasElement, 'queue').findByText('Of the shown entries'),
        ).toBeVisible();
    },
};

/** While the list and the summary load: a skeleton of each widget, and of the list. */
export const Loading: Story = {
    args: { pending: true },
    play: async ({ canvasElement }) => {
        await expect(
            within(canvasElement)
                .getByRole('region', { name: 'Summary' })
                .querySelectorAll('[aria-busy="true"]'),
        ).toHaveLength(SUMMARY_WIDGETS.length);
        await expect(widgetOf(canvasElement, 'shown').getByRole('status')).toHaveTextContent(
            'Loading Entries…',
        );
    },
};

/**
 * A summary with a period: the list's own date-range filter, so choosing one filters the rows and
 * the widgets that follow the list. "All entries" keeps every entry.
 */
export const Period: Story = {
    args: { period: { options: ['7d', '30d', '90d'] } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const control = await canvas.findByRole('radiogroup', { name: 'Period' });
        await expect(within(control).getByRole('radio', { name: '7 days' })).toBeChecked();
        await expect(
            await widgetOf(canvasElement, 'shown').findByRole('link', { name: /^Entries 2/ }),
        ).toBeVisible();
        await expect(
            await widgetOf(canvasElement, 'everything').findByRole('link', {
                name: /^All entries 4/,
            }),
        ).toBeVisible();
        await userEvent.click(within(control).getByRole('radio', { name: '30 days' }));
        await expect(
            await widgetOf(canvasElement, 'shown').findByRole('link', { name: /^Entries 3/ }),
        ).toBeVisible();
        const table = await canvas.findByRole('table', { name: 'Entries' });
        await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(4));
    },
};
