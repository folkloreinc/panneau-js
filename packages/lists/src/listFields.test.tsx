import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { PanneauProvider, createList, definePlugin } from '@panneau/core';

import { getListFields, useListFields } from './listFields';
import type { ListColumn } from './types';

const columns: ListColumn[] = [
    { id: 'title', field: { name: 'title', type: 'text' } },
    { id: 'region', field: { name: 'region', type: 'region', from: 'country' } },
    { id: 'author', field: { name: 'author_id', type: 'relation', resource: 'authors' } },
    { id: 'body', field: { name: 'body', type: 'richtext' }, hidden: true },
];

describe('getListFields', () => {
    it('asks for the fields of the columns, with the title and the image of items, sorted', () => {
        expect(
            getListFields({
                columns: columns.slice(0, 3),
                layout: 'table',
                itemTitle: 'name',
                itemImage: 'cover',
            }),
        ).toEqual(['author_id', 'country', 'cover', 'name', 'region', 'title']);
        // A column without a field shows the value of its id
        expect(getListFields({ columns: [{ id: 'created_at' }], layout: 'cards' })).toEqual([
            'created_at',
        ]);
    });

    it('asks for the field of the calendar in the calendar only', () => {
        const calendar = { field: 'starts_at' };
        expect(getListFields({ columns: [], layout: 'calendar', calendar })).toEqual(['starts_at']);
        expect(getListFields({ columns: [], layout: 'table', calendar })).toEqual([]);
    });

    it('asks for every field with a column that renders itself, or a layout of its own', () => {
        expect(
            getListFields({ columns: [{ id: 'id', render: () => null }], layout: 'table' }),
        ).toBeUndefined();
        expect(getListFields({ columns, layout: 'kanban', builtIn: false })).toBeUndefined();
    });
});

describe('useListFields', () => {
    const Kanban = () => null;
    const wrapper = ({ children }: { children: ReactNode }) => (
        <PanneauProvider
            plugins={[definePlugin({ id: 'kanban', listLayouts: { kanban: Kanban } })]}
        >
            {children}
        </PanneauProvider>
    );

    it('follows the columns and the layout the user chooses', () => {
        const list = createList();
        const { result } = renderHook(
            () =>
                useListFields({
                    list,
                    columns,
                    layouts: ['table', 'gallery', 'kanban'],
                    itemTitle: 'title',
                }),
            { wrapper },
        );
        expect(result.current).toEqual(['author_id', 'country', 'region', 'title']);
        act(() => list.setColumns(['body', 'title']));
        expect(result.current).toEqual(['body', 'title']);
        // Without itemImage, the list has no gallery: it stays in the table
        act(() => list.setLayout('gallery'));
        expect(result.current).toEqual(['body', 'title']);
        // A plugin's layout can read any value of the items
        act(() => list.setLayout('kanban'));
        expect(result.current).toBeUndefined();
    });
});
