/** Elements that take the focus, in an item of a list. */
const FOCUSABLE =
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function focusables(element: Element): HTMLElement[] {
    return [...element.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

/**
 * Moves the focus out of an item that leaves the list (decision 0081), which is inert: to the same
 * control of the item after it (its title, its menu), or of the item before it, or else to
 * `container`, the list itself, as when the list is left empty. Items are the elements with `data-item-id`. `last` is the element
 * that had the focus in the list, for a browser that already moved it to the body. Does nothing
 * when the focus is elsewhere.
 */
export function moveFocusFromLeaving(container: HTMLElement, last: Element | null): void {
    const active = document.activeElement;
    const lost = active === null || active === document.body;
    const from = lost ? last : active;
    // The element had the focus in the list, and its item is gone: the list was left empty
    if (lost && from !== null && !from.isConnected) {
        container.focus();
        return;
    }
    const item = from?.closest('[data-item-id][data-leaving]') ?? null;
    if (from === null || item === null || !container.contains(item)) {
        return;
    }
    const items = [...container.querySelectorAll('[data-item-id]')];
    const index = items.indexOf(item);
    const staying = (candidate: Element) => !candidate.hasAttribute('data-leaving');
    const target =
        items.slice(index + 1).find(staying) ?? items.slice(0, index).reverse().find(staying);
    const position = focusables(item).indexOf(from as HTMLElement);
    const candidates = target !== undefined ? focusables(target) : [];
    const next = candidates[Math.min(Math.max(position, 0), candidates.length - 1)];
    (next ?? container).focus();
}
