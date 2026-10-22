import { useState } from 'react';

const PREFIX = 'panneau:';

function read<T extends string>(key: string, allowed: readonly T[]): T | null {
    try {
        const value = window.localStorage.getItem(`${PREFIX}${key}`);
        return allowed.find((candidate) => candidate === value) ?? null;
    } catch {
        // Storage can be blocked (private windows, site data settings).
        return null;
    }
}

function write(key: string, value: string) {
    try {
        window.localStorage.setItem(`${PREFIX}${key}`, value);
    } catch {
        // The preference then lasts until the page is reloaded.
    }
}

/**
 * A choice of the user that the browser remembers (`localStorage`), such as a collapsed sidebar.
 * `null` until the user makes it, and when the stored value isn't allowed or can't be read.
 */
export function usePreference<T extends string>(
    key: string,
    allowed: readonly T[],
): [T | null, (value: T) => void] {
    const [value, setValue] = useState<T | null>(() => read(key, allowed));
    return [
        value,
        (next: T) => {
            setValue(next);
            write(key, next);
        },
    ];
}
