import {
    type CalendarDate,
    type CalendarDateTime,
    type Time,
    type ZonedDateTime,
    getLocalTimeZone,
    parseAbsolute,
    parseDate,
    parseDateTime,
    parseTime,
} from '@internationalized/date';

/** `2026-10-15`, or the date of a date-time. */
export function toCalendarDate(value: string | null | undefined): CalendarDate | null {
    const match = value?.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match?.[1] === undefined) {
        return null;
    }
    try {
        return parseDate(match[1]);
    } catch {
        return null;
    }
}

const OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * A date-time: with an offset or `Z` (`2026-10-15T13:30:00Z`), in the given time zone; without one
 * (`2026-10-15 09:30:00`), as is.
 */
export function toDateTime(
    value: string | null | undefined,
    timeZone: string = getLocalTimeZone(),
): ZonedDateTime | CalendarDateTime | null {
    if (value === null || value === undefined || value.trim() === '') {
        return null;
    }
    const iso = value.trim().replace(' ', 'T');
    try {
        return OFFSET.test(iso) ? parseAbsolute(iso, timeZone) : parseDateTime(iso);
    } catch {
        return null;
    }
}

/** Writes a date-time: in UTC (`…Z`) when it has a time zone, without an offset otherwise. */
export function fromDateTime(value: ZonedDateTime | CalendarDateTime): string {
    return 'timeZone' in value
        ? value.toAbsoluteString().replace(/\.000Z$/, 'Z')
        : value.toString();
}

/** `09:30` or `09:30:15`. */
export function toTime(value: string | null | undefined): Time | null {
    if (value === null || value === undefined || !/^\d{1,2}:\d{2}(:\d{2})?/.test(value)) {
        return null;
    }
    try {
        return parseTime(value.length < 5 ? `0${value}` : value);
    } catch {
        return null;
    }
}

/** Writes a time as `HH:mm`, or `HH:mm:ss` with seconds. */
export function fromTime(
    value: Pick<Time, 'hour' | 'minute' | 'second'>,
    withSeconds = false,
): string {
    const pad = (part: number) => String(part).padStart(2, '0');
    const time = `${pad(value.hour)}:${pad(value.minute)}`;
    return withSeconds ? `${time}:${pad(value.second)}` : time;
}
