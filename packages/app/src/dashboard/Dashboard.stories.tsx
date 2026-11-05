/**
 * The dashboard of the home page (decision 0064): the built-in widgets, on a resource or with data
 * of their own, on the mock backend.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type Widget, validateDefinition } from '@panneau/protocol';
import { type MockWidget, createMockBackend } from '@panneau/protocol/mock';

import {
    DASHBOARD_DATA,
    DASHBOARD_ITEMS,
    DASHBOARD_WIDGETS,
    createDashboardDefinition,
} from '../__fixtures__/dashboard';
import { Dashboard } from './Dashboard';

interface DashboardStoryProps {
    widgets?: Widget[];
    data?: Record<string, MockWidget>;
    /** Requests never answer: every widget loads. */
    pending?: boolean;
}

function DashboardStory({
    widgets = DASHBOARD_WIDGETS,
    data = DASHBOARD_DATA,
    pending = false,
}: DashboardStoryProps) {
    const [state] = useState(() => {
        const definition = createDashboardDefinition(widgets);
        const backend = createMockBackend({ definition, items: DASHBOARD_ITEMS, widgets: data });
        const parsed = validateDefinition(definition);
        if (!parsed.success) {
            throw new Error('Invalid definition.');
        }
        return {
            definition: parsed.data,
            adapter: createRestAdapter({
                baseUrl: '/panneau/api',
                fetch: pending ? () => new Promise<Response>(() => undefined) : backend.fetch,
            }),
            queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        };
    });
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <Dashboard definition={state.definition} basePath="/panneau" />
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Dashboard',
    component: DashboardStory,
} satisfies Meta<typeof DashboardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const widgetOf = (canvasElement: HTMLElement, id: string) => {
    const element = canvasElement.querySelector(`[data-widget="${id}"]`);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`No widget ${id}.`);
    }
    return within(element);
};

/** Every built-in type: stats, a series and lists, on a resource or with data of their own. */
export const Widgets: Story = {
    play: async ({ canvasElement }) => {
        await expect(
            await widgetOf(canvasElement, 'to-judge').findByRole('link'),
        ).toHaveAccessibleName('Entries to judge 2');
        await expect(
            await widgetOf(canvasElement, 'latest').findByRole('link', {
                name: 'Fog on the river',
            }),
        ).toBeVisible();
        await expect(
            await widgetOf(canvasElement, 'per-day').findByRole('table', {
                name: 'Entries per day',
            }),
        ).toBeInTheDocument();
    },
};

/** Stats: a count of a list, a number that calls for attention, a plain number. */
export const Stats: Story = {
    args: { widgets: DASHBOARD_WIDGETS.filter((widget) => widget.type === 'stat') },
    play: async ({ canvasElement }) => {
        await expect(
            await widgetOf(canvasElement, 'overdue').findByRole('link'),
        ).toHaveAccessibleName('Overdue 3 Since Monday');
    },
};

/** A series by day, the whole width. */
export const Series: Story = {
    args: { widgets: [{ id: 'per-day', type: 'series', label: 'Entries per day', width: 12 }] },
    play: async ({ canvasElement }) => {
        await expect(await within(canvasElement).findByText('Total')).toBeVisible();
    },
};

/** A series by month. */
export const SeriesByMonth: Story = {
    args: {
        widgets: [{ id: 'per-month', type: 'series', label: 'Entries per month' }],
        data: {
            'per-month': {
                period: 'month',
                points: [
                    { date: '2026-08-01', value: 120 },
                    { date: '2026-09-01', value: 340 },
                    { date: '2026-10-01', value: 280 },
                ],
                total: 740,
            },
        },
    },
    play: async ({ canvasElement }) => {
        await expect(await within(canvasElement).findAllByText('Oct 2026')).not.toHaveLength(0);
    },
};

/** Lists: the latest items of a resource with their badge, and a list of its own. */
export const Lists: Story = {
    args: {
        widgets: DASHBOARD_WIDGETS.filter(
            (widget) => widget.type === 'list' && widget.id !== 'closed',
        ),
    },
    play: async ({ canvasElement }) => {
        const contests = widgetOf(canvasElement, 'contests');
        await expect(await contests.findByText('Closes soon')).toBeVisible();
        await expect(contests.getByRole('link', { name: 'See all' })).toBeVisible();
    },
};

/** Empty: a list without items says so, and a series without points draws its baseline. */
export const Empty: Story = {
    args: {
        widgets: [
            { id: 'closed', type: 'list', label: 'Closed contests' },
            { id: 'none', type: 'list', label: 'Reports' },
            { id: 'quiet', type: 'series', label: 'Entries per day' },
            { id: 'zero', type: 'stat', label: 'Overdue' },
        ],
        data: {
            closed: { items: [], empty: 'No closed contests.' },
            none: { items: [] },
            quiet: { period: 'day', points: [], total: 0 },
            zero: { value: 0, help: 'Nothing late' },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('No closed contests.')).toBeVisible();
        await expect(await canvas.findByText('Nothing here yet.')).toBeVisible();
    },
};

/** Without widgets: the cards of the resources. */
export const NoWidgets: Story = {
    args: { widgets: [] },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('link', { name: 'Entries' })).toBeVisible();
    },
};

/** While the widgets load: each draws the skeleton of its type, and says it loads. */
export const Loading: Story = {
    args: { pending: true },
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelectorAll('[aria-busy="true"]')).toHaveLength(
            DASHBOARD_WIDGETS.length,
        );
        await expect(within(canvasElement).getAllByRole('status')[0]).toHaveTextContent(
            'Loading Entries to judge…',
        );
    },
};

let answersFail = true;

/** A widget that fails: its error and "Try again", the others unaffected. A 403 hides a widget. */
export const Errors: Story = {
    args: {
        data: {
            ...DASHBOARD_DATA,
            answers: () =>
                answersFail
                    ? new Response(JSON.stringify({ status: 500, title: 'Server error' }), {
                          status: 500,
                          headers: { 'Content-Type': 'application/problem+json' },
                      })
                    : { value: 129, help: 'Back up' },
            contests: new Response(null, { status: 403 }),
        },
    },
    play: async ({ canvasElement }) => {
        answersFail = true;
        const answers = widgetOf(canvasElement, 'answers');
        await expect(await answers.findByText('This widget couldn’t load.')).toBeVisible();
        await expect(await widgetOf(canvasElement, 'overdue').findByText('3')).toBeVisible();
        await waitFor(() =>
            expect(canvasElement.querySelector('[data-widget="contests"]')).toBeNull(),
        );
        answersFail = false;
        await userEvent.click(answers.getByRole('button', { name: 'Try again' }));
        await expect(await answers.findByText('129')).toBeVisible();
    },
};
