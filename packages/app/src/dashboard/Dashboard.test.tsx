import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { type PanneauPlugin, PanneauProvider, type WidgetProps, definePlugin } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type DefinitionInput, type Widget, validateDefinition } from '@panneau/protocol';
import { type MockWidget, createMockBackend } from '@panneau/protocol/mock';

import {
    DASHBOARD_DATA,
    DASHBOARD_ITEMS,
    createDashboardDefinition,
} from '../__fixtures__/dashboard';
import { Dashboard } from './Dashboard';

function renderDashboard({
    definition = createDashboardDefinition(),
    widgets = DASHBOARD_DATA,
    plugins = [],
}: {
    definition?: DefinitionInput;
    widgets?: Record<string, MockWidget>;
    plugins?: PanneauPlugin[];
} = {}) {
    const backend = createMockBackend({ definition, items: DASHBOARD_ITEMS, widgets });
    const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
    const parsed = validateDefinition(definition);
    if (!parsed.success) {
        throw new Error(JSON.stringify(parsed.issues));
    }
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <PanneauProvider plugins={plugins}>
                    <Dashboard definition={parsed.data} basePath="/panneau" />
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

    it('shows the cards of the resources without widgets', () => {
        renderDashboard({ definition: createDashboardDefinition([]) });
        expect(screen.getByRole('link', { name: 'Entries' })).toHaveAttribute(
            'href',
            '/panneau/resources/entries',
        );
    });
});
