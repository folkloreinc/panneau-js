import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { type Messages, type PluginRegistry, loadMessages } from '@panneau/core';
import { getLoadedPanneauMessages, loadPanneauMessages } from '@panneau/intl';

const NONE: Messages = {};

/**
 * The messages of Panneau's packages and of the plugins (`locales`) for a locale, merged in that
 * order, or `undefined` while they load: Panneau's load on first use (#346), so that the app only
 * loads the languages it shows. A locale that neither translates has none, without waiting.
 * Messages that fail to load are left out, with an error in the console: components then show
 * their default messages.
 */
export function usePluginMessages(registry: PluginRegistry, locale: string): Messages | undefined {
    const language = locale.split('-')[0] ?? locale;
    // Panneau's messages: `undefined` while they have to load, none in English
    const panneau = getLoadedPanneauMessages(locale);
    const translated =
        registry.locales.has(locale) ||
        registry.locales.has(language) ||
        panneau === undefined ||
        Object.keys(panneau).length > 0;
    const query = useQuery({
        // The plugins are part of the key: two apps can share a query client.
        queryKey: [
            'panneau',
            'messages',
            locale,
            registry.plugins.map((plugin) => plugin.id),
        ] as const,
        queryFn: async () => {
            const [panneau, plugins] = await Promise.all([
                loadPanneauMessages(locale).catch((error: unknown) => {
                    console.error(`[panneau] The messages in "${locale}" failed to load.`, error);
                    return NONE;
                }),
                loadMessages(registry, locale).catch((error: unknown) => {
                    console.error(
                        `[panneau] The messages of the plugins in "${locale}" failed to load.`,
                        error,
                    );
                    return NONE;
                }),
            ]);
            return { ...panneau, ...plugins };
        },
        enabled: translated,
        staleTime: Infinity,
        // A new locale keeps the messages shown until its own load.
        placeholderData: keepPreviousData,
    });
    return translated ? query.data : NONE;
}
