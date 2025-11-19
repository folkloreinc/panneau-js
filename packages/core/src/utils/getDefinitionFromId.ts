import { pascalCase } from 'change-case';
import isArray from 'lodash-es/isArray';
import type { Definition } from '@panneau/core/types';

const getDefinitionFromId = <T extends Definition = Definition>(
    id: string | null = null,
    items: T[] | null = [],
    defaultObject: T | null = null,
): T | null => {
    if (items === null || id === null || (isArray(items) && items.length === 0)) {
        return defaultObject;
    }
    const pascalId = pascalCase(id);
    return items.find((i) => i.id === pascalId) || items.find((i) => i.id === id) || defaultObject;
};

export default getDefinitionFromId;
