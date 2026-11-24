import type { CommandContext } from './commands';

/**
 * A keyboard shortcut that a plugin adds (decision 0110), registered by the app while it is shown
 * and listed in the help of shortcuts.
 */
export interface Shortcut {
    /** Unique among the shortcuts of plugins. */
    id: string;
    /**
     * Its keys, as `useShortcut()` of `@panneau/ui` reads them: `Mod+Shift+P` (`Mod` is ⌘ on Apple
     * platforms, Ctrl elsewhere), several (`['Mod+Shift+P', 'F2']`), or per platform
     * (`{ apple: 'Meta+Alt+P', other: 'Control+Alt+P' }`). A single key (`g`) is ignored while
     * the user types, and when they turned single keys off.
     */
    keys:
        | string
        | readonly string[]
        | { apple: string | readonly string[]; other: string | readonly string[] };
    /** What it does, in the help. */
    label: string;
    /** Its group in the help. Defaults to "General". */
    group?: string;
    /** What it does. It is a shortcut of the page: it never fires while a dialog is open. */
    perform: () => void;
}

/** Shortcuts, or a function that makes them for the current definition. */
export type ShortcutSource =
    readonly Shortcut[] | ((context: CommandContext) => readonly Shortcut[]);

/** The shortcuts of every source, in order. */
export function getShortcuts(
    sources: readonly ShortcutSource[],
    context: CommandContext,
): Shortcut[] {
    return sources.flatMap((source) => (typeof source === 'function' ? source(context) : source));
}
