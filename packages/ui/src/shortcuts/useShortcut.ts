import { createContext, use, useEffect, useEffectEvent, useSyncExternalStore } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { type FormattedShortcut, type ShortcutKeys, formatShortcut } from './keys';
import type { RegisteredShortcut, ShortcutOptions, ShortcutRegistry } from './registry';

/** The registry of shortcuts of a `PanneauRoot`, and how to open its help. */
export interface ShortcutContextValue {
    registry: ShortcutRegistry;
    /** Opens the help, the dialog that lists the shortcuts. */
    openHelp: () => void;
}

export const ShortcutContext = createContext<ShortcutContextValue | null>(null);

const NO_SHORTCUTS: readonly RegisteredShortcut[] = [];
const subscribeToNothing = () => () => undefined;

/** The keys of a shortcut, as a string that only changes when they do. */
function keysKey(keys: ShortcutKeys): string {
    return JSON.stringify(keys);
}

/**
 * Registers a keyboard shortcut while the component is mounted, in the registry of the closest
 * `PanneauRoot` (decision 0110): its keys, a label and a group for the help, a scope, and what it
 * does. Without a root, it does nothing.
 *
 * The scope decides who gets the keys: the innermost element scope that holds the focus, then the
 * last shortcut of the open dialog, then the last of the page; nothing of the page fires while a
 * modal dialog is open. Single keys (`?`, `j`) are ignored while the focus is in a text field, a
 * select or an editor, and when the user turned them off.
 *
 * A shortcut keeps its place when its `perform` changes. Changing its keys, label, group, scope or
 * `enabled` registers it again, last.
 */
export function useShortcut({
    id,
    keys,
    label,
    group,
    scope = 'page',
    enabled = true,
    inInputs,
    perform,
}: ShortcutOptions): void {
    const context = use(ShortcutContext);
    const onKey = useEffectEvent((event: KeyboardEvent) => perform(event));
    const keysValue = keysKey(keys);
    useEffect(() => {
        if (context === null || !enabled) {
            return undefined;
        }
        return context.registry.register({
            id,
            keys: JSON.parse(keysValue) as ShortcutKeys,
            label,
            group,
            scope,
            inInputs,
            perform: (event) => onKey(event),
        });
    }, [context, enabled, id, keysValue, label, group, scope, inInputs]);
}

/**
 * The shortcuts registered now, in the order they were added, for the help: empty without a
 * `PanneauRoot`.
 */
export function useRegisteredShortcuts(): readonly RegisteredShortcut[] {
    const context = use(ShortcutContext);
    return useSyncExternalStore(
        context?.registry.subscribe ?? subscribeToNothing,
        context?.registry.getShortcuts ?? (() => NO_SHORTCUTS),
        () => NO_SHORTCUTS,
    );
}

/**
 * Opens the help, the dialog that lists the shortcuts registered now: for a menu item or a command.
 * `null` without a `PanneauRoot`.
 */
export function useShortcutHelp(): (() => void) | null {
    return use(ShortcutContext)?.openHelp ?? null;
}

/**
 * Formats the keys of a shortcut for the platform and the language of the interface: `⌘S` on
 * Apple platforms, `Ctrl+S` elsewhere, with `aria-keyshortcuts`. For the tooltips of buttons.
 */
export function useFormatShortcut(): (keys: ShortcutKeys) => FormattedShortcut {
    const intl = usePanneauIntl();
    const names = {
        Enter: intl.formatMessage(messages.keyEnter),
        ' ': intl.formatMessage(messages.keySpace),
    };
    return (keys) => formatShortcut(keys, { names });
}

/** The labels of a shortcut's combinations, joined as alternatives: "⌘S or ⌘↩". */
export function useShortcutLabel(): (keys: ShortcutKeys) => string {
    const intl = usePanneauIntl();
    const format = useFormatShortcut();
    return (keys) => intl.formatList(format(keys).labels, { type: 'disjunction' });
}
