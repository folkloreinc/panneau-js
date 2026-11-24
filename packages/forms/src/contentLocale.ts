import type { Field } from '@panneau/protocol';

/** Whether some field is localized, in groups, repeaters and blocks included. */
export function hasLocalizedFields(fields: readonly Field[]): boolean {
    return fields.some(
        (field) =>
            field.localized === true ||
            hasLocalizedFields(field.fields ?? []) ||
            (field.types ?? []).some((type) => hasLocalizedFields(type.fields)),
    );
}
