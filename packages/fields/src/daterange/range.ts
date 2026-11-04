import type { DateRangeOpenBound } from '@panneau/protocol/runtime';

/**
 * A `daterange` value as a field holds it (decision 0053): days (`2026-11-04`) or date-times with
 * an offset, either `null` while it is empty, with `allDay` for an all-day range and the `timeZone`
 * the user chose.
 */
export interface DateRangeFieldValue {
    start: string | null;
    end: string | null;
    allDay?: boolean;
    timeZone?: string;
}

/** The settings of a `daterange` field, from its definition. */
export interface DateRangeSettings {
    /** The bounds are date-times. */
    time: boolean;
    /** The field has an "All day" switch. */
    allDay: boolean;
    /** The bounds that can be `null`. */
    open: DateRangeOpenBound | null;
    /** The time zone the date-times are shown and typed in. */
    timeZone: string | null;
    /** The field has a menu of time zones, kept in the value. */
    chooseTimeZone: boolean;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const isBound = (value: unknown): value is string | null =>
    value === null || value === undefined || typeof value === 'string';

/** Whether a value is a `daterange` value: an object with a start and an end. */
export function isDateRangeValue(value: unknown): value is DateRangeFieldValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        ('start' in value || 'end' in value) &&
        isBound((value as { start?: unknown }).start) &&
        isBound((value as { end?: unknown }).end)
    );
}

/** The settings of a `daterange` field (`settings.time`, `allDay`, `open`, `timeZone`…). */
export function getDateRangeSettings(
    settings: Record<string, unknown> | undefined,
): DateRangeSettings {
    const open = settings?.open;
    const timeZone = settings?.timeZone;
    return {
        time: settings?.time === true,
        allDay: settings?.allDay === true && settings.time === true,
        open: open === 'start' || open === 'end' || open === 'both' ? open : null,
        timeZone: typeof timeZone === 'string' && isTimeZone(timeZone) ? timeZone : null,
        chooseTimeZone: settings?.chooseTimeZone === true && settings.time === true,
    };
}

/** Whether a string is an IANA time zone that the browser knows (`America/Toronto`). */
export function isTimeZone(zone: string): boolean {
    try {
        new Intl.DateTimeFormat('en', { timeZone: zone });
        return true;
    } catch {
        return false;
    }
}

/** The time zones the browser knows, `UTC` first. */
export function getTimeZones(): string[] {
    const zones =
        typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
    return ['UTC', ...zones.filter((zone) => zone !== 'UTC')];
}

function pad(value: number, length = 2): string {
    return String(value).padStart(length, '0');
}

/** The day of a date-time in a time zone (the browser's without one), as `2026-11-04`. */
function dayIn(date: Date, timeZone: string | undefined): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date);
    const part = (type: string) => Number(parts.find((entry) => entry.type === type)?.value);
    return `${pad(part('year'), 4)}-${pad(part('month'))}-${pad(part('day'))}`;
}

/** The day of a bound: a day as it is, a date-time in the time zone. `null` when invalid. */
export function getBoundDay(bound: string | null | undefined, timeZone?: string): string | null {
    if (bound === null || bound === undefined || bound === '') {
        return null;
    }
    if (DAY.test(bound)) {
        return bound;
    }
    const date = new Date(bound);
    return Number.isNaN(date.getTime()) ? null : dayIn(date, timeZone);
}

/**
 * The first and the last day of a range, in its time zone: the value's, the field's, or the
 * browser's. A day bound is that day.
 */
export function getRangeDays(
    value: unknown,
    fieldTimeZone?: string | null,
): { first: string | null; last: string | null } {
    if (!isDateRangeValue(value)) {
        return { first: null, last: null };
    }
    const zone = value.timeZone ?? fieldTimeZone ?? undefined;
    return { first: getBoundDay(value.start, zone), last: getBoundDay(value.end, zone) };
}

/** A range in a locale: both bounds, or one of them for a range open at the other end. */
export type FormattedDateRange =
    | { kind: 'range'; text: string }
    | { kind: 'from'; text: string }
    | { kind: 'until'; text: string };

/**
 * A range in the format of a locale, with `Intl.DateTimeFormat.formatRange`: `Nov 4 – 6, 2026`,
 * `Nov 4, 2026, 7:30 – 9:00 PM`. Date-times show in the zone of the value, or the field's, with
 * the zone's short name when it isn't the browser's. `null` for an empty or invalid value.
 */
export function formatDateRange(
    value: unknown,
    locale: string,
    fieldTimeZone?: string | null,
): FormattedDateRange | null {
    if (!isDateRangeValue(value)) {
        return null;
    }
    const bounds = [value.start, value.end].map((bound) =>
        bound === null || bound === undefined || bound === '' ? null : bound,
    );
    const days = bounds.every((bound) => bound === null || DAY.test(bound));
    const toDate = (bound: string) => new Date(DAY.test(bound) ? `${bound}T00:00:00Z` : bound);
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zone = value.timeZone ?? fieldTimeZone ?? undefined;
    const format = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(days
            ? { timeZone: 'UTC' }
            : {
                  hour: 'numeric',
                  minute: '2-digit',
                  ...(zone !== undefined ? { timeZone: zone } : {}),
                  ...(zone !== undefined && zone !== local ? { timeZoneName: 'short' } : {}),
              }),
    });
    const dates = bounds.map((bound) => (bound !== null ? toDate(bound) : null));
    if (dates.some((date) => date !== null && Number.isNaN(date.getTime()))) {
        return null;
    }
    const [from, to] = dates;
    if (from !== null && from !== undefined && to !== null && to !== undefined) {
        try {
            return { kind: 'range', text: format.formatRange(from, to) };
        } catch {
            // An end before its start, which some engines refuse to format as a range.
            return { kind: 'range', text: `${format.format(from)} – ${format.format(to)}` };
        }
    }
    if (from !== null && from !== undefined) {
        return { kind: 'from', text: format.format(from) };
    }
    if (to !== null && to !== undefined) {
        return { kind: 'until', text: format.format(to) };
    }
    return null;
}
