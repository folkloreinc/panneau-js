import { can } from '@panneau/core';
import type { Definition, MenuItem } from '@panneau/protocol';

import { type AppRoute, routePath } from './routes';

/** What a link of the navigation leads to, for its default icon and to know when it is current. */
export type NavTarget =
    | { kind: 'home' }
    | { kind: 'resource'; resource: string }
    | { kind: 'page'; page: string }
    | { kind: 'url'; external: boolean };

/** A link of the navigation. */
export interface NavLink {
    type: 'link';
    key: string;
    label: string;
    href: string;
    /** A Lucide icon name from the definition (`"icon": "file-text"`). */
    icon: string | undefined;
    target: NavTarget;
}

/** A titled group of links. */
export interface NavGroup {
    type: 'group';
    key: string;
    label: string | undefined;
    children: NavLink[];
}

export interface NavSeparator {
    type: 'separator';
    key: string;
}

export type NavEntry = NavLink | NavGroup | NavSeparator;

/** The first letter in upper case: resource labels are written in lower case (`pages`). */
export function capitalize(label: string, locale?: string): string {
    return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}

function toLinks(item: MenuItem, definition: Definition, basePath: string, key: string): NavLink[] {
    const resourceLink = (id: string, label?: string, icon?: string): NavLink[] => {
        const resource = definition.resources.find((candidate) => candidate.id === id);
        if (resource === undefined || !can(resource.abilities, 'viewAny')) {
            return [];
        }
        return [
            {
                type: 'link',
                key: `${key}:${id}`,
                label: label ?? capitalize(resource.label.plural, definition.locale),
                href: routePath({ name: 'resource.index', resource: id }, basePath),
                icon: icon ?? resource.icon,
                target: { kind: 'resource', resource: id },
            },
        ];
    };
    switch (item.type) {
        case 'resources':
            return definition.resources.flatMap(({ id }) => resourceLink(id));
        case 'resource':
            return item.resource !== undefined
                ? resourceLink(item.resource, item.label, item.icon)
                : [];
        case 'page': {
            const page = item.page !== undefined ? definition.pages?.[item.page] : undefined;
            if (item.page === undefined || page === undefined) {
                return [];
            }
            return [
                {
                    type: 'link',
                    key,
                    label: item.label ?? page.label ?? item.page,
                    href: routePath({ name: 'page', page: item.page }, basePath),
                    icon: item.icon,
                    target: { kind: 'page', page: item.page },
                },
            ];
        }
        case 'link':
            return item.url !== undefined
                ? [
                      {
                          type: 'link',
                          key,
                          label: item.label ?? item.url,
                          href: item.url,
                          icon: item.icon,
                          target: { kind: 'url', external: item.external === true },
                      },
                  ]
                : [];
        case 'group':
            return (item.children ?? []).flatMap((child, index) =>
                toLinks(child, definition, basePath, `${key}.${String(index)}`),
            );
        default:
            return [];
    }
}

/**
 * The entries of the main navigation: the `main` menu of the definition, or every resource and
 * page without one. Resources the user can't list (`abilities.viewAny`) and entries of unknown
 * types are left out. Groups keep one level: the links of nested groups join their parent.
 */
export function getNavigation(definition: Definition, basePath: string): NavEntry[] {
    const menu: MenuItem[] = definition.menus?.main ?? [
        { type: 'resources' },
        ...Object.keys(definition.pages ?? {}).map((page) => ({ type: 'page', page })),
    ];
    return menu.flatMap((item, index): NavEntry[] => {
        const key = String(index);
        if (item.type === 'separator') {
            return [{ type: 'separator', key }];
        }
        if (item.type === 'group') {
            const children = toLinks(item, definition, basePath, key);
            return children.length > 0 ? [{ type: 'group', key, label: item.label, children }] : [];
        }
        return toLinks(item, definition, basePath, key);
    });
}

/** Whether a link leads to the current route: a resource is current on all of its pages. */
export function isCurrent(target: NavTarget, route: AppRoute): boolean {
    switch (target.kind) {
        case 'home':
            return route.name === 'home';
        case 'resource':
            return 'resource' in route && route.resource === target.resource;
        case 'page':
            return route.name === 'page' && route.page === target.page;
        case 'url':
            return false;
    }
}
