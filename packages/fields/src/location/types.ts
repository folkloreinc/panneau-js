/** A place an address search found: what it shows, and its point. */
export interface GeocodingResult {
    label: string;
    lat: number;
    lng: number;
}

/**
 * Where `location` fields search addresses (decision 0033). Projects bring their own: a service
 * with a key, their backend, or `createNominatimSource()` for small volumes.
 */
export interface GeocodingSource {
    /** The places that match an address or a name, best first. */
    search(
        query: string,
        options: { signal: AbortSignal; locale?: string },
    ): Promise<GeocodingResult[]>;
    /** The address of a point, to fill it in when the point is placed on the map. Optional. */
    reverse?(
        point: { lat: number; lng: number },
        options: { signal: AbortSignal; locale?: string },
    ): Promise<GeocodingResult | null>;
}

/** Raster tiles of the maps of `location` fields. */
export interface MapTiles {
    /** URL template of the tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. */
    url: string;
    /** The credit the tiles ask for, as HTML. */
    attribution: string;
    /** Highest zoom of the tiles. Defaults to 19. */
    maxZoom?: number;
}

/** The tiles and the address search of the maps of `location` fields. */
export interface MapsConfig {
    tiles?: MapTiles;
    geocoding?: GeocodingSource;
}
