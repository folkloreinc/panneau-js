import { afterEach, describe, expect, it, vi } from 'vitest';

import { createNominatimSource, toAddressParts } from './nominatim';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('toAddressParts', () => {
    it('turns the details of a place into the parts of an address', () => {
        expect(
            toAddressParts({
                house_number: '1234',
                road: 'Rue Saint-Denis',
                city: 'Montréal',
                state: 'Québec',
                'ISO3166-2-lvl4': 'CA-QC',
                postcode: 'h2x 3j8',
                country_code: 'ca',
            }),
        ).toEqual({
            street: '1234 Rue Saint-Denis',
            city: 'Montréal',
            region: 'QC',
            postalCode: 'H2X 3J8',
            country: 'CA',
        });
    });

    it('keeps the name of a region of a country whose regions Panneau does not know', () => {
        expect(
            toAddressParts({
                road: 'Rue de Rivoli',
                town: 'Paris',
                state: 'Île-de-France',
                'ISO3166-2-lvl4': 'FR-IDF',
                country_code: 'fr',
            }),
        ).toEqual({
            street: 'Rue de Rivoli',
            city: 'Paris',
            region: 'Île-de-France',
            country: 'FR',
        });
        expect(toAddressParts({})).toBeUndefined();
        expect(toAddressParts(null)).toBeUndefined();
    });
});

describe('createNominatimSource', () => {
    it('asks for the details of the addresses it finds', async () => {
        const fetch = vi.fn(() =>
            Promise.resolve(
                new Response(
                    JSON.stringify([
                        {
                            display_name: 'Laval, Québec, Canada',
                            lat: '45.6',
                            lon: '-73.7',
                            address: { city: 'Laval', country_code: 'ca' },
                        },
                    ]),
                ),
            ),
        );
        vi.stubGlobal('fetch', fetch);
        const results = await createNominatimSource().search('Laval', {
            signal: new AbortController().signal,
        });
        expect(String((fetch.mock.calls[0] as unknown[])[0])).toContain('addressdetails=1');
        expect(results).toEqual([
            {
                label: 'Laval, Québec, Canada',
                lat: 45.6,
                lng: -73.7,
                address: { city: 'Laval', country: 'CA' },
            },
        ]);
    });
});
