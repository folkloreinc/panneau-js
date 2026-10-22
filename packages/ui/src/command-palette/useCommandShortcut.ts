import { useEffect } from 'react';

/** Whether the platform's shortcut key is ⌘ (Apple) rather than Ctrl. */
export function isApplePlatform(): boolean {
    return typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform);
}

/**
 * Calls `onToggle` on ⌘K (Apple) or Ctrl+K (elsewhere), to open or close a `CommandPalette`. The
 * key is left alone when something already handled it (an editor that links with Mod-K), when it
 * repeats, during a composition, or when another modal dialog is open while the palette is closed.
 */
export function useCommandShortcut(
    onToggle: () => void,
    { isOpen = false, enabled = true }: { isOpen?: boolean; enabled?: boolean } = {},
): void {
    useEffect(() => {
        if (!enabled) {
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
