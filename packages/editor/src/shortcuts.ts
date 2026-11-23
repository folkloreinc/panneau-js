/** A shortcut as the user reads it, and as `aria-keyshortcuts` names it. */
export interface FormattedShortcut {
    /** `⌘B` and `⌘⇧8` on Apple platforms, `Ctrl+B` and `Ctrl+Shift+8` elsewhere. */
    label: string;
    /** `Meta+B` on Apple platforms, `Control+B` elsewhere. */
    keys: string;
}

const APPLE_SYMBOLS: Readonly<Record<string, string>> = {
    Mod: '⌘',
    Shift: '⇧',
    Alt: '⌥',
    Ctrl: '⌃',
};

const OTHER_NAMES: Readonly<Record<string, string>> = {
    Mod: 'Ctrl',
    Shift: 'Shift',
    Alt: 'Alt',
    Ctrl: 'Ctrl',
};

/**
 * Formats a shortcut written as TipTap writes them (`Mod-b`, `Mod-Shift-8`, `Shift-Mod-z`) for
 * the platform: `Mod` is ⌘ on Apple platforms and Ctrl elsewhere.
 */
export function formatShortcut(shortcut: string, apple: boolean): FormattedShortcut {
    const parts = shortcut.split(/-(?!$)/);
    const key = (parts.at(-1) ?? '').toUpperCase();
    // Modifiers in the order of each platform: ⌃⌥⇧⌘ on Apple ones, Ctrl+Alt+Shift elsewhere
    const modifiers = ['Ctrl', 'Alt', 'Shift', 'Mod'].filter((name) =>
        parts.slice(0, -1).includes(name),
    );
    const ordered = apple ? modifiers : [...modifiers].sort((a, b) => order(a) - order(b));
    const label = apple
        ? [...ordered.map((name) => APPLE_SYMBOLS[name] ?? name), key].join('')
        : [...ordered.map((name) => OTHER_NAMES[name] ?? name), key].join('+');
    const keys = [
        ...ordered.map((name) =>
            name === 'Mod' ? (apple ? 'Meta' : 'Control') : name === 'Ctrl' ? 'Control' : name,
        ),
        key,
    ].join('+');
    return { label, keys };
}

/** Ctrl first, then Alt and Shift, off Apple platforms. */
function order(name: string): number {
    return name === 'Mod' || name === 'Ctrl' ? 0 : name === 'Alt' ? 1 : 2;
}
