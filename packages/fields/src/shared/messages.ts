import { defineMessage } from 'react-intl';

/** UI messages of `@panneau/fields`, with their English text. French is in `../locales/fr.ts`. */
export const messages = {
    add: defineMessage({ id: 'panneau.fields.add', defaultMessage: 'Add' }),
    addType: defineMessage<{ type: string }>({
        id: 'panneau.fields.addType',
        defaultMessage: 'Add: {type}',
    }),
    remove: defineMessage({ id: 'panneau.fields.remove', defaultMessage: 'Remove' }),
    removeItem: defineMessage<{ index: number }>({
        id: 'panneau.fields.removeItem',
        defaultMessage: 'Remove item {index}',
    }),
    moveUp: defineMessage<{ index: number }>({
        id: 'panneau.fields.moveUp',
        defaultMessage: 'Move item {index} up',
    }),
    moveDown: defineMessage<{ index: number }>({
        id: 'panneau.fields.moveDown',
        defaultMessage: 'Move item {index} down',
    }),
    item: defineMessage<{ index: number }>({
        id: 'panneau.fields.item',
        defaultMessage: 'Item {index}',
    }),
    noItems: defineMessage({ id: 'panneau.fields.noItems', defaultMessage: 'No items yet.' }),
    characterCount: defineMessage<{ count: number; max: number }>({
        id: 'panneau.fields.characterCount',
        defaultMessage: '{count, number} / {max, number} characters',
    }),
    openLink: defineMessage({ id: 'panneau.fields.openLink', defaultMessage: 'Open the link' }),
    pickColor: defineMessage({ id: 'panneau.fields.pickColor', defaultMessage: 'Pick a color' }),
    generateSlug: defineMessage<{ field: string }>({
        id: 'panneau.fields.generateSlug',
        defaultMessage: 'Generate from {field}',
    }),
    search: defineMessage({ id: 'panneau.fields.search', defaultMessage: 'Search…' }),
    noRelation: defineMessage({ id: 'panneau.fields.noRelation', defaultMessage: 'None' }),
    noResults: defineMessage({ id: 'panneau.fields.noResults', defaultMessage: 'No results' }),
    relationUnavailable: defineMessage({
        id: 'panneau.fields.relationUnavailable',
        defaultMessage: 'Items can’t be searched here.',
    }),
    missingPlugin: defineMessage<{ type: string }>({
        id: 'panneau.fields.missingPlugin',
        defaultMessage: 'This field needs a plugin for the “{type}” type.',
    }),
};
