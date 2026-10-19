import type { ComponentType } from 'react';

import type { DefinitionTheme, Theme } from '@panneau/protocol';
import { mergeThemes } from '@panneau/protocol/runtime';

/** A theme of `@panneau/ui`, as plain data: what plugins register (decision 0024). */
export type { Theme };

/**
 * A component provided by a plugin. Its props are defined by the package that renders it (fields,
 * lists, app), so the registry stores it as given.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export type PluginComponent = ComponentType<any>;

/** UI messages of a locale, keyed by message id. */
export type Messages = Record<string, string>;

/** Messages, or a function that loads them (`() => import('./lang/fr.json')`). */
export type MessagesLoader = Messages | (() => Promise<Messages | { default: Messages }>);

/** What a plugin adds to Panneau. Every part is keyed by the name the definition uses. */
export interface PanneauPlugin {
    /** Unique id of the plugin. */
    id: string;
    /** Field components, by field type (`text`, `page-slug`). */
    fields?: Record<string, PluginComponent>;
    /** Components that display a value in lists, by display (`date`, `page-slug`). */
    displays?: Record<string, PluginComponent>;
    /** List layouts, by id (`table`, `cards`). */
    listLayouts?: Record<string, PluginComponent>;
    /** Handlers of `client` actions, by the action's `component`. */
    actions?: Record<string, PluginComponent>;
    /** Pages, by component name (`dashboard`). */
    pages?: Record<string, PluginComponent>;
    /** Dashboard widgets, by widget type (`stat`). */
    widgets?: Record<string, PluginComponent>;
    /** Layout node components, for `component` nodes of form layouts. */
    components?: Record<string, PluginComponent>;
    /** UI messages, by locale. Messages of later plugins override earlier ones. */
    locales?: Record<string, MessagesLoader>;
    /** Themes, by id, that the theme of the definition can extend. */
    themes?: Record<string, Theme>;
}

/** The kinds of components a plugin can provide. */
export type PluginComponentKind =
    'fields' | 'displays' | 'listLayouts' | 'actions' | 'pages' | 'widgets' | 'components';

const COMPONENT_KINDS: PluginComponentKind[] = [
    'fields',
    'displays',
    'listLayouts',
    'actions',
    'pages',
    'widgets',
    'components',
];

/** Everything the plugins provide, merged. A later plugin overrides an earlier one. */
export interface PluginRegistry {
    /** The plugins, in order. */
    plugins: readonly PanneauPlugin[];
    fields: ReadonlyMap<string, PluginComponent>;
    displays: ReadonlyMap<string, PluginComponent>;
    listLayouts: ReadonlyMap<string, PluginComponent>;
    actions: ReadonlyMap<string, PluginComponent>;
    pages: ReadonlyMap<string, PluginComponent>;
    widgets: ReadonlyMap<string, PluginComponent>;
    components: ReadonlyMap<string, PluginComponent>;
    /** Message loaders of each locale, in plugin order. */
    locales: ReadonlyMap<string, readonly MessagesLoader[]>;
    themes: ReadonlyMap<string, Theme>;
}

/** Declares a plugin. It returns the plugin as is, with its type checked. */
export function definePlugin(plugin: PanneauPlugin): PanneauPlugin {
    return plugin;
}

/**
 * Merges plugins into a registry. Later plugins override the components and themes of earlier
 * ones, so a project can replace a built-in field. Plugin ids must be unique.
 */
export function createPluginRegistry(plugins: readonly PanneauPlugin[]): PluginRegistry {
    const ids = new Set<string>();
    plugins.forEach((plugin) => {
        if (ids.has(plugin.id)) {
            throw new Error(`Two plugins have the id \`${plugin.id}\`.`);
        }
        ids.add(plugin.id);
    });
    const components = Object.fromEntries(
        COMPONENT_KINDS.map((kind) => [
            kind,
            new Map(plugins.flatMap((plugin) => Object.entries(plugin[kind] ?? {}))),
        ]),
    ) as Record<PluginComponentKind, Map<string, PluginComponent>>;
    const locales = new Map<string, MessagesLoader[]>();
    plugins.forEach((plugin) =>
        Object.entries(plugin.locales ?? {}).forEach(([locale, loader]) => {
            locales.set(locale, [...(locales.get(locale) ?? []), loader]);
        }),
    );
    return {
        plugins: [...plugins],
        ...components,
        locales,
        themes: new Map(plugins.flatMap((plugin) => Object.entries(plugin.themes ?? {}))),
    };
}

/**
 * Loads the messages of a locale from every plugin that provides it, merged in plugin order. A
 * regional locale (`fr-CA`) falls back to its language (`fr`) for missing messages.
 */
export async function loadMessages(registry: PluginRegistry, locale: string): Promise<Messages> {
    const language = locale.split('-')[0] ?? locale;
    const loaders = [
        ...(language !== locale ? (registry.locales.get(language) ?? []) : []),
        ...(registry.locales.get(locale) ?? []),
    ];
    const loaded = await Promise.all(
        loaders.map(async (loader) => {
            if (typeof loader !== 'function') {
                return loader;
            }
            const result = await loader();
            return 'default' in result && typeof result.default === 'object'
                ? (result.default as Messages)
                : (result as Messages);
        }),
    );
    return Object.assign({}, ...loaded) as Messages;
}

/**
 * The theme of the admin: the themes of plugins that the definition's theme extends, in order, then
 * the definition's own tokens, tones and variants. An id no plugin registers is skipped, with a
 * warning.
 */
export function resolveTheme(
    theme: DefinitionTheme | undefined,
    themes: ReadonlyMap<string, Theme>,
): Theme {
    const { colorScheme: _colorScheme, extends: ids, ...own } = theme ?? {};
    const extended = (typeof ids === 'string' ? [ids] : (ids ?? [])).flatMap((id) => {
        const found = themes.get(id);
        if (found === undefined) {
            console.warn(`[panneau] No plugin registers the theme "${id}".`);
            return [];
        }
        return [found];
    });
    return mergeThemes(...extended, own);
}
