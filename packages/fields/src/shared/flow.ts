import type { Field } from '@panneau/protocol';

import { getSetting, isString } from './entry';

/** Types whose input is short: they share a row with others in a flow of fields. */
const COMPACT_TYPES = new Set([
    'text',
    'email',
    'url',
    'tel',
    'number',
    'date',
    'datetime',
    'time',
    'duration',
    'color',
    'select',
    'boolean',
    'range',
    'slug',
    'relation',
]);

/**
 * Whether a field takes a whole row where fields flow in columns, such as in a form without a
 * layout or in a group: long inputs (a text area, rich text, blocks), several values, a value per
 * locale, and the types of plugins. Short inputs share a row.
 */
export function isWideField(field: Field): boolean {
    if (field.localized === true || field.multiple === true) {
        return true;
    }
    const widget = getSetting(field, 'widget', isString);
    if (field.type === 'select' && widget !== undefined && widget !== 'dropdown') {
        return true;
    }
    return !COMPACT_TYPES.has(field.type);
}
