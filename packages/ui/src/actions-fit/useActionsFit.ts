import { useLayoutEffect, useState } from 'react';

import styles from './ActionsFit.module.css';

const px = (value: string) => Number.parseFloat(value) || 0;

/** The row of the buttons: the nearest element that holds them and the title. */
function rowOf(buttons: HTMLElement): HTMLElement | null {
    let row = buttons.parentElement;
    while (row !== null && row.querySelector('[data-actions-title]') === null) {
        row = row.parentElement;
    }
    return row;
}

/**
 * The room the title of a row keeps once its buttons are in it, in pixels: negative when they
 * don't fit. Measured in the layout of the moment, buttons or menu: the buttons, at their own
 * width, take the place of the menu, so the answer is the same in both, and the row doesn't flip
 * between them.
 */
function room(row: HTMLElement, buttons: HTMLElement): number | null {
    const title = row.querySelector<HTMLElement>('[data-actions-title]');
    const box = row.getBoundingClientRect();
    // Hidden, or not laid out (jsdom): nothing to decide
    if (title === null || box.width === 0) {
        return null;
    }
    const style = getComputedStyle(row);
    const start = box.left + px(style.borderLeftWidth) + px(style.paddingLeft);
    const end = box.right - px(style.borderRightWidth) - px(style.paddingRight);
    const menu = row.querySelector<HTMLElement>('[data-actions-menu]');
    // What sticks out of the row once the title is at its minimum
    const last = (menu ?? buttons).getBoundingClientRect();
    const overflow = Math.max(0, last.right - end, start - last.left);
    const swap = menu !== null ? buttons.offsetWidth - menu.offsetWidth : 0;
    return (
        title.getBoundingClientRect().width - px(getComputedStyle(title).minWidth) - overflow - swap
    );
}

/** How the actions of a row show (`useActionsFit`). */
export interface ActionsFit {
    /** The buttons fit in the row: they show, and the menu doesn't. */
    inline: boolean;
    /** The ref of the element that holds the buttons. */
    ref: (buttons: HTMLElement | null) => void;
    /**
     * The class name of that element while the menu shows: it stays laid out, to be measured, out
     * of sight and out of reach.
     */
    className: string | undefined;
}

/**
 * Inline actions first, a menu as a fallback (decision 0114): the buttons of a row (a card, the
 * header of an item) show in it while they fit next to its title at the title's minimum width;
 * when they don't, they are one "⋯" menu. Decided from the room the row has, measured, not from a
 * width set in advance: a row shows its buttons wherever they fit, in a sidebar, a panel or on a
 * phone.
 *
 * The element that holds the buttons gets `ref`, `data-actions-inline` and `className`, and stays
 * rendered; the trigger of the menu, rendered only when `inline` is false, gets
 * `data-actions-menu`; the title gets `data-actions-title`, and its `min-width` (a length) is the
 * room it keeps. The row is the nearest element that holds the buttons and the title. Measured
 * before the first paint, then whenever the row or the buttons change size. When the buttons go
 * into the menu while one of them has the focus, the focus goes to the menu.
 */
export function useActionsFit(): ActionsFit {
    const [buttons, setButtons] = useState<HTMLElement | null>(null);
    const [inline, setInline] = useState(true);
    useLayoutEffect(() => {
        const row = buttons !== null ? rowOf(buttons) : null;
        if (buttons === null || row === null) {
            return undefined;
        }
        const measure = () => {
            const left = room(row, buttons);
            if (left !== null) {
                setInline(left >= -0.5);
            }
        };
        measure();
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(row);
        observer.observe(buttons);
        return () => observer.disconnect();
    }, [buttons]);
    useLayoutEffect(() => {
        // A button that had the focus goes into the menu: the focus goes to the menu.
        if (!inline && buttons?.contains(buttons.ownerDocument.activeElement) === true) {
            rowOf(buttons)?.querySelector<HTMLElement>('[data-actions-menu]')?.focus();
        }
    }, [inline, buttons]);
    return { inline, ref: setButtons, className: inline ? undefined : styles.measured };
}
