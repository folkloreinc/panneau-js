import { useEffect, useState } from 'react';

import type { GeocodingResult, GeocodingSource } from './types';

const SEARCH_DELAY = 400;
/** The shortest text that the address search looks for. */
export const SEARCH_MIN_LENGTH = 3;

/** The search of addresses: results of the text typed, after a pause. */
export function useAddressSearch(
    geocoding: GeocodingSource | null,
    query: string,
    locale: string,
): { query: string; results: GeocodingResult[]; loading: boolean } {
    const [state, setState] = useState<{
        query: string;
        results: GeocodingResult[];
        loading: boolean;
    }>({ query: '', results: [], loading: false });
    useEffect(() => {
        const text = query.trim();
        if (geocoding === null || text.length < SEARCH_MIN_LENGTH) {
            return undefined;
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setState((current) => ({ ...current, loading: true }));
            geocoding
                .search(text, { signal: controller.signal, locale })
                .then((results) => setState({ query: text, results, loading: false }))
                .catch(() => {
                    if (!controller.signal.aborted) {
                        setState({ query: text, results: [], loading: false });
                    }
                });
        }, SEARCH_DELAY);
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [geocoding, query, locale]);
    return query.trim().length >= SEARCH_MIN_LENGTH ? state : { ...state, results: [] };
}
