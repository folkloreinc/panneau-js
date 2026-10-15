import { describe, expect, it } from 'vitest';

import { fromDateTime, fromTime, toCalendarDate, toDateTime, toTime } from './dates';

describe('dates', () => {
    it('reads dates', () => {
        expect(toCalendarDate('2026-10-15')?.toString()).toBe('2026-10-15');
        expect(toCalendarDate('2026-10-15T10:00:00Z')?.toString()).toBe('2026-10-15');
        expect(toCalendarDate('2026-13-45')).toBeNull();
        expect(toCalendarDate(null)).toBeNull();
    });

    it('reads and writes date-times', () => {
        const zoned = toDateTime('2026-10-15T13:30:00Z', 'America/Toronto');
        expect(zoned?.hour).toBe(9);
        expect(zoned !== null ? fromDateTime(zoned) : null).toBe('2026-10-15T13:30:00Z');
        const offset = toDateTime('2026-10-15T13:30:00+02:00', 'UTC');
        expect(offset !== null ? fromDateTime(offset) : null).toBe('2026-10-15T11:30:00Z');
        const local = toDateTime('2026-10-15 09:30:00');
        expect(local !== null ? fromDateTime(local) : null).toBe('2026-10-15T09:30:00');
        expect(toDateTime('soon')).toBeNull();
    });

    it('reads and writes times', () => {
        const time = toTime('9:05');
        expect(time?.hour).toBe(9);
        expect(time !== null ? fromTime(time) : null).toBe('09:05');
        expect(time !== null ? fromTime(time, true) : null).toBe('09:05:00');
        expect(toTime('noon')).toBeNull();
    });
});
