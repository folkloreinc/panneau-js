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
