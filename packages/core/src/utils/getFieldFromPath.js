import isArray from 'lodash/isArray';

import getFieldByName from './getFieldByName';

const getFieldFromPath = (path, fields, fieldManager) =>
    (isArray(path) ? path : [path]).reduce(
        (foundField, key) => {
            if (foundField === null) {
                return null;
            }
            const { type = null, fields: fieldFields = null, field = null } = foundField;
            const finalType = field !== null ? field.type || type : type;
            const {
                fields: subFields = null,
                settings = null,
                itemsField = null,
            } = finalType !== null ? fieldManager.getDefinition(finalType) : foundField;
            if (itemsField !== null && key.match(/^[0-9]+$/)) {
                return { ...itemsField, name: path.join('/'), listItems: true };
            }

            return getFieldByName(
                [...(fieldFields || []), ...(subFields || []), ...(settings || [])],
                key,
            );
        },
        { fields },
    );

export default getFieldFromPath;
