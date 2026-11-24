import type { ComponentType } from 'react';

import type { DefinitionTheme, Theme } from '@panneau/protocol';
import { mergeThemes } from '@panneau/protocol/runtime';

import type { CommandSource } from './commands';
import type { PageProps } from './page';
import type { PreviewProps } from './preview';
import type { ShortcutSource } from './shortcuts';
import type { WidgetProps } from './widget';

/** A theme of `@panneau/ui`, as plain data: what plugins register (decision 0024). */
export type { Theme };

/**
 * A component provided by a plugin, untyped.
 *
 * @deprecated The entries of each kind are typed by `PluginKinds` (decision 0097): use
 * `PluginKinds[kind]`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export type PluginComponent = ComponentType<any>;

/**
 * The kinds of entries a plugin can give, and the type of their entries (decision 0097). Each
 * package adds the kinds it renders, by augmenting this interface:
 *
 * ```ts
 * declare module '@panneau/core' {
 *     interface PluginKinds {
 *         filters: FilterEntry;
 *     }
 * }
 * ```
 *
 * `@panneau/core` declares `pages`, `widgets` and `previews`. `@panneau/forms` and
 * `@panneau/lists` declare `fields`; `@panneau/lists` `displays`, `listLayouts` and `filters`;
 * `@panneau/forms` `components` and `panels`; `@panneau/actions` `actions`. A project sees the
 * kinds of the packages it imports.
 */
export interface PluginKinds {
    /** Pages, by component name (`dashboard`). */
    pages: ComponentType<WithDefinitionProps<PageProps>>;
    /**
     * Dashboard widgets, by widget type (`map`, or a built-in type such as `stat` that it
     * replaces). The dashboard draws the card around the widget of a plugin.
     */
    widgets: ComponentType<WidgetProps>;
    /**
     * Previews of items, by name, for resources whose `features.preview` is a `component`
     * (`{ "mode": "component", "component": "page" }`).
     */
    previews: ComponentType<PreviewProps>;
}

/**
 * Props of an entry that also gets the `props` of the definition (a page, a component or a panel
 * of a form layout): unchecked data, which the component reads as its own props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the definition's props are data, unchecked
export type WithDefinitionProps<Props> = Props & Readonly<Record<string, any>>;

/** A kind of entries a plugin can give: a key of `PluginKinds`. */
export type PluginKind = keyof PluginKinds;

/** The entries of a plugin, by kind, then by the name the definition uses. */
export type PluginEntries = {
    readonly [Kind in PluginKind]?: Readonly<Record<string, PluginKinds[Kind]>>;
};

/** UI messages of a locale, keyed by message id. */
export type Messages = Record<string, string>;

/** Messages, or a function that loads them (`() => import('./lang/fr.json')`). */
export type MessagesLoader = Messages | (() => Promise<Messages | { default: Messages }>);

/**
 * What a plugin adds to Panneau: entries of each kind of `PluginKinds`, keyed by the name the
 * definition uses, and commands, messages and themes. Its id is `{vendor}.{name}`, in lowercase
 * (`panneau.fields`, `folklore.pages`).
 */
export type PanneauPlugin = PluginEntries & {
    /** Unique id of the plugin: `{vendor}.{name}`. */
    id: string;
    /** Commands of the "Go to…" palette, or a function that makes them for the definition. */
    commands?: CommandSource;
    /**
     * Keyboard shortcuts of the app, or a function that makes them for the definition (decision
     * 0112).
     */
    shortcuts?: ShortcutSource;
    /** UI messages, by locale. Messages of later plugins override earlier ones. */
    locales?: Record<string, MessagesLoader>;
    /** Themes, by id, that the theme of the definition can extend. */
    themes?: Record<string, Theme>;
};

/** What a plugin gives that isn't an entry of a kind. */
const NOT_KINDS = new Set(['id', 'commands', 'shortcuts', 'locales', 'themes']);

/**
 * The kinds that Panneau's packages render: the registry has them, empty, without a plugin that
 * gives them.
 */
const KNOWN_KINDS = [
    'fields',
    'displays',
    'listLayouts',
    'filters',
    'actions',
    'pages',
    'widgets',
    'components',
    'panels',
    'previews',
];

/**
 * The kinds of components a plugin can provide.
 *
 * @deprecated Use `PluginKind`.
 */
export type PluginComponentKind = PluginKind;

/**
 * Everything the plugins provide, merged. A later plugin overrides an earlier one. Read the
 * entries of a kind with `getEntries()` or `resolveEntry()`, which add the built-ins and the
 * overrides of the component that renders them.
 */
export type PluginRegistry = {
    readonly [Kind in PluginKind]: ReadonlyMap<string, PluginKinds[Kind]>;
} & {
    /** The plugins, in order. */
    plugins: readonly PanneauPlugin[];
    /** The commands of the plugins, in plugin order: `getCommands()` makes them. */
    commands: readonly CommandSource[];
    /** The shortcuts of the plugins, in plugin order: `getShortcuts()` makes them. */
    shortcuts: readonly ShortcutSource[];
    /** Message loaders of each locale, in plugin order. */
    locales: ReadonlyMap<string, readonly MessagesLoader[]>;
    themes: ReadonlyMap<string, Theme>;
};

/**
 * Declares a plugin. It returns the plugin as is, with its entries typed by the kinds of
 * `PluginKinds`.
 */
export function definePlugin<Plugin extends PanneauPlugin>(plugin: Plugin): Plugin {
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
    // Every kind a plugin gives, whichever package declares it, and those that Panneau renders
    const kinds = new Set<string>(KNOWN_KINDS);
    plugins.forEach((plugin) =>
        Object.keys(plugin)
            .filter((key) => !NOT_KINDS.has(key))
            .forEach((key) => kinds.add(key)),
    );
    const entries = Object.fromEntries(
        [...kinds].map((kind) => [
            kind,
            new Map(
                plugins.flatMap((plugin) =>
                    Object.entries(
                        (plugin as unknown as Record<string, Record<string, unknown> | undefined>)[
                            kind
                        ] ?? {},
                    ),
                ),
            ),
        ]),
    ) as unknown as { [Kind in PluginKind]: Map<string, PluginKinds[Kind]> };
    const locales = new Map<string, MessagesLoader[]>();
    plugins.forEach((plugin) =>
        Object.entries(plugin.locales ?? {}).forEach(([locale, loader]) => {
            locales.set(locale, [...(locales.get(locale) ?? []), loader]);
        }),
    );
    return {
        plugins: [...plugins],
        ...entries,
        locales,
        themes: new Map(plugins.flatMap((plugin) => Object.entries(plugin.themes ?? {}))),
        commands: plugins.flatMap((plugin) =>
            plugin.commands !== undefined ? [plugin.commands] : [],
        ),
        shortcuts: plugins.flatMap((plugin) =>
            plugin.shortcuts !== undefined ? [plugin.shortcuts] : [],
        ),
    };
}

/** The entries of a kind as a component gives them: a record, or a map. */
export type EntryOverrides<Kind extends PluginKind> =
    Readonly<Record<string, PluginKinds[Kind]>> | ReadonlyMap<string, PluginKinds[Kind]>;

/** Where `resolveEntry()` and `getEntries()` look, besides the plugins. */
export interface ResolveEntryOptions<Kind extends PluginKind> {
    /** The built-in entries of the kind, which plugins replace. */
    builtIn?: EntryOverrides<Kind> | undefined;
    /** The entries of the component that renders the kind (its props), over the plugins. */
    overrides?: EntryOverrides<Kind> | undefined;
}

function entriesOf<Kind extends PluginKind>(
    entries: EntryOverrides<Kind> | undefined,
): [string, PluginKinds[Kind]][] {
    if (entries === undefined) {
        return [];
    }
    return entries instanceof Map
        ? [...(entries as ReadonlyMap<string, PluginKinds[Kind]>)]
        : Object.entries(entries as Readonly<Record<string, PluginKinds[Kind]>>);
}

function entryOf<Kind extends PluginKind>(
    entries: EntryOverrides<Kind> | undefined,
    type: string,
): PluginKinds[Kind] | undefined {
    if (entries === undefined) {
        return undefined;
    }
    if (entries instanceof Map) {
        return (entries as ReadonlyMap<string, PluginKinds[Kind]>).get(type);
    }
    const record = entries as Readonly<Record<string, PluginKinds[Kind]>>;
    return Object.hasOwn(record, type) ? record[type] : undefined;
}

/**
 * Every entry of a kind (decision 0097): the built-ins, then those of the plugins in their order,
 * then the overrides of the component that renders them, the last winning. For the readers that
 * need all of them, such as the layout switch of a list.
 */
export function getEntries<Kind extends PluginKind>(
    registry: PluginRegistry,
    kind: Kind,
    { builtIn, overrides }: ResolveEntryOptions<Kind> = {},
): ReadonlyMap<string, PluginKinds[Kind]> {
    const plugins = (registry[kind] as ReadonlyMap<string, PluginKinds[Kind]> | undefined) ?? [];
    return new Map([...entriesOf(builtIn), ...plugins, ...entriesOf(overrides)]);
}

/**
 * `process.env.NODE_ENV`, as the bundler of an app replaces it. Declared here, so that the package
 * doesn't need the types of Node: in a browser, `process` doesn't exist.
 */
declare const process: { env: { NODE_ENV?: string } };

/**
 * Whether warnings for developers are on: not in a production build. The bundler of the app
 * replaces the exact expression `process.env.NODE_ENV`, so it is written as is, without `?.` or
 * `typeof process`, which it would leave and which would turn the warnings off in development.
 * Without a bundler, in a browser, `process` doesn't exist: no warnings.
 */
function isDevelopment(): boolean {
    try {
        return process.env.NODE_ENV !== 'production';
    } catch {
        return false;
    }
}

const warned = new Set<string>();

/**
 * Warns once, in development, that nothing renders an entry of a kind: what draws in its place
 * (a text input, a warning) then isn't a surprise.
 */
export function warnMissingEntry(kind: string, type: string): void {
    const key = `${kind}\u0000${type}`;
    if (warned.has(key) || !isDevelopment()) {
        return;
    }
    warned.add(key);
    console.warn(`[panneau] No entry of the kind "${kind}" for "${type}": no plugin gives one.`);
}

/**
 * The entry of a kind for a type (decision 0097): the override of the component that renders it,
 * else the entry of the last plugin that gives it, else the built-in one. `undefined` without any,
 * with a warning in development: each kind says what it draws in its place.
 */
export function resolveEntry<Kind extends PluginKind>(
    registry: PluginRegistry,
    kind: Kind,
    type: string,
    { builtIn, overrides }: ResolveEntryOptions<Kind> = {},
): PluginKinds[Kind] | undefined {
    const plugins = registry[kind] as ReadonlyMap<string, PluginKinds[Kind]> | undefined;
    const entry = entryOf(overrides, type) ?? plugins?.get(type) ?? entryOf(builtIn, type);
    if (entry === undefined) {
        warnMissingEntry(kind, type);
    }
    return entry;
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
