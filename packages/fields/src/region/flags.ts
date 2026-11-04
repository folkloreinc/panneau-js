import { useEffect, useSyncExternalStore } from 'react';

/** The flags of the regions of a country, as data URLs of images, by region code. */
export type RegionFlags = Readonly<Record<string, string>>;

/**
 * The modules of the flags, by country (decision 0059). Each loads the first time a region of its
 * country shows, so that a form without a region doesn't load them.
 */
const LOADERS: Readonly<Record<string, () => Promise<{ default: RegionFlags }>>> = {
    CA: () => import('./flags/CA'),
    US: () => import('./flags/US'),
};

/** The countries whose regions have flags. */
export const REGION_FLAG_COUNTRIES: readonly string[] = Object.keys(LOADERS);

const loaded = new Map<string, RegionFlags>();
const loading = new Map<string, Promise<RegionFlags | null>>();
const listeners = new Set<() => void>();

/**
 * Loads the flags of the regions of a country, once. `null` for a country without flags, or when
 * they fail to load (they load again next time).
 */
export function loadRegionFlags(country: string): Promise<RegionFlags | null> {
    const loader = Object.hasOwn(LOADERS, country) ? LOADERS[country] : undefined;
    if (loader === undefined) {
        return Promise.resolve(null);
    }
    let promise = loading.get(country);
    if (promise === undefined) {
        promise = loader().then(
            (module) => {
                loaded.set(country, module.default);
                for (const listener of listeners) {
                    listener();
                }
                return module.default;
            },
            () => {
                loading.delete(country);
                return null;
            },
        );
        loading.set(country, promise);
    }
    return promise;
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * The flags of the regions of a country: `null` until they load, and for a country without flags.
 * They start loading when a component first asks for them.
 */
export function useRegionFlags(country: string | null | undefined): RegionFlags | null {
    const flags = useSyncExternalStore(
        subscribe,
        () => (country !== null && country !== undefined ? (loaded.get(country) ?? null) : null),
        () => null,
    );
    useEffect(() => {
        if (country !== null && country !== undefined && !loaded.has(country)) {
            void loadRegionFlags(country);
        }
    }, [country]);
    return flags;
}

/** The flag of a region among the flags of its country, or `undefined`. */
export function getRegionFlag(flags: RegionFlags | null, code: string): string | undefined {
    return flags !== null && Object.hasOwn(flags, code) ? flags[code] : undefined;
}
