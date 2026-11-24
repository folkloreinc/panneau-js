/**
 * Keys of shortcuts: written once for every platform (`Mod+S`), matched against key presses, and
 * formatted for people (`⌘S`, `Ctrl+S`) and for `aria-keyshortcuts` (`Meta+S`, `Control+S`).
 */

/**
 * The keys of a shortcut: one combination (`Mod+K`), several (`['Mod+S', 'Mod+Enter']`), or
 * different ones on Apple platforms and elsewhere (`{ apple: 'Meta+\\', other: 'Control+\\' }`).
 *
 * A combination is modifiers and one key, joined by `+`, as `aria-keyshortcuts` writes them:
 * `Mod` (⌘ on Apple platforms, Ctrl elsewhere), `Control`, `Alt`, `Shift` and `Meta`, then a key
 * as `KeyboardEvent.key` names it (`k`, `Enter`, `ArrowDown`, `?`, `\`). A combination without
 * `Mod`, `Control`, `Alt` or `Meta` is a single key: `?`, `j`, `Shift+J`.
 */
export type ShortcutKeys =
    | string
    | readonly string[]
    | { apple: string | readonly string[]; other: string | readonly string[] };

/** A combination, read. */
interface Combination {
    control: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    key: string;
}

/** Whether the platform's shortcut key is ⌘ (Apple) rather than Ctrl. */
export function isApplePlatform(): boolean {
    return typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform);
}

/** The combinations of `keys` on a platform. */
export function getCombinations(keys: ShortcutKeys, apple = isApplePlatform()): readonly string[] {
    const forPlatform =
        typeof keys === 'object' && 'apple' in keys ? keys[apple ? 'apple' : 'other'] : keys;
    return typeof forPlatform === 'string' ? [forPlatform] : forPlatform;
}

const MODIFIERS: Readonly<Record<string, keyof Omit<Combination, 'key'> | 'mod'>> = {
    mod: 'mod',
    control: 'control',
    ctrl: 'control',
    alt: 'alt',
    option: 'alt',
    shift: 'shift',
    meta: 'meta',
    cmd: 'meta',
};

/** Reads a combination: `Mod+Shift+Z` is ⌘⇧Z on Apple platforms, Ctrl+Shift+Z elsewhere. */
function parse(combination: string, apple: boolean): Combination {
    // A `+` after a `+`, or alone, is the key
    const parts = combination.split(/\+(?!$)/);
    const key = parts.at(-1) ?? '';
    const read: Combination = { control: false, alt: false, shift: false, meta: false, key };
    parts.slice(0, -1).forEach((part) => {
        const modifier = MODIFIERS[part.toLowerCase()];
        if (modifier === 'mod') {
            read[apple ? 'meta' : 'control'] = true;
        } else if (modifier !== undefined) {
            read[modifier] = true;
        }
    });
    return read;
}

/** Whether a combination has no modifier but Shift: `?`, `j`, `Shift+J`. */
export function isSingleKey(combination: string): boolean {
    const { control, alt, meta } = parse(combination, false);
    return !control && !alt && !meta;
}

/** A letter or a digit, whose `code` is `KeyA` or `Digit1` whatever the layout and modifiers. */
function codeOf(key: string): string | null {
    if (/^[a-z]$/i.test(key)) {
        return `Key${key.toUpperCase()}`;
    }
    return /^\d$/.test(key) ? `Digit${key}` : null;
}

/** Whether a key press is one of the combinations of `keys` on this platform. */
export function matchesKeys(
    event: KeyboardEvent,
    keys: ShortcutKeys,
    apple = isApplePlatform(),
): boolean {
    return getCombinations(keys, apple).some((combination) => {
        const { control, alt, shift, meta, key } = parse(combination, apple);
        if (event.ctrlKey !== control || event.altKey !== alt || event.metaKey !== meta) {
            return false;
        }
        const code = codeOf(key);
        // A symbol typed with Shift (`?`) is named by its key, whatever Shift does on the layout
        if (code === null && key.length === 1 && !shift) {
            return event.key === key;
        }
        if (event.shiftKey !== shift) {
            return false;
        }
        // ⌥ and ⇧ change the key a letter types (⌥K is ˚): its code stays
        return (
            event.key.toLowerCase() === key.toLowerCase() || (code !== null && event.code === code)
        );
    });
}

/** A shortcut as people read it, and as `aria-keyshortcuts` names it. */
export interface FormattedShortcut {
    /** Each combination: `⌘S` and `⇧⌘8` on Apple platforms, `Ctrl+S` and `Ctrl+Shift+8` elsewhere. */
    labels: readonly string[];
    /** The value of `aria-keyshortcuts`: `Meta+S Meta+Enter`, `Control+S Control+Enter`. */
    keys: string;
}

/** Names of keys, for people. */
export interface KeyNames {
    /** Off Apple platforms: `Enter`, `Space`, `Esc`… On Apple ones, symbols stay (↩). */
    readonly [key: string]: string;
}

const APPLE_KEYS: Readonly<Record<string, string>> = {
    Enter: '↩',
    Escape: '⎋',
    Backspace: '⌫',
    Delete: '⌦',
    Tab: '⇥',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    ' ': 'Space',
};

const OTHER_KEYS: Readonly<Record<string, string>> = {
    Escape: 'Esc',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    ' ': 'Space',
};

/** The key of `aria-keyshortcuts`: `Space` for a space, a letter in capitals. */
function ariaKey(key: string): string {
    if (key === ' ') {
        return 'Space';
    }
    return key.length === 1 ? key.toUpperCase() : key;
}

/**
 * Formats the keys of a shortcut for the platform, in the order of each: ⌃⌥⇧⌘ on Apple
 * platforms (`⇧⌘Z`), Ctrl+Alt+Shift elsewhere (`Ctrl+Shift+Z`). `names` translates the names of
 * keys off Apple platforms (`{ Enter: 'Entrée' }`).
 */
export function formatShortcut(
    keys: ShortcutKeys,
    { apple = isApplePlatform(), names = {} }: { apple?: boolean; names?: KeyNames } = {},
): FormattedShortcut {
    const combinations = getCombinations(keys, apple).map((combination) =>
        parse(combination, apple),
    );
    const labels = combinations.map(({ control, alt, shift, meta, key }) => {
        if (apple) {
            const symbols = `${control ? '⌃' : ''}${alt ? '⌥' : ''}${shift ? '⇧' : ''}${meta ? '⌘' : ''}`;
            return `${symbols}${APPLE_KEYS[key] ?? (key.length === 1 ? key.toUpperCase() : key)}`;
        }
        const name = names[key] ?? OTHER_KEYS[key] ?? (key.length === 1 ? key.toUpperCase() : key);
        return [
            ...(control ? ['Ctrl'] : []),
            ...(alt ? ['Alt'] : []),
            ...(shift ? ['Shift'] : []),
            ...(meta ? ['Meta'] : []),
            name,
        ].join('+');
    });
    const aria = combinations.map(({ control, alt, shift, meta, key }) =>
        [
            ...(control ? ['Control'] : []),
            ...(alt ? ['Alt'] : []),
            ...(shift ? ['Shift'] : []),
            ...(meta ? ['Meta'] : []),
            ariaKey(key),
        ].join('+'),
    );
    return { labels, keys: aria.join(' ') };
}
