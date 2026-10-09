import type { Field } from '../types';

interface FieldWithValidation extends Field {
    type?: string;
    fields?: FieldWithValidation[];
    required?: boolean;
}

export function validateFields(
    fields: FieldWithValidation[],
    value: Record<string, unknown> | null,
): boolean {
    return fields.reduce((acc: boolean, field: FieldWithValidation) => {
        if (acc === true) {
            if (field.type === 'fields' && field.fields) {
                return validateFields(field.fields, value);
            }
            const val = value && field.name ? value[field.name] : null;
            // Only null, undefined and empty strings are considered missing (0 and false are valid)
            const isMissing = val === null || typeof val === 'undefined' || val === '';
            return !(field.required && isMissing);
        }
        return acc;
    }, true);
}

export default validateFields;
