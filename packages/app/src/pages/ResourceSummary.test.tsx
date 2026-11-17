import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { type OverviewPeriod, type Widget, validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from '../Panneau';
import {
    DASHBOARD_ITEMS,
    SUMMARY_DATA,
    SUMMARY_WIDGETS,
    createSummaryDefinition,
} from '../__fixtures__/dashboard';
import { createBootConfig } from '../__fixtures__/definition';

/** The app on the list of entries, with a summary above it, at `path`. */
function renderList({
    widgets,
    list,
    period,
    path = '',
}: { widgets?: Widget[]; list?: 'collapsed'; period?: OverviewPeriod; path?: string } = {}) {
    window.history.replaceState(null, '', `/panneau/resources/entries${path}`);
    const definition = createSummaryDefinition(widgets, list, period);
    const backend = createMockBackend({
        definition,
        items: DASHBOARD_ITEMS,
        widgets: SUMMARY_DATA,
    });
    const requests: string[] = [];
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return {
        requests,
        ...render(
            <Panneau
                config={result.data}
                adapter={createRestAdapter({
                    baseUrl: '/panneau/api',
                    fetch: (input, init) => {
                        requests.push(decodeURIComponent(String(input)));
                        return backend.fetch(input, init);
                    },
                })}
                queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
                iconLoader={null}
                onUnauthorized={vi.fn()}
            />,
        ),
    };
}

const summary = () => within(screen.getByRole('region', { name: 'Summary' }));
const widget = (id: string) => {
    const element = document.querySelector(`[data-widget="${id}"]`);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`No widget ${id}.`);
    }
    return within(element);
};

describe('the summary above a list (decision 0084)', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('draws its widgets between the header and the list', async () => {
        renderList();
        expect(await summary().findByRole('link', { name: /^Entries 6/ })).toBeInTheDocument();
        await waitFor(() => expect(widget('queue').getByText('4')).toBeInTheDocument());
        expect(await screen.findByRole('table', { name: 'Entries' })).toBeInTheDocument();
        const heading = screen.getByRole('heading', { level: 1, name: 'Entries' });
        const region = screen.getByRole('region', { name: 'Summary' });
        const table = screen.getByRole('table', { name: 'Entries' });
        expect(heading.compareDocumentPosition(region)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(region.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
    });

    it('follows the filters of the list, but for a widget that keeps the whole resource', async () => {
        const { requests } = renderList({ path: '?filter[status]=accepted' });
        expect(await widget('shown').findByRole('link', { name: /^Entries 3/ })).toHaveAttribute(
            'href',
            '/panneau/resources/entries?filter%5Bstatus%5D=accepted',
        );
        expect(
            await widget('everything').findByRole('link', { name: /^All entries 6/ }),
        ).toHaveAttribute('href', '/panneau/resources/entries');
        expect(await widget('fees-shown').findByText('CA$55.00')).toBeInTheDocument();
        expect(await widget('queue').findByText('Of the shown entries')).toBeInTheDocument();
        expect(requests).toContain(
            '/panneau/api/dashboard/widgets/queue?resource=entries&filter[status]=accepted',
        );
        expect(requests).toContain(
            '/panneau/api/resources/entries/aggregate?filter[status]=accepted&measure=sum:fee',
        );
    });

    it('collapses, and the browser remembers it for the resource', async () => {
        const user = userEvent.setup();
        const { unmount } = renderList();
        const toggle = await screen.findByRole('button', { name: 'Summary' });
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(document.querySelector('[data-widget]')).toBeNull();
        expect(window.localStorage.getItem('panneau:summary:entries')).toBe('closed');
        unmount();

        renderList();
        expect(await screen.findByRole('button', { name: 'Summary' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        expect(await screen.findByRole('table', { name: 'Entries' })).toBeInTheDocument();
        expect(document.querySelector('[data-widget]')).toBeNull();
    });

    it('opens on the summary with the list folded under it, behind "Show the N items"', async () => {
        const user = userEvent.setup();
        renderList({ list: 'collapsed' });
        await user.click(await screen.findByRole('button', { name: 'Show the 6 entries' }));
        expect(await screen.findByRole('table', { name: 'Entries' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Show the/ })).toBeNull();
        expect(summary().getAllByRole('link').length).toBeGreaterThan(0);
    });

    it('shows a list that the URL filters, even when its list comes second', async () => {
        renderList({ list: 'collapsed', path: '?filter[status]=accepted' });
        expect(await screen.findByRole('table', { name: 'Entries' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Show/ })).toBeNull();
    });

    it('shows the list once the summary is hidden', async () => {
        const user = userEvent.setup();
        renderList({ list: 'collapsed' });
        await user.click(await screen.findByRole('button', { name: 'Summary' }));
        expect(await screen.findByRole('table', { name: 'Entries' })).toBeInTheDocument();
    });

    it('draws the skeleton, then the error, of each widget on its own', async () => {
        renderList({
            widgets: [...SUMMARY_WIDGETS, { id: 'broken', type: 'stat', label: 'Broken' }],
        });
        expect(await widget('broken').findByText('This widget couldn’t load.')).toBeInTheDocument();
        expect(
            await widget('shown').findByRole('link', { name: /^Entries 6/ }),
        ).toBeInTheDocument();
    });

    describe('its period (decision 0084)', () => {
        const period: OverviewPeriod = { options: ['7d', '30d'] };
        const rows = async () => (await screen.findAllByRole('row')).length - 1;
        const search = () => new URLSearchParams(window.location.search);

        beforeEach(() => {
            // The entries are submitted from October 1 to 6
            vi.useFakeTimers({ toFake: ['Date'] });
            vi.setSystemTime(new Date(2026, 9, 9, 12));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('is the date-range filter of the list: choosing it filters the rows too', async () => {
            const user = userEvent.setup();
            renderList({ period });
            const control = await screen.findByRole('radiogroup', { name: 'Period' });
            expect(within(control).getByRole('radio', { name: '7 days' })).toBeChecked();
            await waitFor(() => expect(search().get('period')).toBe('7d'));
            expect(search().get('filter[submitted_at][from]')).toBe('2026-10-03');
            expect(search().get('filter[submitted_at][to]')).toBe('2026-10-09');
            await waitFor(async () => expect(await rows()).toBe(4));
            expect(await widget('shown').findByRole('link', { name: /^Entries 4/ })).toBeVisible();
            expect(
                await widget('everything').findByRole('link', { name: /^All entries 6/ }),
            ).toBeVisible();

            await user.click(within(control).getByRole('radio', { name: '30 days' }));
            expect(search().get('period')).toBe('30d');
            expect(search().get('filter[submitted_at][from]')).toBe('2026-09-10');
            await waitFor(async () => expect(await rows()).toBe(6));
            expect(await widget('shown').findByRole('link', { name: /^Entries 6/ })).toBeVisible();
        });

        it('takes the days of today for the period of the URL', async () => {
            renderList({
                period,
                path: '?period=30d&filter[submitted_at][from]=2026-01-01&filter[submitted_at][to]=2026-01-31',
            });
            await waitFor(() =>
                expect(search().get('filter[submitted_at][from]')).toBe('2026-09-10'),
            );
            expect(search().get('filter[submitted_at][to]')).toBe('2026-10-09');
            expect(
                within(await screen.findByRole('radiogroup', { name: 'Period' })).getByRole(
                    'radio',
                    { name: '30 days' },
                ),
            ).toBeChecked();
        });

        it('keeps a range of a link that is no option, and chooses none', async () => {
            const { requests } = renderList({
                period,
                path: '?filter[submitted_at][from]=2026-10-04&filter[submitted_at][to]=2026-10-05',
            });
            await waitFor(async () => expect(await rows()).toBe(2));
            const control = await screen.findByRole('radiogroup', { name: 'Period' });
            expect(within(control).queryByRole('radio', { checked: true })).toBeNull();
            expect(search().get('period')).toBeNull();
            // The widget with data of its own gets the range of the list, without a period
            await waitFor(() =>
                expect(
                    requests.some(
                        (url) =>
                            url.startsWith('/panneau/api/dashboard/widgets/queue?') &&
                            url.includes('filter[submitted_at][from]=2026-10-04') &&
                            !url.includes('period['),
                    ),
                ).toBe(true),
            );
        });
    });
});
