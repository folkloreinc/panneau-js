import type { AddressValue } from '@panneau/protocol';
import { ADDRESS_PARTS, normalizePostalCode } from '@panneau/protocol/runtime';

import { REGION_COUNTRIES, getRegionName } from '../region/regions';

export type { AddressValue };

/** Whether a value is an address: an object, whose parts are checked as they are read. */
export function isAddress(value: unknown): value is AddressValue {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Whether the addresses of a country end with the city, the region and the postal code
 * (`Montréal QC H2X 1Y4`): those of the countries whose regions Panneau knows, and an address
 * without a country. Elsewhere, the postal code comes first (`75001 Paris`).
 */
export function endsWithRegion(country: string | null | undefined): boolean {
    return country === null || country === undefined || REGION_COUNTRIES.includes(country);
}

/** The text of a part, trimmed, or `undefined` when it is empty or isn't text. */
function partText(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/**
 * An address without its empty parts, with `country` when it has a part and no country, and the
 * postal code normalized for its country. `null` when nothing is left.
 */
export function cleanAddress(
    address: Partial<Record<keyof AddressValue, unknown>>,
    country?: string | null,
): AddressValue | null {
    const next: AddressValue = {};
    ADDRESS_PARTS.forEach((part) => {
        const text = typeof address[part] === 'string' ? (address[part] as string) : undefined;
        // Spaces typed at the end stay while the part is typed
        if (text !== undefined && text.trim() !== '') {
            next[part] = text;
        }
    });
    const point = address.point;
    if (
        point !== null &&
        typeof point === 'object' &&
        typeof (point as { lat?: unknown }).lat === 'number' &&
        typeof (point as { lng?: unknown }).lng === 'number'
    ) {
        next.point = point as NonNullable<AddressValue['point']>;
    }
    if (Object.keys(next).length === 0) {
        return null;
    }
    if (next.country === undefined && country !== null && country !== undefined) {
        next.country = country;
    }
    return next;
}

/**
 * An address on one line, in the order of its country, without the country:
 * `1234 Rue Saint-Denis, App. 5, Montréal QC H2X 1Y4`, `12 rue de Rivoli, 75001 Paris`. The
 * region is its code in Canada and the United States, as on envelopes, and its name in the locale
 * for the other countries whose regions Panneau knows.
 */
export function formatAddress(address: AddressValue, locale: string): string {
    const country = partText(address.country);
    const regionCode = partText(address.region);
    const region =
        regionCode !== undefined && country !== 'CA' && country !== 'US'
            ? (getRegionName(country, regionCode, locale) ?? regionCode)
            : regionCode;
    const postalCode =
        partText(address.postalCode) !== undefined
            ? normalizePostalCode(address.postalCode ?? '', country)
            : undefined;
    const city = partText(address.city);
    const locality = endsWithRegion(country)
        ? [city, [region, postalCode].filter(Boolean).join(' ')]
        : [[postalCode, city].filter(Boolean).join(' '), region];
    return [partText(address.street), partText(address.unit), ...locality]
        .filter((part) => part !== undefined && part !== '')
        .join(', ');
}
