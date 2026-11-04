import { describe, expect, it } from 'vitest';

import {
    CURRENCY_CODES,
    fromMinorUnits,
    getCurrencyDigits,
    isCurrencyCode,
    toMinorUnits,
} from './currencies';

describe('currencies', () => {
    it('knows the ISO 4217 codes and their exponents', () => {
        expect(isCurrencyCode('CAD')).toBe(true);
        expect(isCurrencyCode('cad')).toBe(false);
        expect(isCurrencyCode('XAU')).toBe(false);
        expect(new Set(CURRENCY_CODES).size).toBe(CURRENCY_CODES.length);
        expect(getCurrencyDigits('CAD')).toBe(2);
        expect(getCurrencyDigits('JPY')).toBe(0);
        expect(getCurrencyDigits('KWD')).toBe(3);
        expect(getCurrencyDigits('CLF')).toBe(4);
    });

    it('turns major units into minor units without floating point errors', () => {
        expect(toMinorUnits(12.5, 'CAD')).toBe(1250);
        expect(toMinorUnits(1.005, 'CAD')).toBe(101);
        expect(toMinorUnits(0.29, 'CAD')).toBe(29);
        expect(toMinorUnits(-1.005, 'EUR')).toBe(-101);
        expect(toMinorUnits(1250, 'JPY')).toBe(1250);
        expect(toMinorUnits(1.2345, 'KWD')).toBe(1235);
        expect(toMinorUnits(0, 'CAD')).toBe(0);
        expect(Object.is(toMinorUnits(-0.001, 'CAD'), 0)).toBe(true);
        expect(fromMinorUnits(1250, 'CAD')).toBe(12.5);
        expect(fromMinorUnits(1250, 'JPY')).toBe(1250);
        expect(fromMinorUnits(-29, 'CAD')).toBe(-0.29);
    });
});
