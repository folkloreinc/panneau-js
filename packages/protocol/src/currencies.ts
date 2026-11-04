/**
 * The ISO 4217 codes of the currencies a `money` value can have (decision 0053): the currencies in
 * use, and a few withdrawn recently, which stored amounts may still have. Funds, precious metals
 * and test codes are left out.
 */
export const CURRENCY_CODES = [
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT',
    'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD',
    'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP',
    'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF',
    'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK',
    'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK',
    'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU',
    'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR',
    'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR',
    'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC',
    'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX',
    'USD', 'UYU', 'UZS', 'VED', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XCG', 'XOF', 'XPF',
    'YER', 'ZAR', 'ZMW', 'ZWG', 'ZWL',
] as const; // prettier-ignore
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/**
 * The currencies whose minor unit isn't a hundredth, by their exponent in ISO 4217. The CLDR, which
 * `Intl.NumberFormat` follows, differs for a few cash currencies: amounts follow ISO 4217.
 */
const CURRENCY_EXPONENTS: Readonly<Record<string, number>> = {
    BIF: 0,
    CLP: 0,
    DJF: 0,
    GNF: 0,
    ISK: 0,
    JPY: 0,
    KMF: 0,
    KRW: 0,
    PYG: 0,
    RWF: 0,
    UGX: 0,
    UYI: 0,
    VND: 0,
    VUV: 0,
    XAF: 0,
    XOF: 0,
    XPF: 0,
    BHD: 3,
    IQD: 3,
    JOD: 3,
    KWD: 3,
    LYD: 3,
    OMR: 3,
    TND: 3,
    CLF: 4,
    UYW: 4,
};

/** Whether a string is the ISO 4217 code of a currency that Panneau knows (`CAD`). */
export function isCurrencyCode(code: unknown): code is CurrencyCode {
    return typeof code === 'string' && (CURRENCY_CODES as readonly string[]).includes(code);
}

/**
 * The number of digits of the minor unit of a currency, its ISO 4217 exponent: 2 for `CAD` (cents),
 * 0 for `JPY`, 3 for `KWD`. A `money` amount is an integer in that unit.
 */
export function getCurrencyDigits(code: string): number {
    return CURRENCY_EXPONENTS[code] ?? 2;
}

/**
 * Turns an amount in major units, as typed (`12.5`), into minor units (`1250`), rounded half away
 * from zero, without the errors of floating point (`1.005` gives `101`).
 */
export function toMinorUnits(amount: number, currency: string): number {
    const digits = getCurrencyDigits(currency);
    const [mantissa = '0', exponent = '0'] = String(Math.abs(amount)).split('e');
    const shifted = Number(`${mantissa}e${String(Number(exponent) + digits)}`);
    return Math.sign(amount) * Math.round(shifted) || 0;
}

/** Turns an amount in minor units (`1250`) into major units (`12.5`). */
export function fromMinorUnits(amount: number, currency: string): number {
    const digits = getCurrencyDigits(currency);
    return Number(`${String(amount)}e-${String(digits)}`);
}
