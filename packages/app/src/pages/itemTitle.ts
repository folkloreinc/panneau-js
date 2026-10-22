import type { Item } from '@panneau/protocol';

/**
 * The title of an item: the value of the resource's `itemTitle` field, in the locale when it is
 * localized. `null` without one.
 */
export function getItemTitle(
    item: Item | undefined,
    itemTitle: string | undefined,
    locale: string,
): string | null {
    const value = itemTitle !== undefined ? item?.[itemTitle] : undefined;
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object') {
        const localized = (value as Record<string, unknown>)[locale];
        const first = localized ?? Object.values(value)[0];
        return typeof first === 'string' ? first : null;
    }
    return null;
}
