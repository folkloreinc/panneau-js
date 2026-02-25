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
            const val = value && field.name && value[field.name] ? value[field.name] : false;
            return !(field.required && !val);
        }
        return acc;
    }, true);
}

export default validateFields;
