import type { Field } from '../types';

interface FieldWithSubFields extends Field {
    fields?: FieldWithSubFields[];
}

const getFieldByName = (
    fields: FieldWithSubFields[],
    name: string | null,
): FieldWithSubFields | null =>
    fields.reduce((foundField: FieldWithSubFields | null, it: FieldWithSubFields) => {
        if (foundField !== null) {
            return foundField;
        }
        const { name: fieldName = null, fields: subFields = [] } = it;
        if (name !== null && fieldName === name) {
            return it;
        }
        return getFieldByName(subFields, name);
    }, null);

export default getFieldByName;
