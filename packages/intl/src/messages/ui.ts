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
};
