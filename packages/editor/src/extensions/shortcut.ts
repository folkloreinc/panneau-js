import { type Editor, Extension } from '@tiptap/core';

/** The keys that open the link dialog, as TipTap writes them. */
export const LINK_SHORTCUT = 'Mod-k';

interface LinkShortcutStorage {
    /** Opens the link dialog: set by the toolbar while it shows the link button. */
    open: (() => void) | null;
}

/** The storage of the extension in an editor, when it has it. */
function getStorage(editor: Editor): LinkShortcutStorage | undefined {
    return (editor.storage as unknown as Record<string, LinkShortcutStorage | undefined>)
        .linkShortcut;
}

/** Lets ⌘K open the link dialog of an editor, or stops it with `null`. */
export function setLinkShortcut(editor: Editor, open: (() => void) | null): void {
    const storage = getStorage(editor);
    if (storage !== undefined) {
        storage.open = open;
    }
}

/**
 * ⌘K (Ctrl+K elsewhere) opens the link dialog. When it does, the editor prevents the key's
 * default, so the app's "Go to…" palette leaves it alone (`useCommandShortcut()`), and so does the
 * browser. When it doesn't (no link button, or the selection can't take a link), the palette
 * opens.
 */
export const LinkShortcut = Extension.create<object, LinkShortcutStorage>({
    name: 'linkShortcut',

    addStorage() {
        return { open: null };
    },

    addKeyboardShortcuts() {
        return {
            [LINK_SHORTCUT]: () => {
                const { open } = this.storage;
                if (open === null || !this.editor.can().setLink({ href: '' })) {
                    return false;
                }
                open();
                return true;
            },
        };
    },
});
