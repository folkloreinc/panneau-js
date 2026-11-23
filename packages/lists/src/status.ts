import type { Field } from '@panneau/protocol';

import type { ListItem, ListItemStatus } from './types';
import { toText } from './values';

/**
 * The state of an item, from the value of its `itemStatus` field (decision 0103): the label and the
 * tone of its option for a `select` (its first value when it has several), as the badges of the
 * list show it, or the value as text.
 */
export function getItemStatus(
    item: ListItem,
    name: string,
    field: Field | null | undefined,
    locale: string,
): ListItemStatus | null {
    const raw: unknown = item[name];
    const value: unknown = Array.isArray(raw) ? raw[0] : raw;
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const option = field?.options?.find((candidate) => String(candidate.value) === String(value));
    if (option !== undefined) {
        return { label: option.label, ...(option.tone !== undefined ? { tone: option.tone } : {}) };
    }
    const label = toText(value, locale);
    return label !== '' ? { label } : null;
}
