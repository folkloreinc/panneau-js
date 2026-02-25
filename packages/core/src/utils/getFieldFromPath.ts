import isArray from 'lodash/isArray';

import type { Field } from '../types';
import getFieldByName from './getFieldByName';

interface FieldDefinition {
    fields?: Field[] | null;
    settings?: Field[] | null;
    itemsField?: Field | null;
}

interface FieldManager {
    getDefinition: (type: string) => FieldDefinition;
}

interface FieldWithSubFields extends Field {
    type?: string | null;
    fields?: Field[] | null;
    field?: Field | null;
    listItems?: boolean;
}

interface PathContext {
    fields: Field[];
}

function getFieldFromPath(
    path: string | string[],
    fields: Field[],
    fieldManager: FieldManager,
): FieldWithSubFields | null {
    return (isArray(path) ? path : [path]).reduce<FieldWithSubFields | null>(
        (foundField, key) => {
            if (foundField === null) {
                return null;
            }
            const { type = null, fields: fieldFields = null, field = null } = foundField;
            const finalType = field !== null ? (field as Field).type || type : type;
            const {
                fields: subFields = null,
                settings = null,
                itemsField = null,
            } = finalType !== null ? fieldManager.getDefinition(finalType) : foundField;
            if (itemsField !== null && key.match(/^[0-9]+$/)) {
                return {
                    ...itemsField,
                    name: (isArray(path) ? path : [path]).join('/'),
                    listItems: true,
                };
            }

            return getFieldByName(
                [...(fieldFields || []), ...(subFields || []), ...(settings || [])],
                key,
            );
        },
        { fields } as PathContext,
    );
}

export default getFieldFromPath;
