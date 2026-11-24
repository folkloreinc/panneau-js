import { use, useEffect } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { isApplePlatform } from '../shortcuts/keys';
import { ShortcutContext, useShortcut } from '../shortcuts/useShortcut';

export { isApplePlatform };

/** The keys that open the "Go to…" palette. */
export const COMMAND_PALETTE_KEYS = 'Mod+K';

/**
 * Calls `onToggle` on ⌘K (Apple) or Ctrl+K (elsewhere), to open a `CommandPalette`, which closes
 * itself on the same keys. Inside a `PanneauRoot`, it is a shortcut of the page in the root's
 * registry (decision 0110), listed in the help as `label` ("Search" by default): it leaves the key
 * to what already handled it (an editor that links with Mod-K), and to an open modal dialog.
 *
 * Above a root, it listens on its own, with the same rules: the key is left alone when something
 * already handled it, when it repeats, during a composition, or when another modal dialog is open
 * while the palette is closed.
 */
export function useCommandShortcut(
    onToggle: () => void,
    {
        isOpen = false,
        enabled = true,
        label,
    }: { isOpen?: boolean; enabled?: boolean; label?: string } = {},
): void {
    const intl = usePanneauIntl();
    const context = use(ShortcutContext);
    useShortcut({
        id: 'panneau.goTo',
        keys: COMMAND_PALETTE_KEYS,
        label: label ?? intl.formatMessage(messages.commandPalette),
        enabled: enabled && !isOpen,
        perform: onToggle,
    });
    useEffect(() => {
        if (!enabled || context !== null) {
            return undefined;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            const modifier = isApplePlatform() ? event.metaKey : event.ctrlKey;
            if (
                event.key.toLowerCase() !== 'k' ||
                !modifier ||
                event.altKey ||
                event.shiftKey ||
                event.defaultPrevented ||
                event.repeat ||
                event.isComposing
            ) {
                return;
            }
            if (!isOpen && document.querySelector('[role="dialog"][aria-modal="true"]') !== null) {
                return;
            }
            event.preventDefault();
            onToggle();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });
}
