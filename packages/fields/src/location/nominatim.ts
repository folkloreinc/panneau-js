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
}

function toResult(place: NominatimPlace): GeocodingResult | null {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    if (typeof place.display_name !== 'string' || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
    }
    return { label: place.display_name, lat, lng };
}

/**
 * An address search on Nominatim, OpenStreetMap's geocoder. Fine for an admin panel: its public
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
        const query = new URLSearchParams({ format: 'jsonv2', ...params });
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
