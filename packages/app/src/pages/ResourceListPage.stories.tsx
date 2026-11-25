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
    createDashboardDefinition,
    createRecentItems,
    createSummaryDefinition,
} from '../__fixtures__/dashboard';
import { navigate, usePathname } from '../location';
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

/**
 * Finds in a widget, looked up again on each try: the grid of the summary loads its code first
 * (#346), and its skeletons give way to the widgets. The code is waited for itself: the first
 * time, on a busy machine, it can take longer than `waitFor` waits.
 */
const findInWidget = async <T,>(
    canvasElement: HTMLElement,
    id: string,
    query: (widget: ReturnType<typeof within>) => T,
) => {
    await import('../dashboard/Dashboard');
    return waitFor(() => query(widgetOf(canvasElement, id)), { timeout: 5000 });
};

/** The summary of the entries above their list: counts, a sum, a breakdown, and a widget of its own. */
export const Summary: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await findInWidget(canvasElement, 'shown', (widget) =>
                widget.getByRole('link', { name: /^Entries 6/ }),
            ),
        ).toBeVisible();
        await expect(
            await findInWidget(canvasElement, 'status', (widget) =>
                widget.getByRole('link', { name: 'Accepted' }),
            ),
        ).toHaveAttribute('href', '/panneau/resources/entries?filter%5Bstatus%5D=accepted');
        await expect(await canvas.findByRole('table', { name: 'Entries' })).toBeVisible();

        // Hidden, then shown again
        const toggle = canvas.getByRole('button', { name: 'Summary' });
        await userEvent.click(toggle);
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(canvasElement.querySelector('[data-widget]')).toBeNull();
        await userEvent.click(toggle);
        await expect(
            await findInWidget(canvasElement, 'shown', (widget) =>
                widget.getByRole('link', { name: /^Entries 6/ }),
            ),
        ).toBeVisible();
    },
};

/** A log read through its summary first: its list folded under it, behind "Show the 6 entries". */
export const ListCollapsed: Story = {
    args: { list: 'collapsed' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await findInWidget(canvasElement, 'everything', (widget) =>
                widget.getByRole('link', {
                    name: /^All entries 6/,
                }),
            ),
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
            await findInWidget(canvasElement, 'shown', (widget) =>
                widget.getByRole('link', { name: /^Entries 3/ }),
            ),
        ).toHaveAttribute('href', '/panneau/resources/entries?filter%5Bstatus%5D=accepted');
        await expect(
            await findInWidget(canvasElement, 'everything', (widget) =>
                widget.getByRole('link', {
                    name: /^All entries 6/,
                }),
            ),
        ).toBeVisible();
        await expect(
            await findInWidget(canvasElement, 'queue', (widget) =>
                widget.getByText('Of the shown entries'),
            ),
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
            await findInWidget(canvasElement, 'shown', (widget) =>
                widget.getByRole('link', { name: /^Entries 2/ }),
            ),
        ).toBeVisible();
        await expect(
            await findInWidget(canvasElement, 'everything', (widget) =>
                widget.getByRole('link', {
                    name: /^All entries 4/,
                }),
            ),
        ).toBeVisible();
        await userEvent.click(within(control).getByRole('radio', { name: '30 days' }));
        await expect(
            await findInWidget(canvasElement, 'shown', (widget) =>
                widget.getByRole('link', { name: /^Entries 3/ }),
            ),
        ).toBeVisible();
        const table = await canvas.findByRole('table', { name: 'Entries' });
        await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(4));
    },
};

/** The path of the list page of the entries, as the routes of the app give it. */
const ENTRIES_PATH = '/panneau/resources/entries';

/**
 * The list of the entries with one open, as the show route renders it: the item follows the path,
 * and its links and its panel move through the history of the app. The page sits where the shell
 * leaves it, its navigation expanded.
 */
function ItemOpenStory() {
    const [state] = useState(() => {
        const dashboard = createDashboardDefinition();
        const input = {
            ...dashboard,
            resources: dashboard.resources.map((resource) => ({
                ...resource,
                // Titles open the panel of the details, rather than the form
                open: 'panel' as const,
                list: {
                    ...resource.list,
                    columns: [
                        { field: 'title' },
                        { field: 'status' },
                        { field: 'submitted_at' },
                        { field: 'fee' },
                    ],
                },
            })),
        };
        const parsed = validateDefinition(input);
        if (!parsed.success) {
            throw new Error('Invalid definition.');
        }
        const backend = createMockBackend({ definition: input, items: DASHBOARD_ITEMS });
        const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
        return {
            definition: parsed.data,
            adapter,
            router: createMemoryRouter(''),
            queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        };
    });
    const pathname = usePathname();
    const selectedId = pathname.startsWith(`${ENTRIES_PATH}/`)
        ? pathname.slice(ENTRIES_PATH.length + 1)
        : null;
    const resource = state.definition.resources[0];
    if (resource === undefined) {
        return null;
    }
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <ActionRunnerProvider adapter={state.adapter}>
                    <RouterProvider navigate={(href) => navigate(href)}>
                        <PanneauProvider definition={state.definition} router={state.router}>
                            <div
                                style={{
                                    padding: '2rem',
                                    paddingInlineStart:
                                        'calc(var(--panneau-sidebar-width, 15rem) + 2rem)',
                                }}
                            >
                                <ResourceListPage
                                    resolved={resolveResource(resource)}
                                    basePath="/panneau"
                                    locale="en"
                                    selectedId={selectedId}
                                />
                            </div>
                        </PanneauProvider>
                    </RouterProvider>
                </ActionRunnerProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const laptop = {
    viewport: {
        options: {
            laptop: {
                name: 'Laptop',
                styles: { width: '1280px', height: '800px' },
                type: 'desktop',
            },
        },
    },
};

/** The widths of the columns of a table, from its headers. */
const columnWidths = (table: HTMLElement) =>
    [...table.querySelectorAll('thead th')].map((cell) => cell.getBoundingClientRect().width);

/**
 * An item open on a laptop (1280px), as #366 measured it: the panel goes over the list (decision
 * 0099), so that the table stays a table and keeps its columns. Its row stays current, another
 * row swaps the panel, and Escape closes it.
 */
export const ItemOpenOnALaptop: Story = {
    render: () => <ItemOpenStory />,
    parameters: laptop,
    globals: { viewport: { value: 'laptop', isRotated: false } },
    beforeEach: () => {
        const previous = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(window.history.state, '', ENTRIES_PATH);
        return () => {
            window.history.replaceState(window.history.state, '', previous);
        };
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = await canvas.findByRole('table');
        await waitFor(() =>
            expect(within(table).getByRole('link', { name: 'Bridges at night' })).toBeVisible(),
        );
        // Closed: a table, with its headers
        await expect(getComputedStyle(table).display).toBe('table');
        const widths = columnWidths(table);

        await userEvent.click(within(table).getByRole('link', { name: 'Bridges at night' }));
        const panel = await canvas.findByRole('region', { name: 'Details of the entry' });
        await expect(
            await within(panel).findByRole('heading', { name: 'Bridges at night' }),
        ).toBeInTheDocument();
        // Open: still a table, its columns where they were, under the panel
        await expect(getComputedStyle(table).display).toBe('table');
        await expect(within(table).getAllByRole('columnheader')[0]).toBeVisible();
        await expect(columnWidths(table)).toEqual(widths);
        await expect(getComputedStyle(panel).position).toBe('fixed');
        await expect(panel).toHaveFocus();
        // Its row stays current
        await expect(within(table).getByRole('link', { name: 'Bridges at night' })).toHaveAttribute(
            'aria-current',
            'page',
        );

        // Another visible row swaps the panel
        await userEvent.click(within(table).getByRole('link', { name: 'City lights' }));
        await expect(
            await within(canvas.getByRole('region', { name: 'Details of the entry' })).findByRole(
                'heading',
                { name: 'City lights' },
            ),
        ).toBeInTheDocument();
        await expect(within(table).getByRole('link', { name: 'City lights' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        await expect(columnWidths(table)).toEqual(widths);

        // Escape closes it, and the list doesn't move
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
            expect(canvas.queryByRole('region', { name: 'Details of the entry' })).toBeNull(),
        );
        await expect(columnWidths(table)).toEqual(widths);
    },
};
