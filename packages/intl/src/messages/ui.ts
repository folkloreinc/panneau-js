import { defineMessage } from '../message';

/**
 * The messages of `@panneau/ui`, with their English text, which is also the default one. French
 * is in `../fr/ui.ts`.
 */
export const uiMessages = {
    close: defineMessage({ id: 'panneau.ui.close', defaultMessage: 'Close' }),
    loading: defineMessage({ id: 'panneau.ui.loading', defaultMessage: 'Loading…' }),
    notifications: defineMessage({
        id: 'panneau.ui.notifications',
        defaultMessage: 'Notifications',
    }),
    selectPlaceholder: defineMessage({
        id: 'panneau.ui.select.placeholder',
        defaultMessage: 'Select…',
    }),
    noResults: defineMessage({ id: 'panneau.ui.noResults', defaultMessage: 'No results' }),
    showOptions: defineMessage({ id: 'panneau.ui.showOptions', defaultMessage: 'Show options' }),
    clear: defineMessage({ id: 'panneau.ui.clear', defaultMessage: 'Clear' }),
    moreActions: defineMessage({ id: 'panneau.ui.moreActions', defaultMessage: 'More actions' }),
    commandPalette: defineMessage({
        id: 'panneau.ui.commandPalette',
        defaultMessage: 'Search',
    }),
    commandResults: defineMessage<{ count: number }>({
        id: 'panneau.ui.commandResults',
        defaultMessage: '{count, plural, =0 {No results} one {# result} other {# results}}',
    }),
    commandRemoveScope: defineMessage<{ scope: string }>({
        id: 'panneau.ui.commandRemoveScope',
        defaultMessage: 'Stop searching in {scope}',
    }),
    commandHintMove: defineMessage({ id: 'panneau.ui.commandHintMove', defaultMessage: 'Move' }),
    commandHintOpen: defineMessage({ id: 'panneau.ui.commandHintOpen', defaultMessage: 'Open' }),
    commandHintClose: defineMessage({ id: 'panneau.ui.commandHintClose', defaultMessage: 'Close' }),
};
