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
import { type IconComponent, getNamedIcon } from '@panneau/ui';

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

/** Colors of the built-in actions in rows, as Panneau 4 had them (decision 0060). */
const BUILT_IN_TONES: Record<string, 'accent' | 'info' | 'success'> = {
    show: 'info',
    edit: 'accent',
    restore: 'success',
};

/**
 * The tone of an action in rows (decision 0060): `danger` when it destroys, a color for `show`
 * (`info`), `edit` (`accent`) and `restore` (`success`), and `neutral` for the others.
 */
export function getActionTone(
    action: Action,
): 'neutral' | 'accent' | 'info' | 'success' | 'danger' {
    if (action.destructive === true) {
        return 'danger';
    }
    return Object.hasOwn(BUILT_IN_TONES, action.id)
        ? (BUILT_IN_TONES[action.id] ?? 'neutral')
        : 'neutral';
}
