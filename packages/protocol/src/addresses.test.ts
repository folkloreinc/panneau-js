import { describe, expect, it } from 'vitest';

import { getAddressRequiredParts, isPostalCode, normalizePostalCode } from './addresses';

describe('normalizePostalCode', () => {
    it('writes Canadian postal codes in capitals, with a space', () => {
        expect(normalizePostalCode('h2x1y4', 'CA')).toBe('H2X 1Y4');
        expect(normalizePostalCode(' H2X-1Y4 ', 'ca')).toBe('H2X 1Y4');
        expect(normalizePostalCode('h2x 1y', 'CA')).toBe('H2X 1Y');
    });

    it('writes ZIP+4 codes with a hyphen', () => {
        expect(normalizePostalCode('12345', 'US')).toBe('12345');
        expect(normalizePostalCode('123456789', 'US')).toBe('12345-6789');
        expect(normalizePostalCode('12345 6789', 'US')).toBe('12345-6789');
    });

    it('writes the postal codes of other countries in capitals, spaces collapsed', () => {
        expect(normalizePostalCode(' sw1a   1aa ', 'GB')).toBe('SW1A 1AA');
        expect(normalizePostalCode('75001')).toBe('75001');
    });
});

describe('isPostalCode', () => {
    it('checks Canada and the United States only', () => {
        expect(isPostalCode('h2x1y4', 'CA')).toBe(true);
        expect(isPostalCode('12345', 'CA')).toBe(false);
        expect(isPostalCode('12345-6789', 'US')).toBe(true);
        expect(isPostalCode('H2X 1Y4', 'US')).toBe(false);
        expect(isPostalCode('whatever', 'FR')).toBe(true);
        expect(isPostalCode('whatever', null)).toBe(true);
    });
});

describe('getAddressRequiredParts', () => {
    it('defaults to the street, the city and the country', () => {
        expect(getAddressRequiredParts({})).toEqual(['street', 'city', 'country']);
        expect(getAddressRequiredParts({ settings: { required: ['city', 'nope'] } })).toEqual([
            'city',
        ]);
    });
});
