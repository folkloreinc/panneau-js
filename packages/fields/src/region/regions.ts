import { REGIONS } from './data';

/** A region of a country: its code without the country (`QC`), and its name in a locale. */
export interface Region {
    code: string;
    name: string;
}

/** The countries whose regions Panneau knows, by code. */
export const REGION_COUNTRIES: readonly string[] = Object.keys(REGIONS);

function nameIn(entry: readonly [string, string, string?], locale: string): string {
    return locale.toLowerCase().startsWith('fr') ? (entry[2] ?? entry[1]) : entry[1];
}

/**
 * The regions of a country, with their names in the locale (French or English), sorted by name.
 * `null` for a country whose regions Panneau doesn't know.
 */
export function getRegions(country: string | null | undefined, locale: string): Region[] | null {
    const entries = country !== null && country !== undefined ? REGIONS[country] : undefined;
    if (entries === undefined) {
        return null;
    }
    const collator = new Intl.Collator(locale);
    return entries
        .map((entry) => ({ code: entry[0], name: nameIn(entry, locale) }))
        .sort((a, b) => collator.compare(a.name, b.name));
}

/** The name of a region of a country in the locale, or `null` when Panneau doesn't know it. */
export function getRegionName(
    country: string | null | undefined,
    code: string,
    locale: string,
): string | null {
    const entries = country !== null && country !== undefined ? REGIONS[country] : undefined;
    const entry = entries?.find((item) => item[0] === code);
    return entry !== undefined ? nameIn(entry, locale) : null;
}
