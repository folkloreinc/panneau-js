/**
 * The keys that save a form, wherever the focus is on the page: ⌘ S and ⌘ Enter on Apple
 * platforms, Ctrl S and Ctrl Enter elsewhere.
 *
 * Each `FormView` adds its `<form>` while it is shown, and one listener on the document sends the
 * shortcut to one of them:
 *
 * - the form that holds the focus;
 * - otherwise, the last form shown in the same dialog as the focus, or outside of every dialog when
 *   the focus is: the parameters of an action take the shortcut while their dialog is open, not
 *   the page under it, and the dialog a field opens (a media picker) saves nothing.
 *
 * ⌘ S never opens the browser's "Save page" while a form is shown, even when no form takes it.
 *
 * This is the smallest registry that works for forms. A registry of the app's shortcuts would
 * replace it: it would know the other shortcuts of the page, show them in one place, and decide
 * between forms and other owners (a list's selection, an editor) with the same rule of scopes.
 */
import { isApplePlatform } from '@panneau/ui';

const DIALOG = '[role="dialog"], [role="alertdialog"]';

/** The forms shown, in the order they were shown. */
const forms = new Set<HTMLFormElement>();

/** Which save shortcut a key press is, if any. */
function getSaveKey(event: KeyboardEvent): 's' | 'enter' | null {
    if (
        !(isApplePlatform() ? event.metaKey : event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.isComposing
    ) {
        return null;
    }
    if (event.key === 'Enter') {
        return 'enter';
    }
    return event.key.toLowerCase() === 's' ? 's' : null;
}

/** The dialog an element is in, or `null` outside of every dialog. */
function getScope(element: Element | null): Element | null {
    return element?.closest(DIALOG) ?? null;
}

function onKeyDown(event: KeyboardEvent): void {
    // Not `defaultPrevented`: rich text editors prevent the default of every Enter
    const key = getSaveKey(event);
    if (key === null) {
        return;
    }
    const target = event.target instanceof Element ? event.target : null;
    const scope = getScope(target);
    const shown = [...forms].filter(
        (form) => form.isConnected && form.closest('[inert]') === null && getScope(form) === scope,
    );
    const owner =
        shown.find((form) => target !== null && form.contains(target)) ?? shown.at(-1) ?? null;
    if (owner === null) {
        // The browser's "Save page" never opens over a form
        if (key === 's') {
            event.preventDefault();
        }
        return;
    }
    event.preventDefault();
    if (!event.repeat) {
        owner.requestSubmit();
    }
}

/**
 * Lets a form take the save shortcuts while it is shown (see above). Returns a function that
 * removes it.
 */
export function addSaveShortcut(form: HTMLFormElement): () => void {
    if (forms.size === 0) {
        document.addEventListener('keydown', onKeyDown);
    }
    forms.add(form);
    return () => {
        forms.delete(form);
        if (forms.size === 0) {
            document.removeEventListener('keydown', onKeyDown);
        }
    };
}
