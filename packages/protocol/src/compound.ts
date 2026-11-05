// Fields made of other fields: `group`, `repeater`, and the compound fields of plugins
// (decision 0065). This module doesn't import zod.
import { BUILT_IN_FIELD_TYPES } from './constants';
import type { Field } from './schemas/field';

/**
 * The shape of a value made of nested fields: an object of its `fields` (`group`), or a list of
 * them (`repeater`).
 */
export type NestedShape = 'group' | 'repeater';

/** Whether a field type is built in. */
export function isBuiltInFieldType(type: string): boolean {
    return (BUILT_IN_FIELD_TYPES as readonly string[]).includes(type);
}

/**
 * Whether a field is a compound field (decision 0065): a type that isn't built in, provided by a
 * plugin, that carries its sub-fields in `fields`.
 */
export function isCompoundField(field: Pick<Field, 'type' | 'fields'>): boolean {
    return field.fields !== undefined && !isBuiltInFieldType(field.type);
}

/**
 * The shape of a field's value when it is made of nested fields: `group` and `repeater` fields,
 * and compound fields, an object of their `fields`, or a list of them with `multiple`
 * (decision 0065). Other fields return `null`.
 */
export function getNestedShape(
    field: Pick<Field, 'type' | 'fields' | 'multiple'>,
): NestedShape | null {
    if (field.type === 'group' || field.type === 'repeater') {
        return field.type;
    }
    if (isCompoundField(field)) {
        return field.multiple === true ? 'repeater' : 'group';
    }
    return null;
}
