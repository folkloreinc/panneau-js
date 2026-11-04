import { describe, expect, it } from 'vitest';

import { formatDateRange, getDateRangeSettings, getRangeDays, isDateRangeValue } from './range';

/** The text, with the spaces of `Intl` as plain spaces. */
const text = (value: ReturnType<typeof formatDateRange>) =>
    value === null ? null : { ...value, text: value.text.replace(/\s/g, ' ') };

describe('date ranges', () => {
    it('formats ranges of days, and ranges open at one end', () => {
        expect(text(formatDateRange({ start: '2026-11-04', end: '2026-11-06' }, 'en-US'))).toEqual({
            kind: 'range',
            text: 'Nov 4 – 6, 2026',
        });
        expect(text(formatDateRange({ start: '2026-11-04', end: null }, 'en-US'))).toEqual({
            kind: 'from',
            text: 'Nov 4, 2026',
        });
        expect(text(formatDateRange({ start: null, end: '2026-12-01' }, 'fr-CA'))).toEqual({
            kind: 'until',
            text: '1 déc. 2026',
        });
        expect(formatDateRange({ start: null, end: null }, 'en-US')).toBeNull();
        expect(formatDateRange('2026-11-04', 'en-US')).toBeNull();
    });

    it('formats date-times in the time zone of the value or the field', () => {
        expect(
            text(
                formatDateRange(
                    { start: '2026-11-05T00:30:00Z', end: '2026-11-05T02:00:00Z' },
                    'en-US',
                    'America/Toronto',
                ),
            )?.text,
        ).toMatch(/^Nov 4, 2026, 7:30 – 9:00 PM( EST)?$/);
        expect(
            text(
                formatDateRange(
                    {
                        start: '2026-11-04T18:30:00Z',
                        end: '2026-11-04T20:00:00Z',
                        timeZone: 'Europe/Paris',
                    },
                    'en-US',
                    'America/Toronto',
                ),
            )?.text,
        ).toMatch(/^Nov 4, 2026, 7:30 – 9:00 PM( GMT\+1)?$/);
    });

    it('gives the days a range covers, in its time zone', () => {
        expect(
            getRangeDays(
                { start: '2026-11-05T00:30:00Z', end: '2026-11-06T02:00:00Z' },
                'America/Toronto',
            ),
        ).toEqual({ first: '2026-11-04', last: '2026-11-05' });
        expect(getRangeDays({ start: '2026-11-04', end: null })).toEqual({
            first: '2026-11-04',
            last: null,
        });
        expect(getRangeDays(null)).toEqual({ first: null, last: null });
    });

    it('reads values and settings', () => {
        expect(isDateRangeValue({ start: '2026-11-04', end: null })).toBe(true);
        expect(isDateRangeValue({ amount: 1 })).toBe(false);
        expect(
            getDateRangeSettings({ allDay: true, open: 'end', timeZone: 'Nowhere/Here' }),
        ).toEqual({
            time: false,
            allDay: false,
            open: 'end',
            timeZone: null,
            chooseTimeZone: false,
        });
    });
});
