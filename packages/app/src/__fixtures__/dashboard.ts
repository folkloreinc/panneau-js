import type { DefinitionInput, Widget } from '@panneau/protocol';
import type { MockWidget } from '@panneau/protocol/mock';

import { createDefinition } from './definition';

/** The widgets of the dashboard fixture: each built-in type, on a resource or with its own data. */
export const DASHBOARD_WIDGETS: Widget[] = [
    {
        id: 'to-judge',
        type: 'stat',
        label: 'Entries to judge',
        settings: { resource: 'entries', query: { 'filter[status]': 'to-judge' } },
    },
    { id: 'overdue', type: 'stat', label: 'Overdue' },
    { id: 'answers', type: 'stat', label: 'Answers today' },
    { id: 'per-day', type: 'series', label: 'Entries per day', width: 8 },
    {
        id: 'latest',
        type: 'list',
        label: 'Latest entries',
        width: 4,
        settings: { resource: 'entries', query: { sort: '-title' } },
    },
    { id: 'contests', type: 'list', label: 'Open contests' },
    { id: 'closed', type: 'list', label: 'Closed contests' },
];

/**
 * Widgets on the aggregates of the entries (decision 0084): a count per day, the entries per
 * status, and the sum of their fees against a budget.
 */
export const AGGREGATE_WIDGETS: Widget[] = [
    {
        id: 'fees',
        type: 'stat',
        label: 'Entry fees',
        settings: { resource: 'entries', measure: 'sum:fee', target: 10000 },
    },
    {
        id: 'submitted',
        type: 'series',
        label: 'Entries per day',
        width: 8,
        settings: {
            resource: 'entries',
            group: 'day:submitted_at',
            query: {
                'filter[submitted_at][from]': '2026-10-01',
                'filter[submitted_at][to]': '2026-10-07',
            },
        },
    },
    {
        id: 'by-status',
        type: 'breakdown',
        label: 'Entries by status',
        width: 4,
        settings: { resource: 'entries', group: 'status' },
    },
];

/** A definition with a resource of entries, whose status is a `select` with tones. */
export function createDashboardDefinition(widgets: Widget[] = DASHBOARD_WIDGETS): DefinitionInput {
    return createDefinition({
        resources: [
            {
                id: 'entries',
                label: { singular: 'entry', plural: 'entries' },
                itemTitle: 'title',
                open: 'edit',
                fields: [
                    { name: 'title', type: 'text' },
                    {
                        name: 'status',
                        type: 'select',
                        options: [
                            { value: 'to-judge', label: 'To judge', tone: 'warning' },
                            { value: 'accepted', label: 'Accepted', tone: 'success' },
                            { value: 'refused', label: 'Refused' },
                        ],
                    },
                    { name: 'submitted_at', type: 'datetime' },
                    { name: 'fee', type: 'money', settings: { currency: 'CAD' } },
                ],
                list: {
                    columns: [{ field: 'title' }, { field: 'status' }],
                    filters: [
                        { id: 'status', type: 'select' },
                        { id: 'submitted_at', type: 'date-range' },
                    ],
                    sorts: ['title'],
                    aggregates: { sum: ['fee'], groupBy: ['status'], dates: ['submitted_at'] },
                },
                abilities: { viewAny: true },
            },
        ],
        pages: { home: { component: 'dashboard' } },
        dashboard: { widgets },
    });
}

/** The date an entry was submitted, and its fee in cents. */
function entry(day: string, fee: number) {
    return { submitted_at: `${day}T14:00:00Z`, fee: { amount: fee, currency: 'CAD' } };
}

/** The items of the entries. */
export const DASHBOARD_ITEMS = {
    entries: [
        { id: '1', title: 'A garden in winter', status: 'to-judge', ...entry('2026-10-01', 2500) },
        { id: '2', title: 'Bridges at night', status: 'accepted', ...entry('2026-10-01', 2500) },
        { id: '3', title: 'City lights', status: 'to-judge', ...entry('2026-10-03', 2500) },
        { id: '4', title: 'Dunes', status: 'refused', ...entry('2026-10-04', 1500) },
        { id: '5', title: 'Early frost', status: 'accepted', ...entry('2026-10-04', 1500) },
        { id: '6', title: 'Fog on the river', status: 'accepted', ...entry('2026-10-06', 1500) },
    ],
};

const PER_DAY = [4, 6, 3, 8, 12, 9, 14, 11, 7, 10, 15, 13, 9, 16];

/** The data of the widgets with data of their own, for the mock backend. */
export const DASHBOARD_DATA: Record<string, MockWidget> = {
    overdue: { value: 3, help: 'Since Monday', tone: 'danger', url: '/panneau/resources/entries' },
    answers: { value: 128, help: '12 more than yesterday' },
    'per-day': {
        period: 'day',
        points: PER_DAY.map((value, index) => ({
            date: `2026-10-${String(index + 5).padStart(2, '0')}`,
            value,
        })),
        total: PER_DAY.reduce((sum, value) => sum + value, 0),
    },
    contests: {
        items: [
            {
                title: 'Spring photo contest',
                meta: '12 entries',
                url: '/panneau/resources/entries',
                badge: { label: 'Open', tone: 'success' },
            },
            {
                title: 'Short stories',
                description: 'Closes Friday',
                meta: '3 entries',
                badge: { label: 'Closes soon', tone: 'warning' },
            },
        ],
        url: '/panneau/resources/entries',
    },
    closed: { items: [], empty: 'No closed contests.' },
};
