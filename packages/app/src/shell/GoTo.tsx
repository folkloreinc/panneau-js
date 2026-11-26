import {
    Clock,
    File,
    House,
    Keyboard,
    Languages,
    Link2,
    List,
    Monitor,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Search,
    Sun,
    Terminal,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getCommands, getSearchableResources, resolveResource, usePlugins } from '@panneau/core';
import { isApiError } from '@panneau/data';
import { useSearch } from '@panneau/data/query';
import { appMessages, uiMessages } from '@panneau/intl';
import { getImageUrl, toText } from '@panneau/lists';
import type { Definition, Item, Resource } from '@panneau/protocol';
import {
    SEARCH_MAX_LIMIT,
    SEARCH_MIN_LENGTH,
    getCreatableTypes,
    getItemImageField,
    hasResourceTypes,
    toSearchParams,
} from '@panneau/protocol/runtime';
import {
    CommandPalette,
    type CommandPaletteGroup,
    type CommandPaletteItem,
    type IconComponent,
    getNamedIcon,
    usePanneauIntl,
    useShortcutHelp,
} from '@panneau/ui';

import { getInterfaceLocales } from '../interfaceLocales';
import { type NavLink, capitalize, getNavigation } from '../navigation';
import { getItemPath } from '../pages/itemLinks';
import { getItemTitle } from '../pages/itemTitle';
import { readRecentItems, useRecentScope } from '../recentItems';
import { routePath } from '../routes';
import { COLOR_SCHEMES, type ColorSchemePreference } from './UserMenu';
import { type DensityChoice, useDensityCommands } from './density';
import { SHORTCUT_HELP_KEYS } from './keys';

/** The pause after typing before the palette searches the server. */
const SEARCH_DELAY = 300;

const SCHEME_ICONS: Record<ColorSchemePreference, IconComponent> = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
};

export interface GoToProps {
    definition: Definition;
    basePath: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    sidebarCollapsed?: boolean;
    /** Collapses or expands the sidebar. Without it, as with the dock, the palette has no such command. */
    onToggleSidebar?: () => void;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** The user's density, and how to keep it: without it, no command (decision 0104). */
    density?: DensityChoice | undefined;
    onDensityChange?: ((density: DensityChoice) => void) | undefined;
    /** Switches the interface to a locale of `interfaceLocales` (decision 0083). */
    onLocaleChange?: ((locale: string) => void) | undefined;
}

function navIcon(link: NavLink): IconComponent {
    if (link.icon !== undefined) {
        return getNamedIcon(link.icon);
    }
    switch (link.target.kind) {
        case 'home':
            return House;
        case 'resource':
            return List;
        case 'page':
            return File;
        case 'url':
            return Link2;
    }
}

/** The URL of an item's image (`itemImage`, or the `media` of a library), or none. */
function imageOf(item: Item, resource: Resource): string | undefined {
    const field = getItemImageField(resource);
    return (field !== undefined ? getImageUrl(item[field]) : null) ?? undefined;
}

/**
 * The "Go to…" palette of the app (decision 0029): recent items, navigation, "New {resource}",
 * the commands of plugins, the app's actions, then the results of the server's search, grouped by
 * resource. An item opens where its title opens in its list (`getItemPath()`, decision 0082): its
 * form, or its panel when its resource opens there or the user can't update it. What matches the
 * query is highlighted in labels. "Search in" narrows the palette to the results of one
 * resource, 20 of them, until Backspace in the empty field.
 */
export function GoTo({
    definition,
    basePath,
    isOpen,
    onOpenChange,
    sidebarCollapsed,
    onToggleSidebar,
    colorScheme,
    onColorSchemeChange,
    density,
    onDensityChange,
    onLocaleChange,
}: GoToProps) {
    const intl = usePanneauIntl();
    const densityCommands = useDensityCommands(density, onDensityChange);
    const openShortcutHelp = useShortcutHelp();
    const plugins = usePlugins();
    const user = useRecentScope();
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    // The resource the search is narrowed to
    const [scope, setScope] = useState<string | null>(null);
    const locale = definition.locale;
    const searchable = getSearchableResources(definition);
    const searchEnabled = definition.search?.enabled !== false && searchable.length > 0;

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebounced(query.trim()), SEARCH_DELAY);
        return () => window.clearTimeout(timeout);
    }, [query]);

    const resourceOf = (id: string) => definition.resources.find((resource) => resource.id === id);
    const scoped = scope !== null ? (resourceOf(scope) ?? null) : null;
    const search = useSearch(debounced, {
        enabled: isOpen && searchEnabled && debounced.length >= SEARCH_MIN_LENGTH,
        ...(scoped !== null && { limit: SEARCH_MAX_LIMIT, resources: [scoped.id] }),
    });
    const changeOpen = (open: boolean) => {
        if (!open) {
            setScope(null);
        }
        onOpenChange(open);
    };

    const recent: CommandPaletteItem[] = isOpen
        ? readRecentItems(basePath, user).flatMap((entry) => {
              const resource = resourceOf(entry.resource);
              return resource !== undefined
                  ? [
                        {
                            id: `${entry.resource}:${entry.id}`,
                            label: entry.title,
                            description: capitalize(resource.label.singular, locale),
                            icon: resource.icon !== undefined ? getNamedIcon(resource.icon) : Clock,
                            // Without its abilities (recorded before they were kept), the show
                            // route, which goes to the form once the item says it can be updated
                            href: getItemPath(resource, entry, basePath),
                        },
                    ]
                  : [];
          })
        : [];

    const navigation: CommandPaletteItem[] = [
        {
            id: 'home',
            label: intl.formatMessage(appMessages.home),
            icon: House,
            href: routePath({ name: 'home' }, basePath),
        },
        ...getNavigation(definition, basePath)
            .flatMap((entry) =>
                entry.type === 'link' ? [entry] : entry.type === 'group' ? entry.children : [],
            )
            .map((link) => ({
                id: link.key,
                label: link.label,
                icon: navIcon(link),
                href: link.href,
            })),
    ];

    // An entry per resource, or per type of a resource with types (decision 0077)
    const create: CommandPaletteItem[] = definition.resources.flatMap(
        (resource): CommandPaletteItem[] => {
            if (!resolveResource(resource).abilities.create) {
                return [];
            }
            if (hasResourceTypes(resource)) {
                return getCreatableTypes(resource).map((type) => ({
                    id: `${resource.id}/${type.id}`,
                    label: intl.formatMessage(appMessages.create, { resource: type.label }),
                    keywords: [resource.label.singular, resource.label.plural],
                    icon: type.icon !== undefined ? getNamedIcon(type.icon) : Plus,
                    href: routePath(
                        { name: 'resource.create', resource: resource.id, type: type.id },
                        basePath,
                    ),
                }));
            }
            return [
                {
                    id: resource.id,
                    label: intl.formatMessage(appMessages.create, {
                        resource: resource.label.singular,
                    }),
                    keywords: [resource.label.plural],
                    icon: Plus,
                    href: routePath({ name: 'resource.create', resource: resource.id }, basePath),
                },
            ];
        },
    );

    // The commands of plugins, in their own groups or in "Commands".
    const commandGroups = new Map<string, CommandPaletteItem[]>();
    getCommands(plugins.commands, { definition }).forEach((command) => {
        const group = command.group ?? intl.formatMessage(appMessages.groupCommands);
        commandGroups.set(group, [
            ...(commandGroups.get(group) ?? []),
            {
                id: command.id,
                label: command.label,
                description: command.description,
                keywords: command.keywords,
                icon: command.icon !== undefined ? getNamedIcon(command.icon) : Terminal,
                href: command.href,
                onAction: command.perform,
            },
        ]);
    });

    const actions: CommandPaletteItem[] = [
        ...(onToggleSidebar !== undefined
            ? [
                  {
                      id: 'sidebar',
                      label: intl.formatMessage(
                          sidebarCollapsed === true
                              ? appMessages.expandSidebar
                              : appMessages.collapseSidebar,
                      ),
                      icon: sidebarCollapsed === true ? PanelLeftOpen : PanelLeftClose,
                      onAction: onToggleSidebar,
                  },
              ]
            : []),
        ...COLOR_SCHEMES.filter((scheme) => scheme !== colorScheme).map((scheme) => ({
            id: `scheme-${scheme}`,
            label: intl.formatMessage(appMessages.colorScheme, { scheme }),
            icon: SCHEME_ICONS[scheme],
            onAction: () => onColorSchemeChange(scheme),
        })),
        ...densityCommands,
        ...(onLocaleChange !== undefined ? getInterfaceLocales(definition) : [])
            .filter(({ locale: other }) => other !== locale)
            .map(({ locale: other, label }) => ({
                id: `locale-${other}`,
                label: intl.formatMessage(appMessages.languageButton, { language: label }),
                icon: Languages,
                onAction: () => onLocaleChange?.(other),
            })),
        // The help of shortcuts (decision 0112)
        ...(openShortcutHelp !== null
            ? [
                  {
                      id: 'shortcuts',
                      label: intl.formatMessage(uiMessages.shortcutsTitle),
                      keywords: [intl.formatMessage(uiMessages.shortcutsHelp)],
                      icon: Keyboard,
                      shortcut: SHORTCUT_HELP_KEYS,
                      onAction: openShortcutHelp,
                  },
              ]
            : []),
    ];

    const searchIn: CommandPaletteItem[] = searchEnabled
        ? searchable.map((resource) => ({
              id: resource.id,
              label: capitalize(resource.label.plural, locale),
              keywords: [resource.label.singular],
              icon: resource.icon !== undefined ? getNamedIcon(resource.icon) : Search,
              keepsOpen: true,
              onAction: () => {
                  setScope(resource.id);
                  setQuery('');
              },
          }))
        : [];

    const searching = searchEnabled && query.trim().length >= SEARCH_MIN_LENGTH;
    const results: CommandPaletteGroup[] = searching
        ? (search.data?.data ?? []).flatMap(({ resource: id, items, total }) => {
              const resource = resourceOf(id);
              if (resource === undefined || (scoped !== null && id !== scoped.id)) {
                  return [];
              }
              const subtitle = resource.itemSubtitle;
              const icon = resource.icon !== undefined ? getNamedIcon(resource.icon) : List;
              // The list of the resource, searched, has every result
              const more: CommandPaletteItem[] =
                  total !== undefined && total > items.length
                      ? [
                            {
                                id: `${id}:all`,
                                label: intl.formatMessage(appMessages.seeAllResults, {
                                    count: total,
                                }),
                                icon: Search,
                                href: `${routePath({ name: 'resource.index', resource: id }, basePath)}?${toSearchParams({ q: query.trim() })}`,
                            },
                        ]
                      : [];
              return [
                  {
                      id: `search-${id}`,
                      label: capitalize(resource.label.plural, locale),
                      matched: true,
                      items: [
                          ...items.map((item) => ({
                              id: item.id,
                              label: getItemTitle(item, resource.itemTitle, locale) ?? item.id,
                              description:
                                  subtitle !== undefined
                                      ? toText(item[subtitle], locale) || undefined
                                      : undefined,
                              imageUrl: imageOf(item, resource),
                              icon,
                              href: getItemPath(resource, item, basePath),
                          })),
                          ...more,
                      ],
                  },
              ];
          })
        : [];

    const status = !searching
        ? scoped !== null
            ? intl.formatMessage(appMessages.searchMinLength, { count: SEARCH_MIN_LENGTH })
            : undefined
        : search.isError
          ? intl.formatMessage(
                isApiError(search.error) && search.error.status === 429
                    ? appMessages.searchRateLimited
                    : appMessages.searchError,
            )
          : search.isFetching || debounced !== query.trim()
            ? intl.formatMessage(appMessages.searching)
            : undefined;

    const local: CommandPaletteGroup[] =
        scoped === null
            ? [
                  {
                      id: 'recent',
                      label: intl.formatMessage(appMessages.groupRecent),
                      items: recent,
                  },
                  {
                      id: 'navigation',
                      label: intl.formatMessage(appMessages.groupNavigation),
                      items: navigation,
                  },
                  {
                      id: 'create',
                      label: intl.formatMessage(appMessages.groupCreate),
                      items: create,
                  },
                  ...[...commandGroups].map(([label, items]) => ({
                      id: `commands-${label}`,
                      label,
                      items,
                  })),
                  {
                      id: 'actions',
                      label: intl.formatMessage(appMessages.groupActions),
                      items: actions,
                  },
                  {
                      id: 'search-in',
                      label: intl.formatMessage(appMessages.groupSearchIn),
                      items: searchIn,
                  },
              ]
            : [];

    return (
        <CommandPalette
            isOpen={isOpen}
            onOpenChange={changeOpen}
            inputValue={query}
            onInputChange={setQuery}
            aria-label={intl.formatMessage(appMessages.goTo)}
            placeholder={
                scoped !== null ? intl.formatMessage(appMessages.searchPlaceholder) : undefined
            }
            scope={scoped !== null ? capitalize(scoped.label.plural, locale) : null}
            onScopeRemove={() => setScope(null)}
            status={status}
            groups={[...local, ...results]}
            highlightMatches
        />
    );
}
