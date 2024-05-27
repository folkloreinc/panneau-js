import { pascalCase } from 'change-case';
import isArray from 'lodash/isArray';

const getDefinitionFromId = (id = null, items = [], defaultObject = null) => {
    if (items === null || id === null || (isArray(items) && items.length === 0)) {
        return defaultObject;
    }
    const pascalId = pascalCase(id);
    return items.find((i) => i.id === pascalId) || items.find((i) => i.id === id) || defaultObject;
};

export default getDefinitionFromId;
