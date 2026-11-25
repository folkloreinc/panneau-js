const OFFSET = /([+\-−])(\d{2}):(\d{2})/;
const OFFSET_NAME = /^(?:GMT|UTC)(?:[+\-−]|$)/;

function zonePart(
    zone: string,
    locale: string,
    date: Date,
    timeZoneName: 'longGeneric' | 'longOffset',
): string | undefined {
    try {
        return new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName })
            .formatToParts(date)
            .find((part) => part.type === 'timeZoneName')?.value;
    } catch {
        // A zone the engine doesn't know
        return undefined;
    }
}

/**
 * The offset of a time zone from UTC at a date, short: `UTC−4`, `UTC+5:30`, `UTC`. It changes with
 * daylight saving time.
 */
export function formatTimeZoneOffset(zone: string, date: Date = new Date()): string {
    const match = OFFSET.exec(zonePart(zone, 'en', date, 'longOffset') ?? '');
    if (match === null) {
        return 'UTC';
    }
    const [, sign, hours = '00', minutes = '00'] = match;
    if (hours === '00' && minutes === '00') {
        return 'UTC';
    }
    const minus = sign === '+' ? '+' : '−';
    return `UTC${minus}${Number(hours)}${minutes !== '00' ? `:${minutes}` : ''}`;
}

/**
 * The name of a time zone in a locale: its long generic name (`Eastern Time`, `heure de l’Est`),
 * which stays the same through daylight saving time, or the city of its IANA id
 * (`America/Montreal` → `Montreal`) when the locale has no name for it. `null` for zones that are
 * only an offset (`UTC`, `Etc/GMT+5`).
 */
export function getTimeZoneName(
    zone: string,
    locale: string,
    date: Date = new Date(),
): string | null {
    const name = zonePart(zone, locale, date, 'longGeneric');
    if (name !== undefined && !OFFSET_NAME.test(name)) {
        return name;
    }
    if (!zone.includes('/') || zone.startsWith('Etc/')) {
        return null;
    }
    return zone.slice(zone.lastIndexOf('/') + 1).replaceAll('_', ' ');
}

/**
 * A time zone as editors read it: its name in the locale and its offset at that date,
 * `Eastern Time (UTC−4)`, or the offset alone for a zone without a name (`UTC`).
 */
export function formatTimeZone(zone: string, locale: string, date: Date = new Date()): string {
    const name = getTimeZoneName(zone, locale, date);
    const offset = formatTimeZoneOffset(zone, date);
    return name !== null ? `${name} (${offset})` : offset;
}

/**
 * A time zone in short, for a line under a control: its offset at that date and its IANA id,
 * `UTC−4 · America/Toronto`, or the offset alone for a zone that is only an offset (`UTC`).
 */
export function formatTimeZoneShort(zone: string, date: Date = new Date()): string {
    const offset = formatTimeZoneOffset(zone, date);
    return zone.includes('/') && !zone.startsWith('Etc/') ? `${offset} · ${zone}` : offset;
}
