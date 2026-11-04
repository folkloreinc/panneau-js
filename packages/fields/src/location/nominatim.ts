import { normalizePostalCode } from '@panneau/protocol/runtime';

import { REGION_COUNTRIES } from '../region/regions';
import type { GeocodingResult, GeocodingSource } from './types';

export interface NominatimSourceOptions {
    /** The Nominatim server. Defaults to OpenStreetMap's, whose policy allows one request a second. */
    endpoint?: string;
    /** An email, which OpenStreetMap's server asks of apps that send many requests. */
    email?: string;
    /** Limits the search to these countries (`['ca']`). */
    countryCodes?: readonly string[];
    /** Most results of a search. Defaults to 5. */
    limit?: number;
}

interface NominatimPlace {
    display_name?: unknown;
    lat?: unknown;
    lon?: unknown;
    address?: unknown;
}

const text = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

/**
 * The parts of the address of a place, from Nominatim's `addressdetails`: the region as its code
 * for the countries whose regions Panneau knows (`QC`, from `CA-QC`), the postal code normalized.
 */
export function toAddressParts(details: unknown): GeocodingResult['address'] | undefined {
    if (details === null || typeof details !== 'object') {
        return undefined;
    }
    const parts = details as Record<string, unknown>;
    const country = text(parts.country_code)?.toUpperCase();
    const street = [text(parts.house_number), text(parts.road) ?? text(parts.pedestrian)]
        .filter((part) => part !== undefined)
        .join(' ');
    const city =
        text(parts.city) ??
        text(parts.town) ??
        text(parts.village) ??
        text(parts.municipality) ??
        text(parts.hamlet);
    const iso = text(parts['ISO3166-2-lvl4']);
    const region =
        country !== undefined &&
        REGION_COUNTRIES.includes(country) &&
        iso?.startsWith(`${country}-`) === true
            ? iso.slice(country.length + 1)
            : text(parts.state);
    const postalCode = text(parts.postcode);
    const address = {
        ...(street !== '' ? { street } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(region !== undefined ? { region } : {}),
        ...(postalCode !== undefined
            ? { postalCode: normalizePostalCode(postalCode, country) }
            : {}),
        ...(country !== undefined ? { country } : {}),
    };
    return Object.keys(address).length > 0 ? address : undefined;
}

function toResult(place: NominatimPlace): GeocodingResult | null {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    if (typeof place.display_name !== 'string' || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
    }
    const address = toAddressParts(place.address);
    return { label: place.display_name, lat, lng, ...(address !== undefined ? { address } : {}) };
}

/**
 * An address search on Nominatim, OpenStreetMap's geocoder, with the parts of the addresses it
 * finds. Fine for an admin panel: its public
 * server allows one request a second and no heavy use. For more, run a server or use a service.
 */
export function createNominatimSource({
    endpoint = 'https://nominatim.openstreetmap.org',
    email,
    countryCodes,
    limit = 5,
}: NominatimSourceOptions = {}): GeocodingSource {
    const base = endpoint.replace(/\/$/, '');
    const request = async (
        path: string,
        params: Record<string, string>,
        { signal, locale }: { signal: AbortSignal; locale?: string },
    ): Promise<unknown> => {
        // The parts of addresses, for `address` fields
        const query = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', ...params });
        if (email !== undefined) {
            query.set('email', email);
        }
        if (locale !== undefined) {
            query.set('accept-language', locale);
        }
        const response = await fetch(`${base}${path}?${query}`, { signal });
        if (!response.ok) {
            throw new Error(`Nominatim answered ${response.status}.`);
        }
        return response.json();
    };
    return {
        async search(text, options) {
            const places = await request(
                '/search',
                {
                    q: text,
                    limit: String(limit),
                    ...(countryCodes !== undefined && countryCodes.length > 0
                        ? { countrycodes: countryCodes.join(',') }
                        : {}),
                },
                options,
            );
            return Array.isArray(places)
                ? places.flatMap((place: NominatimPlace) => toResult(place) ?? [])
                : [];
        },
        async reverse({ lat, lng }, options) {
            const place = await request(
                '/reverse',
                { lat: String(lat), lon: String(lng) },
                options,
            );
            return place !== null && typeof place === 'object'
                ? toResult(place as NominatimPlace)
                : null;
        },
    };
}
