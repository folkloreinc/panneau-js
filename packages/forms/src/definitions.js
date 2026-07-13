import isArray from 'lodash-es/isArray';

import { definition as authDefinitions } from '@panneau/form-auth';

export default [authDefinitions].reduce(
    (allDefinition, definition) => [
        ...allDefinition,
        ...(isArray(definition) ? definition : [definition]),
    ],
    [],
);
