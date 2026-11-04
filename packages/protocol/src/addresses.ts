// Addresses (decision 0054): their required parts, and postal codes by country, which clients and
// backends normalize, and whose formats the `postalCode` rule checks. This module doesn't import
// zod.
import { ADDRESS_PARTS, type AddressPart, DEFAULT_ADDRESS_REQUIRED_PARTS } from './constants';
import type { Field } from './schemas/field';

/** The formats of normalized postal codes, for the countries whose postal codes are checked. */
const FORMATS: Readonly<Record<string, RegExp>> = {
    // Letters that Canada Post doesn't use (D, F, I, O, Q, U, and W or Z first) are refused
    CA: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$/,
    US: /^\d{5}(-\d{4})?$/,
};

/** The countries whose postal codes the `postalCode` rule checks: Canada and the United States. */
export const POSTAL_CODE_COUNTRIES: readonly string[] = Object.keys(FORMATS);

/** Capitals, with the spaces trimmed and collapsed: the postal codes of other countries. */
function normalizeText(code: string): string {
    return code.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * A postal code in the format of its country: `H2X 1Y4` for Canada (`h2x1y4`), `12345-6789` for
 * the United States (`123456789`). Elsewhere, or when it doesn't read as one of its country, the
 * code in capitals, its spaces collapsed.
 */
export function normalizePostalCode(code: string, country?: string | null): string {
    const compact = code.replace(/[\s-]+/g, '').toUpperCase();
    switch (country?.toUpperCase()) {
        case 'CA':
            return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(compact)
                ? `${compact.slice(0, 3)} ${compact.slice(3)}`
                : normalizeText(code);
        case 'US':
            if (/^\d{5}$/.test(compact)) {
                return compact;
            }
            return /^\d{9}$/.test(compact)
                ? `${compact.slice(0, 5)}-${compact.slice(5)}`
                : normalizeText(code);
        default:
            return normalizeText(code);
    }
}

/**
 * Whether a postal code is one of its country, once normalized. Postal codes of countries whose
 * format Panneau doesn't check (`POSTAL_CODE_COUNTRIES`), or without a country, pass.
 */
export function isPostalCode(code: string, country?: string | null): boolean {
    const format =
        country !== undefined && country !== null ? FORMATS[country.toUpperCase()] : undefined;
    return format === undefined || format.test(normalizePostalCode(code, country));
}

/** Whether a value is one of the parts of an address. */
export function isAddressPart(value: unknown): value is AddressPart {
    return typeof value === 'string' && (ADDRESS_PARTS as readonly string[]).includes(value);
}

/**
 * The parts a filled address of a field must have: those of `settings.required`, or `street`,
 * `city` and `country`.
 */
export function getAddressRequiredParts(field: Pick<Field, 'settings'>): AddressPart[] {
    const setting = field.settings?.required;
    return Array.isArray(setting)
        ? setting.filter(isAddressPart)
        : [...DEFAULT_ADDRESS_REQUIRED_PARTS];
}
