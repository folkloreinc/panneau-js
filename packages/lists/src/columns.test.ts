import { describe, expect, it } from 'vitest';

import { getDefaultColumns, getShownColumns } from './columns';
import type { ListColumn } from './types';

const columns: ListColumn[] = [
    { id: 'title', hideable: false },
    { id: 'status' },
    { id: 'author', hidden: true },
    { id: 'email', hidden: true, hideable: false },
];
const ids = (shown: readonly ListColumn[]) => shown.map((column) => column.id);

describe('getShownColumns', () => {
    it('shows the columns that are not hidden by default', () => {
        expect(ids(getDefaultColumns(columns))).toEqual(['title', 'status', 'email']);
        expect(ids(getShownColumns(columns, undefined))).toEqual(['title', 'status', 'email']);
    });

    it('shows the chosen columns in their order, with those that cannot be hidden', () => {
        expect(ids(getShownColumns(columns, ['author', 'status', 'title']))).toEqual([
            'author',
            'status',
            'title',
            'email',
        ]);
        expect(ids(getShownColumns(columns, ['status', 'missing', 'status']))).toEqual([
            'title',
            'status',
            'email',
        ]);
        expect(ids(getShownColumns(columns, ['missing']))).toEqual(['title', 'email']);
        expect(ids(getShownColumns([{ id: 'a' }], ['missing']))).toEqual(['a']);
    });
});
