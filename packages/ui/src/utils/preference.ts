import { useState } from 'react';

const PREFIX = 'panneau:';

/** The stored value of a preference, or `null` (see `usePreference()`). */
export function readPreference<T extends string>(key: string, allowed: readonly T[]): T | null {
    try {
        const value = window.localStorage.getItem(`${PREFIX}${key}`);
        return allowed.find((candidate) => candidate === value) ?? null;
    } catch {
        // Storage can be blocked (private windows, site data settings).
        return null;
    }
}

/** Stores a preference (see `usePreference()`). */
export function writePreference(key: string, value: string): void {
    try {
        window.localStorage.setItem(`${PREFIX}${key}`, value);
    } catch {
        // The preference then lasts until the page is reloaded.
    }
}

/**
 * A choice of the user that the browser remembers (`localStorage`, under `panneau:<key>`), such as
 * a collapsed sidebar or a widened aside. `null` until the user makes it, and when the stored value
 * isn't allowed or can't be read. Without a key, the choice lasts as long as the component.
 */
export function usePreference<T extends string>(
    key: string | null,
    allowed: readonly T[],
): [T | null, (value: T) => void] {
    const [value, setValue] = useState<T | null>(() =>
        key !== null ? readPreference(key, allowed) : null,
    );
    return [
        value,
        (next: T) => {
            setValue(next);
            if (key !== null) {
                writePreference(key, next);
            }
        },
    ];
}
