import { describe, expect, it } from 'vitest';

import { currentMonth, getCalendarRange, isMonth, shiftMonth } from './calendar';

describe('the months of a calendar', () => {
    it('reads, moves and covers months', () => {
        expect(isMonth('2026-11')).toBe(true);
        expect(isMonth('2026-13')).toBe(false);
        expect(isMonth('2026-1')).toBe(false);
        expect(currentMonth(new Date(2026, 10, 3))).toBe('2026-11');
        expect(shiftMonth('2026-12', 1)).toBe('2027-01');
        expect(shiftMonth('2026-01', -1)).toBe('2025-12');
        // Every week shown, whatever day it starts on
        expect(getCalendarRange('2026-11')).toEqual({ from: '2026-10-26', to: '2026-12-06' });
        expect(getCalendarRange('2028-02')).toEqual({ from: '2028-01-26', to: '2028-03-06' });
    });
});
