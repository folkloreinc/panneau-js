import { type MessageCatalog, panneauMessages } from './catalogs';

/**
 * The messages of every Panneau package for a locale. A regional locale (`fr-CA`) gets the
 * messages of its language. A locale Panneau doesn't translate gets none: components then use
 * their English defaults.
 */
export function getPanneauMessages(locale: string): MessageCatalog {
    const language = locale.split('-')[0] ?? locale;
    return panneauMessages[locale] ?? panneauMessages[language] ?? {};
}

/**
 * The messages of every Panneau package for a locale, overridden by the app's own, for an
 * `IntlProvider`: `<IntlProvider locale="fr" messages={withPanneauMessages('fr', appMessages)}>`.
 */
export function withPanneauMessages(locale: string, messages: MessageCatalog = {}): MessageCatalog {
    return { ...getPanneauMessages(locale), ...messages };
}
