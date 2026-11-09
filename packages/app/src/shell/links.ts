import { ExternalLink, File, Folder, House, Link2, List } from 'lucide-react';

import { type IconComponent, getNamedIcon } from '@panneau/ui';

import type { NavGroup, NavLink, NavTarget } from '../navigation';
import { routePath } from '../routes';

function defaultIcon(target: NavTarget): IconComponent {
    switch (target.kind) {
        case 'home':
            return House;
        case 'resource':
            return List;
        case 'page':
            return File;
        case 'url':
            return target.external ? ExternalLink : Link2;
    }
}

/** The icon of a link of the navigation: the one the menu names, or one for its kind. */
export function getLinkIcon(link: NavLink): IconComponent {
    return link.icon !== undefined ? getNamedIcon(link.icon) : defaultIcon(link.target);
}

/** The icon of a group of the navigation, in the dock: the one the menu names, or a folder. */
export function getGroupIcon(group: NavGroup): IconComponent {
    return group.icon !== undefined ? getNamedIcon(group.icon) : Folder;
}

/** The link to the home page, first in the navigation of the shell. */
export function getHomeLink(label: string, basePath: string): NavLink {
    return {
        type: 'link',
        key: 'home',
        label,
        href: routePath({ name: 'home' }, basePath),
        icon: undefined,
        target: { kind: 'home' },
    };
}
