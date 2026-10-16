import type { Item, Problem } from '@panneau/protocol';
import { isProblem } from '@panneau/protocol/runtime';

import type { Values } from '../values';

/**
 * The problem details carried by an error: the error itself when it is a problem, or its
 * `problem` property, as on the errors of `@panneau/data`. A custom adapter only needs to throw
 * errors with a `problem` for forms to show validation errors and conflicts.
 */
export function getProblem(error: unknown): Problem | null {
    if (isProblem(error)) {
        return error;
    }
    if (error !== null && typeof error === 'object' && 'problem' in error) {
        return isProblem(error.problem) ? error.problem : null;
    }
    return null;
}

const ITEM_KEYS = new Set(['id', 'version', 'abilities']);

/** Whether a value looks like an item of the protocol (`id`, `version`, `abilities`). */
export function isItem(value: unknown): value is Item {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const item = value as Record<string, unknown>;
    return (
        typeof item.id === 'string' &&
        (typeof item.version === 'string' || item.version === null) &&
        item.abilities !== null &&
        typeof item.abilities === 'object'
    );
}

/**
 * The values of an item: every property except `id`, `version` and `abilities`, or only the
 * given field names.
 */
export function getItemValues(item: Item, names?: readonly string[]): Values {
    return Object.fromEntries(
        Object.entries(item).filter(([key]) =>
            names !== undefined ? names.includes(key) : !ITEM_KEYS.has(key),
        ),
    );
}
