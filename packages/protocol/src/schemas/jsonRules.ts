import { BUILT_IN_ITEM_ACTIONS, BUILT_IN_LINK_ACTIONS } from '../constants';

/**
 * The checks of `Action` that its `superRefine` makes in Zod, as JSON Schema keywords, so that the
 * generated files check them too: backends validate their definitions against those files.
 */
export const actionJsonRules = {
    allOf: [
        {
            // The built-in item actions need no label: the client labels them.
            if: { properties: { id: { enum: [...BUILT_IN_ITEM_ACTIONS] } }, required: ['id'] },
            else: { required: ['label'] },
        },
        {
            // The ids of the built-in links are only for links.
            if: { properties: { id: { enum: [...BUILT_IN_LINK_ACTIONS] } }, required: ['id'] },
            then: { properties: { kind: { const: 'link' } }, required: ['kind'] },
        },
        {
            if: {
                properties: {
                    kind: { const: 'link' },
                    id: { not: { enum: [...BUILT_IN_LINK_ACTIONS] } },
                },
                required: ['kind', 'id'],
            },
            then: { anyOf: [{ required: ['url'] }, { required: ['route'] }] },
        },
        {
            if: { properties: { kind: { const: 'client' } }, required: ['kind'] },
            then: { required: ['component'] },
        },
    ],
};
