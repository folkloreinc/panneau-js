import { getBoundDay, getDateRangeSettings, isDateRangeValue } from '@panneau/fields/daterange';
import type { Field } from '@panneau/protocol';

const DAY_MS = 86_400_000;

function addDays(day: string, count: number): string {
    return new Date(Date.parse(`${day}T00:00:00Z`) + count * DAY_MS).toISOString().slice(0, 10);
}

/** The time zone of a calendar's field: its `settings.timeZone`, or `null`. */
export function getCalendarTimeZone(field: Field | null | undefined): string | null {
    return field !== null && field !== undefined
        ? getDateRangeSettings({ ...field.settings, time: true }).timeZone
        : null;
}

/**
 * The days an item shows on, within the days shown (`2026-10-26` to `2026-12-06`): the day of a
 * `date` or a `datetime`, in the time zone (the browser's without one), or each day a `daterange`
 * covers (decision 0053). A range open at its end shows on its first day; one open at its start, on
 * its last.
 */
export function getItemDays(
    value: unknown,
    shown: { first: string; last: string },
    timeZone?: string | null,
): string[] {
    if (isDateRangeValue(value)) {
        const zone = value.timeZone ?? timeZone ?? undefined;
        const first = getBoundDay(value.start, zone);
        const last = getBoundDay(value.end, zone);
        if (first === null || last === null) {
            const day = first ?? last;
            return day !== null && day >= shown.first && day <= shown.last ? [day] : [];
        }
        const days: string[] = [];
        let day = first > shown.first ? first : shown.first;
        const end = last < shown.last ? last : shown.last;
        while (day <= end) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    }
    const day = typeof value === 'string' ? getBoundDay(value, timeZone ?? undefined) : null;
    return day !== null ? [day] : [];
}
