import {
    Clock,
    File,
    House,
    Link2,
    List,
    Monitor,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Sun,
    Terminal,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getCommands, getSearchableResources, resolveResource, usePlugins } from '@panneau/core';
import { useSearch } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { toText } from '@panneau/lists';
import type { Definition, Item, Resource } from '@panneau/protocol';
import {
    CommandPalette,
    type CommandPaletteGroup,
    type CommandPaletteItem,
    type IconComponent,
    getNamedIcon,
    usePanneauIntl,
} from '@panneau/ui';

import { type NavLink, capitalize, getNavigation } from '../navigation';
import { getItemTitle } from '../pages/itemTitle';
import { readRecentItems, useRecentScope } from '../recentItems';
import { routePath } from '../routes';
import { COLOR_SCHEMES, type ColorSchemePreference } from './Sidebar';

/** Characters before the palette searches the server, and the pause after typing. */
const SEARCH_MIN_LENGTH = 2;
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
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
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

/** The URL of an item's image (`itemImage`): a URL, or a media with a thumbnail. */
function imageOf(item: Item, resource: Resource): string | undefined {
    const value = resource.itemImage !== undefined ? item[resource.itemImage] : undefined;
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object') {
        const media = (value as { media?: { thumbnailUrl?: unknown } }).media;
        const url =
            media?.thumbnailUrl ??
            (value as { thumbnailUrl?: unknown; url?: unknown }).thumbnailUrl;
        return typeof url === 'string' ? url : undefined;
    }
    return undefined;
}

/**
 * The "Go to…" palette of the app (decision 0029): recent items, navigation, "New {resource}",
 * the commands of plugins, the app's actions, then the results of the server's search, grouped by
 * resource. An item opens its edit form.
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
}: GoToProps) {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const user = useRecentScope();
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const locale = definition.locale;
    const searchable = getSearchableResources(definition);
    const searchEnabled = definition.search?.enabled !== false && searchable.length > 0;

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebounced(query.trim()), SEARCH_DELAY);
        return () => window.clearTimeout(timeout);
    }, [query]);

    const search = useSearch(debounced, {
        enabled: isOpen && searchEnabled && debounced.length >= SEARCH_MIN_LENGTH,
    });
    const resourceOf = (id: string) => definition.resources.find((resource) => resource.id === id);
    const editPath = (resource: string, id: string) =>
        routePath({ name: 'resource.edit', resource, id }, basePath);

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
                            href: editPath(entry.resource, entry.id),
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

    const create: CommandPaletteItem[] = definition.resources.flatMap((resource) =>
        resolveResource(resource).abilities.create
            ? [
                  {
                      id: resource.id,
                      label: intl.formatMessage(appMessages.create, {
                          resource: resource.label.singular,
                      }),
                      keywords: [resource.label.plural],
                      icon: Plus,
                      href: routePath({ name: 'resource.create', resource: resource.id }, basePath),
                  },
              ]
            : [],
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
        {
            id: 'sidebar',
            label: intl.formatMessage(
                sidebarCollapsed ? appMessages.expandSidebar : appMessages.collapseSidebar,
            ),
            icon: sidebarCollapsed ? PanelLeftOpen : PanelLeftClose,
            onAction: onToggleSidebar,
        },
        ...COLOR_SCHEMES.filter((scheme) => scheme !== colorScheme).map((scheme) => ({
            id: `scheme-${scheme}`,
            label: intl.formatMessage(appMessages.colorScheme, { scheme }),
            icon: SCHEME_ICONS[scheme],
            onAction: () => onColorSchemeChange(scheme),
        })),
    ];

    const results: CommandPaletteGroup[] =
        searchEnabled && query.trim().length >= SEARCH_MIN_LENGTH
            ? (search.data?.data ?? []).flatMap(({ resource: id, items }) => {
                  const resource = resourceOf(id);
                  if (resource === undefined) {
                      return [];
                  }
                  const subtitle = resource.itemSubtitle;
                  return [
                      {
                          id: `search-${id}`,
                          label: capitalize(resource.label.plural, locale),
                          matched: true,
                          items: items.map((item) => ({
                              id: item.id,
                              label: getItemTitle(item, resource.itemTitle, locale) ?? item.id,
                              description:
                                  subtitle !== undefined
                                      ? toText(item[subtitle], locale) || undefined
                                      : undefined,
                              imageUrl: imageOf(item, resource),
                              icon:
                                  resource.icon !== undefined ? getNamedIcon(resource.icon) : List,
                              href: editPath(id, item.id),
                          })),
                      },
                  ];
              })
            : [];

    const searching = searchEnabled && query.trim().length >= SEARCH_MIN_LENGTH;
    const status =
        searching && search.isError
            ? intl.formatMessage(appMessages.searchError)
            : searching && (search.isFetching || debounced !== query.trim())
              ? intl.formatMessage(appMessages.searching)
              : undefined;

    return (
        <CommandPalette
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            inputValue={query}
            onInputChange={setQuery}
            aria-label={intl.formatMessage(appMessages.goTo)}
            status={status}
            groups={[
                { id: 'recent', label: intl.formatMessage(appMessages.groupRecent), items: recent },
                {
                    id: 'navigation',
                    label: intl.formatMessage(appMessages.groupNavigation),
                    items: navigation,
                },
                { id: 'create', label: intl.formatMessage(appMessages.groupCreate), items: create },
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
                ...results,
            ]}
        />
    );
}
