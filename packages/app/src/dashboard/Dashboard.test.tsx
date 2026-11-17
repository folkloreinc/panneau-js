import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type PanneauPlugin, PanneauProvider, type WidgetProps, definePlugin } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type DefinitionInput, type Widget, validateDefinition } from '@panneau/protocol';
import { type MockWidget, createMockBackend } from '@panneau/protocol/mock';

import {
    AGGREGATE_WIDGETS,
    DASHBOARD_DATA,
    DASHBOARD_ITEMS,
    PERIOD_DATA,
    createDashboardDefinition,
    createPeriodDefinition,
} from '../__fixtures__/dashboard';
import { Dashboard } from './Dashboard';

function renderDashboard({
    definition = createDashboardDefinition(),
    widgets = DASHBOARD_DATA,
    plugins = [],
    page,
    requests = [],
    answer = () => undefined,
}: {
    definition?: DefinitionInput;
    widgets?: Record<string, MockWidget>;
    plugins?: PanneauPlugin[];
    page?: string;
    /** The URLs of the requests, as they are sent. */
    requests?: string[];
    /** Answers a request in place of the mock backend, unless it returns `undefined`. */
    answer?: (url: string) => Response | undefined;
} = {}) {
    const backend = createMockBackend({ definition, items: DASHBOARD_ITEMS, widgets });
    const adapter = createRestAdapter({
        baseUrl: '/panneau/api',
        fetch: (input, init) => {
            requests.push(String(input));
            return Promise.resolve(answer(input) ?? backend.fetch(input, init));
        },
    });
    const parsed = validateDefinition(definition);
    if (!parsed.success) {
        throw new Error(JSON.stringify(parsed.issues));
    }
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <PanneauProvider plugins={plugins}>
                    <Dashboard
                        definition={parsed.data}
                        basePath="/panneau"
                        {...(page !== undefined && { page })}
                    />
                </PanneauProvider>
            </DataAdapterProvider>
        </QueryClientProvider>,
    );
}

const widget = (id: string) => {
    const element = document.querySelector(`[data-widget="${id}"]`);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`No widget ${id}.`);
    }
    return within(element);
};

describe('Dashboard', () => {
    it('draws a skeleton of each widget while it loads', () => {
        renderDashboard();
        expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(7);
        expect(screen.getAllByRole('status')[0]).toHaveTextContent('Loading Entries to judge…');
    });

    it('counts the items of the list of a stat on a resource, and links to that list', async () => {
        renderDashboard();
        const link = await widget('to-judge').findByRole('link');
        expect(link).toHaveAccessibleName('Entries to judge 2');
        expect(link).toHaveAttribute(
            'href',
            '/panneau/resources/entries?filter%5Bstatus%5D=to-judge',
        );
    });

    it('draws stats with data of their own: their help, their tone, their link', async () => {
        renderDashboard();
        const overdue = await widget('overdue').findByRole('link');
        expect(overdue).toHaveAccessibleName('Overdue 3 Since Monday');
        expect(overdue).toHaveClass('panneau-tone-danger');
        expect(await widget('answers').findByText('128')).toBeInTheDocument();
        expect(widget('answers').queryByRole('link')).toBeNull();
    });

    it('draws a series: its total, and its points in a table', async () => {
        renderDashboard();
        const table = await widget('per-day').findByRole('table', { name: 'Entries per day' });
        expect(within(table).getAllByRole('row')).toHaveLength(14);
        expect(within(table).getAllByRole('row')[0]).toHaveTextContent('Oct 54');
        expect(widget('per-day').getByText('Total')).toBeInTheDocument();
        expect(widget('per-day').getAllByText('137').length).toBeGreaterThan(0);
    });

    it('lists the first items of a resource with the badge of their first select column', async () => {
        renderDashboard();
        const latest = widget('latest');
        expect(await latest.findByRole('link', { name: 'Fog on the river' })).toBeVisible();
        expect(latest.getByRole('heading', { name: 'Latest entries' })).toBeInTheDocument();
        const items = latest.getAllByRole('listitem');
        expect(items.map((item) => item.textContent)).toEqual([
            'Fog on the riverAccepted',
            'Early frostAccepted',
            'DunesRefused',
            'City lightsTo judge',
            'Bridges at nightAccepted',
        ]);
        expect(latest.getByRole('link', { name: 'Fog on the river' })).toHaveAttribute(
            'href',
            '/panneau/resources/entries/6/edit',
        );
        expect(latest.getByRole('link', { name: 'See all' })).toHaveAttribute(
            'href',
            '/panneau/resources/entries?sort=-title',
        );
    });

    it('draws a list with data of its own, and its message when it is empty', async () => {
        renderDashboard();
        const contests = widget('contests');
        expect(await contests.findByRole('link', { name: 'Spring photo contest' })).toBeVisible();
        expect(contests.getByText('Closes Friday')).toBeInTheDocument();
        expect(contests.getByText('3 entries')).toBeInTheDocument();
        expect(contests.getByText('Closes soon')).toHaveClass('panneau-tone-warning');
        expect(await widget('closed').findByText('No closed contests.')).toBeInTheDocument();
    });

    it('shows the error of a widget that fails, with a retry, without touching the others', async () => {
        let fail = true;
        renderDashboard({
            widgets: {
                ...DASHBOARD_DATA,
                answers: () =>
                    fail
                        ? new Response(JSON.stringify({ status: 500, title: 'Server error' }), {
                              status: 500,
                              headers: { 'Content-Type': 'application/problem+json' },
                          })
                        : { value: 129 },
            },
        });
        const answers = widget('answers');
        expect(await answers.findByText('This widget couldn’t load.')).toBeInTheDocument();
        expect(await widget('overdue').findByText('3')).toBeInTheDocument();
        fail = false;
        await userEvent.click(answers.getByRole('button', { name: 'Try again' }));
        expect(await answers.findByText('129')).toBeInTheDocument();
    });

    it('shows the error of data in the wrong shape', async () => {
        renderDashboard({
            widgets: {
                ...DASHBOARD_DATA,
                answers: () =>
                    new Response(JSON.stringify({ value: 'many' }), {
                        headers: { 'Content-Type': 'application/json' },
                    }),
            },
        });
        expect(await widget('answers').findByText('This widget couldn’t load.')).toBeVisible();
    });

    it('hides a widget the user can’t see, and the widgets of a resource they can’t list', async () => {
        const definition = createDashboardDefinition();
        definition.resources = definition.resources.map((resource) => ({
            ...resource,
            abilities: { viewAny: false },
        }));
        renderDashboard({
            definition,
            widgets: { ...DASHBOARD_DATA, overdue: new Response(null, { status: 403 }) },
        });
        expect(await widget('answers').findByText('128')).toBeInTheDocument();
        await waitFor(() => expect(document.querySelector('[data-widget="overdue"]')).toBeNull());
        expect(document.querySelector('[data-widget="to-judge"]')).toBeNull();
        expect(document.querySelector('[data-widget="latest"]')).toBeNull();
    });

    it('draws the widgets of plugins with their data, and says when no plugin draws a type', async () => {
        function Weather({ widget: own, data }: WidgetProps) {
            return <p>{`${own.id}: ${(data as { sky: string }).sky}`}</p>;
        }
        const widgets: Widget[] = [
            { id: 'weather', type: 'weather', label: 'Weather' },
            { id: 'map', type: 'map', label: 'Map' },
        ];
        renderDashboard({
            definition: createDashboardDefinition(widgets),
            widgets: { weather: { sky: 'clear' }, map: { pins: [] } },
            plugins: [definePlugin({ id: 'weather', widgets: { weather: Weather } })],
        });
        expect(await screen.findByText('weather: clear')).toBeInTheDocument();
        expect(widget('map').getByText('No plugin provides the widget “map”.')).toBeVisible();
    });

    it('draws a skeleton of the widgets on aggregates while they load', () => {
        renderDashboard({ definition: createDashboardDefinition(AGGREGATE_WIDGETS) });
        expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(3);
        expect(widget('by-status').getByRole('status')).toHaveTextContent(
            'Loading Entries by status…',
        );
    });

    it('sums money in its currency, links to the list, and draws the meter of its target', async () => {
        renderDashboard({ definition: createDashboardDefinition(AGGREGATE_WIDGETS) });
        const fees = await widget('fees').findByRole('link');
        expect(fees).toHaveAttribute('href', '/panneau/resources/entries');
        expect(fees).toHaveTextContent('CA$120.00');
        const meter = widget('fees').getByRole('meter', { name: 'Entry fees' });
        expect(meter).toHaveAttribute('aria-valuetext', 'CA$120.00 of CA$100.00');
        expect(meter).toHaveClass('panneau-tone-danger');
    });

    it('draws a series of the entries per day, at 0 on the days without', async () => {
        renderDashboard({ definition: createDashboardDefinition(AGGREGATE_WIDGETS) });
        const table = await widget('submitted').findByRole('table', { name: 'Entries per day' });
        expect(
            within(table)
                .getAllByRole('row')
                .map((row) => row.textContent),
        ).toEqual(['Oct 12', 'Oct 20', 'Oct 31', 'Oct 42', 'Oct 50', 'Oct 61', 'Oct 70']);
        expect(widget('submitted').getAllByText('6').length).toBeGreaterThan(0);
    });

    it('breaks down the entries by status, with the labels and the links of the options', async () => {
        renderDashboard({ definition: createDashboardDefinition(AGGREGATE_WIDGETS) });
        const list = await widget('by-status').findByRole('list', { name: 'Entries by status' });
        expect(
            within(list)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Accepted3', 'To judge2', 'Refused1']);
        expect(within(list).getByRole('link', { name: 'To judge' })).toHaveAttribute(
            'href',
            '/panneau/resources/entries?filter%5Bstatus%5D=to-judge',
        );
        expect(within(list).getAllByRole('listitem')[0]).toHaveClass('panneau-tone-success');
    });

    it('shows the error of aggregates in the wrong shape', async () => {
        renderDashboard({
            definition: createDashboardDefinition(AGGREGATE_WIDGETS),
            answer: (url) =>
                url.includes('/aggregate?')
                    ? new Response(JSON.stringify({ items: [{ label: 'No value' }] }), {
                          headers: { 'Content-Type': 'application/json' },
                      })
                    : undefined,
        });
        expect(await widget('by-status').findByText('This widget couldn’t load.')).toBeVisible();
        expect(await widget('fees').findByText('This widget couldn’t load.')).toBeVisible();
    });

    it('shows the cards of the resources without widgets', () => {
        renderDashboard({ definition: createDashboardDefinition([]) });
        expect(screen.getByRole('link', { name: 'Entries' })).toHaveAttribute(
            'href',
            '/panneau/resources/entries',
        );
    });

    describe('a dashboard page (decision 0084)', () => {
        it('draws the widgets of its page under its label, without the welcome', async () => {
            const requests: string[] = [];
            renderDashboard({ page: 'activity', requests });
            expect(screen.getByRole('heading', { level: 1, name: 'Activity' })).toBeVisible();
            expect(screen.queryByText('Welcome, Ada.')).toBeNull();
            expect(document.title).toBe('Activity');
            expect(await widget('signups').findByText('42')).toBeInTheDocument();
            expect(await widget('accepted').findByRole('link')).toHaveAccessibleName(
                'Accepted entries 3',
            );
            expect(
                await widget('per-week').findByRole('table', { name: 'Entries per week' }),
            ).toBeInTheDocument();
            // Only its own widgets, whose data it asks for with its page
            expect(document.querySelector('[data-widget="overdue"]')).toBeNull();
            expect(requests).toContain('/panneau/api/dashboard/widgets/signups?page=activity');
            expect(requests.some((url) => url.includes('/dashboard/widgets/overdue'))).toBe(false);
        });

        it('draws the widgets on the aggregates of a resource, as the home page does', async () => {
            const requests: string[] = [];
            renderDashboard({
                definition: createDashboardDefinition(undefined, AGGREGATE_WIDGETS),
                page: 'activity',
                requests,
            });
            const list = await widget('by-status').findByRole('list', {
                name: 'Entries by status',
            });
            expect(within(list).getByRole('link', { name: 'To judge' })).toHaveAttribute(
                'href',
                '/panneau/resources/entries?filter%5Bstatus%5D=to-judge',
            );
            expect(
                await widget('fees').findByRole('meter', { name: 'Entry fees' }),
            ).toHaveAttribute('aria-valuetext', 'CA$120.00 of CA$100.00');
            expect(
                await widget('submitted').findByRole('table', { name: 'Entries per day' }),
            ).toBeInTheDocument();
            // From the aggregates of the resource, never from the endpoint of the widgets
            expect(requests).toContain(
                '/panneau/api/resources/entries/aggregate?measure=count&group=status',
            );
            expect(requests.some((url) => url.includes('/dashboard/widgets/'))).toBe(false);
        });

        it('says it has no widgets, without the cards of the resources', () => {
            renderDashboard({
                definition: createDashboardDefinition(undefined, []),
                page: 'activity',
            });
            expect(screen.getByRole('heading', { level: 1, name: 'Activity' })).toBeVisible();
            expect(screen.getByText('This dashboard has no widgets yet.')).toBeVisible();
            expect(screen.queryByRole('link', { name: 'Entries' })).toBeNull();
        });

        it('draws the widgets of `pages.home` on the home page, rather than `dashboard`', async () => {
            const definition = createDashboardDefinition();
            definition.pages = {
                home: { component: 'dashboard', widgets: [{ id: 'answers', type: 'stat' }] },
            };
            delete definition.dashboard;
            renderDashboard({ definition });
            expect(screen.getByText('Welcome, Ada.')).toBeVisible();
            expect(await widget('answers').findByText('128')).toBeInTheDocument();
            expect(document.querySelector('[data-widget="overdue"]')).toBeNull();
        });
    });

    describe('the period of a dashboard page (decision 0084)', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('gives the widgets that follow it the days of the chosen period', async () => {
            // The entries are submitted from October 1 to 6
            vi.useFakeTimers({ toFake: ['Date'] });
            vi.setSystemTime(new Date(2026, 9, 9, 12));
            const user = userEvent.setup();
            const requests: string[] = [];
            renderDashboard({
                definition: createPeriodDefinition(),
                widgets: PERIOD_DATA,
                page: 'activity',
                requests,
            });
            const control = screen.getByRole('radiogroup', { name: 'Period' });
            expect(within(control).getByRole('radio', { name: '7 days' })).toBeChecked();
            // "All entries" doesn't follow the period: the control says which widgets do
            expect(screen.getByText('For Submitted and Visits')).toBeVisible();
            expect(
                await widget('submitted-in-period').findByRole('link', { name: /^Submitted 4/ }),
            ).toHaveAttribute(
                'href',
                '/panneau/resources/entries?filter%5Bsubmitted_at%5D%5Bfrom%5D=2026-10-03&filter%5Bsubmitted_at%5D%5Bto%5D=2026-10-09',
            );
            expect(
                await widget('visits').findByText('7d: 2026-10-03 to 2026-10-09'),
            ).toBeInTheDocument();
            expect(
                await widget('all').findByRole('link', { name: /^All entries 6/ }),
            ).toBeVisible();

            await user.click(within(control).getByRole('radio', { name: '30 days' }));
            expect(
                await widget('submitted-in-period').findByRole('link', { name: /^Submitted 6/ }),
            ).toBeVisible();
            expect(
                await widget('visits').findByText('30d: 2026-09-10 to 2026-10-09'),
            ).toBeInTheDocument();
            expect(decodeURIComponent(requests.at(-1) ?? '')).toBe(
                '/panneau/api/dashboard/widgets/visits?page=activity&period[option]=30d&period[from]=2026-09-10&period[to]=2026-10-09',
            );

            await user.click(within(control).getByRole('radio', { name: 'This month' }));
            expect(
                await widget('visits').findByText('month: 2026-10-01 to 2026-10-09'),
            ).toBeInTheDocument();
        });

        it('sends no period to a widget that says it ignores it', async () => {
            const requests: string[] = [];
            const definition = createPeriodDefinition();
            const activity = definition.pages?.activity;
            if (activity?.widgets !== undefined) {
                activity.widgets = [{ id: 'visits', type: 'stat', settings: { period: false } }];
            }
            renderDashboard({ definition, widgets: PERIOD_DATA, page: 'activity', requests });
            expect(await widget('visits').findByText('All time')).toBeInTheDocument();
            expect(requests).toContain('/panneau/api/dashboard/widgets/visits?page=activity');
            // No widget follows it: the control doesn't list them
            expect(screen.queryByText(/^For /)).toBeNull();
        });
    });
});
