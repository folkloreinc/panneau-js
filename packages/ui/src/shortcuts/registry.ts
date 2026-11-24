import { type ShortcutKeys, getCombinations, isSingleKey, matchesKeys } from './keys';

/** Where a shortcut applies: in an element (see `ShortcutOptions.scope`), or on the page. */
export type ShortcutScope = { readonly current: Element | null } | 'page';

/** A shortcut, as a component registers it (`useShortcut()`). */
export interface ShortcutOptions {
    /**
     * Shortcuts with the same id are one in the help: the Save of two forms. Defaults to the label
     * and the keys.
     */
    id?: string;
    /** Its keys, the same on every platform with `Mod` (`Mod+K`), or per platform. */
    keys: ShortcutKeys;
    /** What it does, in the help: "Save", "Go to…". */
    label: string;
    /** Its group in the help. Defaults to "General". */
    group?: string | undefined;
    /**
     * Who gets the keys (decision 0112), from the focus outwards:
     *
     * 1. the innermost element scope that holds the focus;
     * 2. otherwise, the last shortcut registered in the dialog that holds the focus, element scopes
     *    of that dialog included;
     * 3. otherwise, outside of every dialog, the last of the page, element scopes of the page
     *    included. Nothing of the page fires while a modal dialog is open (the focus is in it, or
     *    in what it hides).
     *
     * An element (a ref, read when a key is pressed) or `page`, the default.
     */
    scope?: ShortcutScope | undefined;
    /** Defaults to `true`. A disabled shortcut is neither matched nor listed. */
    enabled?: boolean | undefined;
    /**
     * Whether it fires while the focus is in a text field, a select or an editor. Defaults to
     * `true` with a modifier (⌘S), and is always `false` for single keys (`?`, `j`).
     */
    inInputs?: boolean | undefined;
    /**
     * Whether it fires when what holds the focus already handled the key (prevented its default).
     * Defaults to `false`: an editor's own ⌘K for links wins over the "Go to…" palette. The save
     * shortcuts of forms set it: rich text editors prevent the default of every Enter, and ⌘ Enter
     * saves from any field.
     */
    whenHandled?: boolean | undefined;
    /** Called with the key press, whose default is prevented. Not called when the key repeats. */
    perform: (event: KeyboardEvent) => void;
}

/** A shortcut of the registry. */
export interface RegisteredShortcut extends Readonly<Omit<ShortcutOptions, 'perform'>> {
    /** What it does, with the key press. */
    readonly perform: (event: KeyboardEvent) => void;
}

/**
 * The shortcuts registered on a page, and the one listener that sends them key presses. A
 * `PanneauRoot` makes it.
 */
export interface ShortcutRegistry {
    /** Adds a shortcut, last of all. Returns a function that removes it. */
    register: (shortcut: RegisteredShortcut) => () => void;
    /** The enabled shortcuts, in the order they were added. */
    getShortcuts: () => readonly RegisteredShortcut[];
    /** Calls `listener` when shortcuts are added or removed. */
    subscribe: (listener: () => void) => () => void;
    /** Whether single-key shortcuts fire (WCAG 2.1.4): the user's preference. */
    getSingleKeys: () => boolean;
    setSingleKeys: (enabled: boolean) => void;
    /** Sends a key press to its shortcut, as the listener does. Returns whether one took it. */
    handleKeyDown: (event: KeyboardEvent) => boolean;
    /** Listens to the key presses of a document. Returns a function that stops. */
    listen: (target: Document) => () => void;
}

const DIALOG = '[role="dialog"], [role="alertdialog"]';
/** What a modal dialog hides of the page while it is open (React Aria's `ariaHideOutside()`). */
const HIDDEN = '[inert], [aria-hidden="true"]';
const TEXT_INPUT =
    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';
const NOT_TEXT = new Set([
    'button',
    'checkbox',
    'radio',
    'range',
    'color',
    'file',
    'image',
    'reset',
    'submit',
]);

/** Whether an element takes typing: a text field, a select, an editor. */
export function isTextInput(element: Element | null): boolean {
    const input = element?.closest(TEXT_INPUT);
    if (input === null || input === undefined) {
        return false;
    }
    return !(input instanceof HTMLInputElement && NOT_TEXT.has(input.type));
}

/** The dialog an element is in, or `null` outside of every dialog. */
function layerOf(element: Element | null): Element | null {
    return element?.closest(DIALOG) ?? null;
}

function hasModifier(keys: ShortcutKeys): boolean {
    return getCombinations(keys).some((combination) => !isSingleKey(combination));
}

/**
 * Makes a registry of shortcuts. `singleKeys` is where the user's choice about single-key
 * shortcuts is kept.
 */
export function createShortcutRegistry({
    singleKeys: initialSingleKeys = true,
    onSingleKeysChange,
}: {
    singleKeys?: boolean;
    onSingleKeysChange?: (enabled: boolean) => void;
} = {}): ShortcutRegistry {
    let shortcuts: readonly RegisteredShortcut[] = [];
    let singleKeys = initialSingleKeys;
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((listener) => listener());

    const handleKeyDown = (event: KeyboardEvent): boolean => {
        if (event.isComposing) {
            return false;
        }
        // A key that something already handled (an editor's ⌘K) is theirs, unless a shortcut
        // says otherwise
        const handled = event.defaultPrevented;
        const target = event.target instanceof Element ? event.target : null;
        const typing = isTextInput(target);
        const matching = shortcuts.filter((shortcut) => {
            if ((handled && shortcut.whenHandled !== true) || !matchesKeys(event, shortcut.keys)) {
                return false;
            }
            const single = !hasModifier(shortcut.keys);
            if (single && (!singleKeys || typing)) {
                return false;
            }
            if (typing && shortcut.inInputs === false) {
                return false;
            }
            if (shortcut.scope !== undefined && shortcut.scope !== 'page') {
                const element = shortcut.scope.current;
                return (
                    element !== null && element.isConnected && element.closest('[inert]') === null
                );
            }
            return true;
        });
        if (matching.length === 0) {
            return false;
        }
        const layer = layerOf(target);
        // A key pressed in what a modal dialog hides: nothing of the page under it fires
        const modalOpen = layer === null && (target?.closest(HIDDEN) ?? null) !== null;
        const elementOf = (shortcut: RegisteredShortcut) =>
            shortcut.scope !== undefined && shortcut.scope !== 'page'
                ? shortcut.scope.current
                : null;
        const inLayer = modalOpen
            ? []
            : matching.filter((shortcut) => {
                  const element = elementOf(shortcut);
                  return element === null ? layer === null : layerOf(element) === layer;
              });
        // The innermost element scope that holds the focus, then the last of the layer
        const holding = inLayer.filter((shortcut) => {
            const element = elementOf(shortcut);
            return element !== null && target !== null && element.contains(target);
        });
        const innermost = holding.reduce<RegisteredShortcut | undefined>((inner, shortcut) => {
            const element = elementOf(shortcut);
            const innerElement = inner !== undefined ? elementOf(inner) : null;
            return inner === undefined ||
                (innerElement !== null && element !== null && innerElement.contains(element))
                ? shortcut
                : inner;
        }, undefined);
        const owner = innermost ?? inLayer.at(-1);
        // A key that the page uses never does what the browser does with it (its "Save page"),
        // even when the shortcut belongs to another layer
        if (owner === undefined) {
            if (matching.some((shortcut) => hasModifier(shortcut.keys))) {
                event.preventDefault();
            }
            return false;
        }
        event.preventDefault();
        if (!event.repeat) {
            owner.perform(event);
        }
        return true;
    };

    const onKeyDown = (event: Event) => {
        handleKeyDown(event as KeyboardEvent);
    };

    return {
        register: (shortcut) => {
            shortcuts = [...shortcuts, shortcut];
            notify();
            return () => {
                shortcuts = shortcuts.filter((registered) => registered !== shortcut);
                notify();
            };
        },
        getShortcuts: () => shortcuts,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSingleKeys: () => singleKeys,
        setSingleKeys: (enabled) => {
            singleKeys = enabled;
            onSingleKeysChange?.(enabled);
            notify();
        },
        handleKeyDown,
        listen: (target) => {
            target.addEventListener('keydown', onKeyDown);
            return () => target.removeEventListener('keydown', onKeyDown);
        },
    };
}
