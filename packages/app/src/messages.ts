import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { type Messages, type PluginRegistry, loadMessages } from '@panneau/core';

const NONE: Messages = {};

/**
 * The messages that plugins provide for a locale (`locales`), merged in plugin order, or
 * `undefined` while they load. A locale that no plugin translates has none, without waiting. Messages that fail to load are left out, with an
 * error in the console: components then show their default messages.
 */
export function usePluginMessages(registry: PluginRegistry, locale: string): Messages | undefined {
    const language = locale.split('-')[0] ?? locale;
    const translated = registry.locales.has(locale) || registry.locales.has(language);
    const query = useQuery({
        // The plugins are part of the key: two apps can share a query client.
        queryKey: [
            'panneau',
            'messages',
            locale,
            registry.plugins.map((plugin) => plugin.id),
        ] as const,
        queryFn: () =>
            loadMessages(registry, locale).catch((error: unknown) => {
                console.error(
                    `[panneau] The messages of the plugins in "${locale}" failed to load.`,
                    error,
                );
                return NONE;
            }),
        enabled: translated,
        staleTime: Infinity,
        // A new locale keeps the messages shown until its own load.
        placeholderData: keepPreviousData,
    });
    return translated ? query.data : NONE;
}
