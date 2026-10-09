// A date without time (2026-10-01), or a date at midnight with or without a timezone
// (2026-10-01T00:00:00-04:00, 2026-10-01T00:00:00.000000Z, 2026-10-01 00:00:00)
const DATE_ONLY_PATTERN =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ]00:00(?::00(?:\.0+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Parse a date-only value as a local date, ignoring its timezone.
 *
 * A date stored at midnight represents a calendar day, not an instant: converting it to the
 * browser timezone would show the previous day west of the server timezone (ex: a date saved as
 * 2026-10-01 00:00 UTC is 2026-09-30 20:00 in Montreal). Returns null when the value has a time,
 * so the caller can parse it as an instant.
 */
function parseDateOnly(value: string | null | undefined): Date | null {
    if (typeof value !== 'string') {
        return null;
    }
    const match = DATE_ONLY_PATTERN.exec(value.trim());
    if (match === null) {
        return null;
    }
    const [, year, month, day] = match;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

export default parseDateOnly;
