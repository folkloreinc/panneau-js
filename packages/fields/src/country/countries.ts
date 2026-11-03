import { COUNTRY_CODES } from './codes';

export { COUNTRY_CODES };

/** A country to choose: its code, its name in a locale, and its flag. */
export interface CountryChoice {
    /** ISO 3166-1 alpha-2 code, in capitals: `CA`. */
    code: string;
    name: string;
    flag: string;
}

const CODE = /^[A-Z]{2}$/;

/** Whether a value is a code of `COUNTRY_CODES`. */
export function isCountryCode(value: unknown): value is string {
    return typeof value === 'string' && COUNTRY_CODES.includes(value);
}

/** The flag of a country, as an emoji: two regional indicator symbols. */
export function getCountryFlag(code: string): string {
    if (!CODE.test(code)) {
        return '';
    }
    return String.fromCodePoint(...[...code].map((letter) => 0x1f1a5 + letter.charCodeAt(0)));
}

const displayNames = new Map<string, Intl.DisplayNames>();

/** The name of a country in a locale (`Canada`, `Allemagne`), or its code when unknown. */
export function getCountryName(code: string, locale: string): string {
    let names = displayNames.get(locale);
    if (names === undefined) {
        names = new Intl.DisplayNames([locale, 'en'], { type: 'region', fallback: 'code' });
        displayNames.set(locale, names);
    }
    try {
        return names.of(code) ?? code;
    } catch {
        return code;
    }
}

export interface CountryChoicesOptions {
    /** The codes to offer. All countries without it. */
    countries?: readonly string[] | undefined;
    /** Codes shown first, in their order, above the others. */
    preferred?: readonly string[] | undefined;
}

/**
 * The countries to choose from, with their names in the locale: the preferred ones first, in
 * their order, then the others, sorted by name in the locale.
 */
export function getCountryChoices(
    locale: string,
    { countries, preferred = [] }: CountryChoicesOptions = {},
): { preferred: CountryChoice[]; others: CountryChoice[] } {
    const codes = (countries ?? COUNTRY_CODES).filter(isCountryCode);
    const choice = (code: string): CountryChoice => ({
        code,
        name: getCountryName(code, locale),
        flag: getCountryFlag(code),
    });
    const first = preferred.filter((code) => codes.includes(code));
    const collator = new Intl.Collator(locale);
    return {
        preferred: first.map(choice),
        others: codes
            .filter((code) => !first.includes(code))
            .map(choice)
            .sort((a, b) => collator.compare(a.name, b.name)),
    };
}

/** The region of a locale (`fr-CA` gives `CA`), or `null`. */
export function getLocaleCountry(locale: string): string | null {
    try {
        const region = new Intl.Locale(locale).maximize().region;
        return region !== undefined && isCountryCode(region) ? region : null;
    } catch {
        return null;
    }
}
