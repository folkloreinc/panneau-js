import {
    Copy,
    Download,
    Eye,
    type LucideIcon,
    Pencil,
    RotateCcw,
    Trash2,
    Upload,
} from 'lucide-react';

import type { Action } from '@panneau/protocol';
import { isExternalUrl } from '@panneau/protocol/runtime';
import { type IconComponent, type Tone, getNamedIcon } from '@panneau/ui';

/** Icons of actions by action id, for actions written in code (`{ archive: Archive }`). */
export type ActionIcons = Readonly<Record<string, IconComponent>>;

/** Icons of the built-in actions, when they don't name one. */
const BUILT_IN_ICONS: Record<string, LucideIcon> = {
    show: Eye,
    edit: Pencil,
    duplicate: Copy,
    delete: Trash2,
    restore: RotateCcw,
    export: Download,
    import: Upload,
};

/**
 * The icon of an action: the one given for its id in `icons`, then the Lucide icon its `icon`
 * names (`"send"`, loaded when it first renders), then the icon of a built-in action.
 */
export function getActionIcon(action: Action, icons?: ActionIcons): IconComponent | undefined {
    const given =
        icons !== undefined && Object.hasOwn(icons, action.id) ? icons[action.id] : undefined;
    if (given !== undefined) {
        return given;
    }
    if (action.icon !== undefined && action.icon !== '') {
        return getNamedIcon(action.icon);
    }
    return Object.hasOwn(BUILT_IN_ICONS, action.id) ? BUILT_IN_ICONS[action.id] : undefined;
}

/** Colors of the built-in actions, as Panneau 4 had them in rows (decision 0060). */
const BUILT_IN_TONES: Record<string, 'accent' | 'info' | 'success'> = {
    show: 'info',
    edit: 'accent',
    restore: 'success',
};

/**
 * The tone of an action, in rows and in the header of an item (decisions 0060 and 0091): `danger`
 * when it destroys, then the tone it declares, then `info` for `show`, `accent` for `edit` and
 * `success` for `restore`, then `info` for a link that leaves the admin (its page on the site), and
 * `neutral` for the others.
 */
export function getActionTone(action: Action): Tone {
    if (action.destructive === true) {
        return 'danger';
    }
    if (typeof action.tone === 'string' && action.tone !== '') {
        return action.tone as Tone;
    }
    if (Object.hasOwn(BUILT_IN_TONES, action.id)) {
        return BUILT_IN_TONES[action.id] ?? 'neutral';
    }
    if (action.kind === 'link' && typeof action.url === 'string' && isExternalUrl(action.url)) {
        return 'info';
    }
    return 'neutral';
}
