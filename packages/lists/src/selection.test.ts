import { describe, expect, it } from 'vitest';

import { countSelected, getPageSelection, isItemSelected } from './selection';

const items = [{ id: '1' }, { id: '2' }];

describe('selection', () => {
    it('reads a selection of ids', () => {
        const selection = { mode: 'ids', ids: ['1'] } as const;
        expect(isItemSelected(selection, '1')).toBe(true);
        expect(isItemSelected(selection, '2')).toBe(false);
        expect(countSelected(selection, 40)).toBe(1);
        expect(getPageSelection(selection, items)).toBe('some');
    });

    it('reads a selection of every matching item, with exceptions', () => {
        const selection = { mode: 'all', except: ['2'] } as const;
        expect(isItemSelected(selection, '1')).toBe(true);
        expect(isItemSelected(selection, '2')).toBe(false);
        expect(isItemSelected(selection, '99')).toBe(true);
        expect(countSelected(selection, 40)).toBe(39);
        expect(getPageSelection({ mode: 'all', except: [] }, items)).toBe('all');
    });

    it('selects nothing on an empty page', () => {
        expect(getPageSelection({ mode: 'all', except: [] }, [])).toBe('none');
    });
});
