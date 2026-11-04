import {
    AsYouType,
    type CountryCode,
    getCountries,
    getCountryCallingCode,
    isSupportedCountry,
    parsePhoneNumberFromString,
} from 'libphonenumber-js/min';

/** An international number in E.164, as the `tel` rule of the protocol checks it. */
const E164 = /^\+[1-9]\d{6,14}$/;

/** A phone number read from an E.164 value. */
export interface PhoneNumber {
    /** The value, in E.164: `+15145550199`. */
    number: string;
    /** The country of the number, or `null` for a number of no country (`+800`). */
    country: string | null;
    /** The digits after the calling code: `5145550199`. */
    nationalNumber: string;
    /** In the format of its country: `(514) 555-0199`. */
    national: string;
    /** With its calling code: `+1 514 555 0199`. */
    international: string;
}

function asCountry(country: string | null | undefined): CountryCode | undefined {
    return country !== null && country !== undefined && isSupportedCountry(country)
        ? country
        : undefined;
}

/** A value in E.164 that is a valid number, read. `null` for any other value. */
export function parsePhone(value: unknown): PhoneNumber | null {
    if (typeof value !== 'string' || !E164.test(value)) {
        return null;
    }
    const number = parsePhoneNumberFromString(value);
    if (number === undefined || !number.isValid()) {
        return null;
    }
    return {
        number: number.number,
        country: number.country ?? null,
        nationalNumber: number.nationalNumber,
        national: number.formatNational(),
        international: number.formatInternational(),
    };
}

/**
 * The value of a typed number: in E.164 once it is a valid number of its country, the text as
 * typed (trimmed) until then, or `null` when empty. A number typed with its calling code (`+33…`)
 * gives its own country.
 */
export function readPhone(
    text: string,
    country: string | null,
): { value: string | null; country: string | null } {
    const trimmed = text.trim();
    if (trimmed === '') {
        return { value: null, country: null };
    }
    const typer = new AsYouType(asCountry(country));
    typer.input(trimmed);
    const number = typer.getNumber();
    if (number?.isValid() === true) {
        return { value: number.number, country: number.country ?? null };
    }
    return {
        value: trimmed,
        country: typer.isInternational() ? (typer.getCountry() ?? null) : null,
    };
}

/** A number being typed, in the format of its country: `514555` gives `(514) 555`. */
export function formatPhoneInput(text: string, country: string | null): string {
    return new AsYouType(asCountry(country)).input(text);
}

/** The calling code of a country, without `+` (`1` for `CA`), or `null`. */
export function getCallingCode(country: string | null | undefined): string | null {
    const code = asCountry(country);
    return code !== undefined ? getCountryCallingCode(code) : null;
}

/** The countries that have calling codes. */
export function getPhoneCountries(): string[] {
    return getCountries();
}

/** The longest extension a value can have, in digits. */
export const MAX_EXTENSION_LENGTH = 10;

/** A value with an extension after `;ext=`, as in a `tel:` URI (RFC 3966). */
const STORED_EXTENSION = /^(.*);ext=(\d{1,10})$/s;

/**
 * An extension typed after a number: `514 555-0199 ext. 123`, `x123`, `poste 123`, `;ext=123`. The
 * number ends with a digit or a parenthesis.
 */
const TYPED_EXTENSION = /^(.*?[\d)])[\s,;]*(?:extension|ext|poste|x)\s*[.:=#]?\s*(\d{1,10})$/is;

/** A value split into its number and its extension. */
export interface PhoneParts {
    /** The number: E.164, or the text as typed. `null` when empty. */
    number: string | null;
    /** The digits of the extension, or `null` without one. */
    extension: string | null;
}

/**
 * The number and the extension of a value: `+15145550199;ext=123` gives `+15145550199` and `123`.
 * A value without `;ext=` is a number without an extension. To send a value to a service that
 * doesn't take extensions (SMS), keep its `number`.
 */
export function splitExtension(value: string | null | undefined): PhoneParts {
    const match = STORED_EXTENSION.exec(value ?? '');
    if (match === null) {
        return {
            number: value === undefined || value === '' ? null : (value ?? null),
            extension: null,
        };
    }
    const [, number = '', extension = null] = match;
    return { number: number === '' ? null : number, extension };
}

/**
 * A number with its extension, after `;ext=`: `+15145550199;ext=123`. Without an extension, the
 * number as it is.
 */
export function joinExtension(
    number: string | null | undefined,
    extension: string | null | undefined,
): string | null {
    if (extension === null || extension === undefined || extension === '') {
        return number === undefined || number === '' ? null : (number ?? null);
    }
    return `${number ?? ''};ext=${extension}`;
}

/**
 * The extension typed after a number, as people write it: `514 555-0199 ext. 123`, `x123`,
 * `poste 123`, or `;ext=123`. `null` when the text has none.
 */
export function readExtension(text: string): { number: string; extension: string } | null {
    const match = TYPED_EXTENSION.exec(text.trim());
    if (match === null) {
        return null;
    }
    const [, number = '', extension = ''] = match;
    return { number: number.trim(), extension };
}
