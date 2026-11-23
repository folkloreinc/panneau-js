import type { MouseEvent } from 'react';

/**
 * What a click on a row leaves alone: the controls of the row (its checkbox, its actions, a
 * control of a display), and cells that the list renders itself, such as those edited in place.
 */
const CONTROLS = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    'label',
    'summary',
    '[contenteditable]:not([contenteditable="false"])',
    '[role="button"]',
    '[role="checkbox"]',
    '[role="switch"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="slider"]',
    '[role="textbox"]',
    '[data-row-control]',
].join(', ');

function isMac(): boolean {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
}

function startsOnControl(row: HTMLElement, target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
        return true;
    }
    const control = target.closest(CONTROLS);
    return control !== null && row.contains(control);
}

/** Text selected in the row, by dragging over it: a click that ends it doesn't open the item. */
function selectsText(row: HTMLElement): boolean {
    const selection = row.ownerDocument.getSelection();
    if (selection === null || selection.isCollapsed || selection.toString().trim() === '') {
        return false;
    }
    return (
        (selection.anchorNode !== null && row.contains(selection.anchorNode)) ||
        (selection.focusNode !== null && row.contains(selection.focusNode))
    );
}

/** The link of the item, in the element of the row marked `data-item-title`. */
function getTitleLink(row: HTMLElement): HTMLAnchorElement | null {
    return row.querySelector<HTMLAnchorElement>('[data-item-title] a[href]');
}

/**
 * Hands a click to the link of the item, with its modifiers: the link does what it would do if it
 * were clicked, so the router opens it, and ⌘-click or Ctrl-click opens it in a new tab.
 */
function followLink(
    link: HTMLAnchorElement,
    modifiers: Pick<MouseEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>,
) {
    link.dispatchEvent(
        new window.MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            altKey: modifiers.altKey,
            ctrlKey: modifiers.ctrlKey,
            metaKey: modifiers.metaKey,
            shiftKey: modifiers.shiftKey,
        }),
    );
}

export interface RowClickOptions {
    /** The list selects: a click on the row toggles its item, rather than opening it. */
    selecting: boolean;
    onToggle: () => void;
}

/**
 * The handlers of a row that opens its item, as its title does, when it is clicked outside its
 * controls. They follow the title's link, which stays the only link and the only tab stop of the
 * row: the row has no role and no `tabIndex`. A middle click opens the item in a new tab. In select
 * mode, a click selects the item instead. A row without a link only selects.
 */
export function getRowClickProps({ selecting, onToggle }: RowClickOptions) {
    return {
        onClick: (event: MouseEvent<HTMLElement>) => {
            const row = event.currentTarget;
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                startsOnControl(row, event.target) ||
                selectsText(row)
            ) {
                return;
            }
            if (selecting) {
                onToggle();
                return;
            }
            const link = getTitleLink(row);
            if (link !== null) {
                followLink(link, event);
            }
        },
        onAuxClick: (event: MouseEvent<HTMLElement>) => {
            const row = event.currentTarget;
            if (
                event.defaultPrevented ||
                event.button !== 1 ||
                startsOnControl(row, event.target)
            ) {
                return;
            }
            const link = getTitleLink(row);
            if (link !== null) {
                event.preventDefault();
                // A middle click opens the link in a new tab, as the modifier of the platform does.
                followLink(link, {
                    altKey: false,
                    ctrlKey: !isMac(),
                    metaKey: isMac(),
                    shiftKey: event.shiftKey,
                });
            }
        },
    };
}
