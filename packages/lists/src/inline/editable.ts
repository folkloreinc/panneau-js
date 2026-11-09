import type { Field } from '@panneau/protocol';
import { evaluateCondition } from '@panneau/protocol/runtime';

import type { ListColumn, ListItem } from '../types';

/** The types a column edits in place (decision 0043). */
export const INLINE_TYPES: ReadonlySet<string> = new Set([
    'text',
    'number',
    'select',
    'boolean',
    'date',
]);

/** Whether a field can be edited in place: a simple type, one value, not read-only, in forms. */
export function isInlineField(field: Field | null | undefined): field is Field {
    return (
        field !== null &&
        field !== undefined &&
        INLINE_TYPES.has(field.type) &&
        field.localized !== true &&
        field.multiple !== true &&
        field.readOnly !== true &&
        field.notInForm !== true &&
        field.createOnly !== true
    );
}

/**
 * The field a column edits in place on an item, or `null`: a field of `inlineEdit`, of a simple
 * type, shown for the item (`visibleWhen`), on an item that can be updated.
 */
export function getInlineField(
    column: ListColumn,
    item: ListItem,
    inlineEdit: readonly string[],
): Field | null {
    const field = column.field;
    if (!isInlineField(field) || !inlineEdit.includes(field.name)) {
        return null;
    }
    if (item.abilities?.update !== true) {
        return null;
    }
    if (field.visibleWhen !== undefined && !evaluateCondition(field.visibleWhen, item)) {
        return null;
    }
    return field;
}
