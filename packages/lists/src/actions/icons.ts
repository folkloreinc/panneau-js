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

/**
 * Icons of the built-in actions. Icons named in definitions (`"icon": "send"`) need a lookup by
 * name, which comes with the actions of Phase 2 (decision 0020).
 */
const BUILT_IN_ICONS: Record<string, LucideIcon> = {
    show: Eye,
    edit: Pencil,
    duplicate: Copy,
    delete: Trash2,
    restore: RotateCcw,
    export: Download,
    import: Upload,
};

/** The icon of an action, for the built-in ones. */
export function getActionIcon(action: Action): LucideIcon | undefined {
    return BUILT_IN_ICONS[action.id];
}
