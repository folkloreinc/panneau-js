import {
    CURRENCY_CODES,
    fromMinorUnits,
    getCurrencyDigits,
    isCurrencyCode,
    toMinorUnits,
} from '@panneau/protocol/runtime';

/**
 * A `money` value as a field holds it (decision 0053): an amount in minor units, and its currency,
 * `null` while an amount is typed before a currency is picked, which the `money` rule refuses.
 */
export interface MoneyFieldValue {
    amount: number;
    currency: string | null;
}

/** Whether a value is a `money` value: an amount and a currency, as the field holds it. */
export function isMoneyValue(value: unknown): value is MoneyFieldValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { amount?: unknown }).amount === 'number' &&
        'currency' in value &&
        (typeof value.currency === 'string' || value.currency === null)
    );
}

/** The name of a currency in a locale (`dollar canadien`), or its code. */
export function getCurrencyName(code: string, locale: string): string {
    try {
        return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? code;
    } catch {
        return code;
    }
}

/**
 * The format of an amount of a currency in a locale, with the digits of the currency in ISO 4217:
 * `12,50 $` for 12.50 CAD in French, `¥1,250` for JPY.
 */
export function getMoneyFormatOptions(
    currency: string | null,
    currencyDisplay: Intl.NumberFormatOptions['currencyDisplay'] = 'symbol',
): Intl.NumberFormatOptions {
    const digits = getCurrencyDigits(currency ?? '');
    return {
        ...(currency !== null && isCurrencyCode(currency)
            ? { style: 'currency', currency, currencyDisplay }
            : {}),
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    };
}

/**
 * An amount in minor units with its currency, in the format of the locale: `1 250,00 $` for
 * `{ "amount": 125000, "currency": "CAD" }` in French. `null` for a value that isn't money.
 */
export function formatMoney(value: unknown, locale: string): string | null {
    if (!isMoneyValue(value)) {
        return null;
    }
    const { amount, currency } = value;
    const major = fromMinorUnits(amount, currency ?? '');
    try {
        const text = new Intl.NumberFormat(locale, getMoneyFormatOptions(currency)).format(major);
        return currency !== null && !isCurrencyCode(currency) ? `${text} ${currency}` : text;
    } catch {
        return `${String(major)} ${currency ?? ''}`.trim();
    }
}

/** An amount typed in major units, in minor units of its currency. */
export function toMoneyValue(major: number, currency: string | null): MoneyFieldValue {
    return { amount: toMinorUnits(major, currency ?? ''), currency };
}

export { CURRENCY_CODES, fromMinorUnits, getCurrencyDigits, toMinorUnits };
