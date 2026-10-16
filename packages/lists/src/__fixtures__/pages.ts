import type { Action, Field } from '@panneau/protocol';

import type { ListColumn, ListItem } from '../types';

export const statusField: Field = {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
    ],
};

export const columns: ListColumn[] = [
    {
        id: 'title',
        label: 'Title',
        sortable: true,
        field: { name: 'title', type: 'text', label: 'Title', localized: true },
        display: 'text',
    },
    { id: 'status', label: 'Status', field: statusField, display: 'select' },
    { id: 'published_on', label: 'Published on', display: 'date', sortable: true },
];

export const pages: ListItem[] = [
    {
        id: '1',
        title: { en: 'About us', fr: 'À propos' },
        status: 'published',
        published_on: '2026-03-02',
        abilities: { update: true, delete: true, publish: false },
    },
    {
        id: '2',
        title: { en: 'Contact', fr: 'Contact' },
        status: 'draft',
        published_on: null,
        abilities: { update: true, delete: true, publish: true },
    },
    {
        id: '3',
        title: { en: 'Blog', fr: 'Blogue' },
        status: 'draft',
        published_on: null,
        abilities: { update: true, delete: false, publish: true },
    },
];

export const publish: Action = {
    id: 'publish',
    label: 'Publish',
    kind: 'server',
    scope: ['item', 'selection'],
    confirm: { message: 'Publish {count, plural, one {# page} other {# pages}}?' },
};

export const remove: Action = {
    id: 'delete',
    label: 'Delete',
    kind: 'server',
    scope: ['item', 'selection'],
    placement: ['menu', 'toolbar'],
    destructive: true,
};

export const edit: Action = {
    id: 'edit',
    label: 'Edit',
    kind: 'link',
    url: '/pages/{id}/edit',
    scope: ['item'],
};

export const exportAction: Action = {
    id: 'export',
    label: 'Export',
    kind: 'server',
    scope: ['resource'],
};

/** Many pages, for pagination. */
export function manyPages(count: number): ListItem[] {
    return Array.from({ length: count }, (_, index) => ({
        id: String(index + 1),
        title: { en: `Page ${String(index + 1).padStart(2, '0')}` },
        status: index % 2 === 0 ? 'draft' : 'published',
        published_on: null,
    }));
}
