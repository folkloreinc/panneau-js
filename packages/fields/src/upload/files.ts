/** Whether a MIME type matches one of the patterns of an `accept` rule (`image/*`, `application/pdf`). */
export function matchesMime(mime: string, patterns: readonly string[]): boolean {
    return patterns.some((pattern) =>
        pattern.endsWith('/*') ? mime.startsWith(pattern.slice(0, -1)) : mime === pattern,
    );
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** A size in bytes, for people: `1.5 MB`. Uses the locale's number format. */
export function formatSize(bytes: number, locale?: string): string {
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }
    const number = new Intl.NumberFormat(locale, {
        maximumFractionDigits: unit === 0 || value >= 10 ? 0 : 1,
    }).format(value);
    return `${number} ${UNITS[unit] ?? 'B'}`;
}
