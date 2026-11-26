import {
    type FocusEvent,
    type MouseEvent,
    type RefObject,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import type { List } from '@panneau/core';
import { prefersReducedMotion, usePanneauIntl, useShortcut } from '@panneau/ui';

import { messages } from './messages';

const ROW = '[data-item-id]';

/** The rows that can take the focus: those of items that aren't leaving the list. */
function getRows(content: HTMLElement | null): HTMLElement[] {
    return [...(content?.querySelectorAll<HTMLElement>(`${ROW}:not([data-leaving])`) ?? [])];
}

/** The ids of the rows from one row to another, both included, in the order of the list. */
function getRange(rows: readonly HTMLElement[], from: string, to: string): string[] {
    const ids = rows.map((row) => row.dataset.itemId ?? '');
    const start = ids.indexOf(from);
    const end = ids.indexOf(to);
    if (start === -1 || end === -1) {
        return [to];
    }
    return ids.slice(Math.min(start, end), Math.max(start, end) + 1);
}

/**
 * The keyboard of a list (decision 0112): `j`/`k` and the arrows move the focus between its rows,
 * Enter opens the focused item, `x` selects it, Shift with a move or a click on a checkbox
 * extends the selection, `/` goes to the search, Esc clears the selection or leaves the row.
 *
 * The focus moves from row to row (a roving `tabIndex`): the row last focused is the list's stop
 * in the tab order, the other rows are out of it. The keys that the page also uses (the arrows,
 * Enter, `x`, Esc) are only shortcuts while a row itself holds the focus, so a button or a field
 * of a row keeps them.
 */
export function useListKeyboard({
    list,
    content,
    toolbar,
    enabled,
    search,
    selectable,
    hasSelection,
}: {
    list: List;
    /** The element that holds the rows (`data-item-id`). */
    content: RefObject<HTMLElement | null>;
    /** The toolbar, with the search field. */
    toolbar: RefObject<HTMLElement | null>;
    /** Whether the rows are navigated: the table and the cards, once their items are shown. */
    enabled: boolean;
    search: boolean;
    selectable: boolean;
    hasSelection: boolean;
}) {
    const intl = usePanneauIntl();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);
    // Where a range of the selection starts: the last row selected by a key or a click
    const anchor = useRef<string | null>(null);
    // The row that holds the focus: the scope of the keys that a row takes from the page
    const focusedRow = useRef<HTMLElement | null>(null);

    // The row last focused is the only one in the tab order. Until the keyboard goes to a row,
    // rows aren't focusable: a click in one doesn't take the focus.
    useLayoutEffect(() => {
        getRows(content.current).forEach((row) => {
            if (!enabled || activeId === null) {
                row.removeAttribute('tabindex');
            } else {
                row.tabIndex = row.dataset.itemId === activeId ? 0 : -1;
            }
        });
    });

    const focusRow = (row: HTMLElement | undefined) => {
        if (row === undefined) {
            return;
        }
        row.tabIndex = 0;
        row.focus({ preventScroll: true });
        row.scrollIntoView?.({
            block: 'nearest',
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    };

    const move = (step: 1 | -1, extend = false) => {
        const rows = getRows(content.current);
        const index = rows.findIndex((row) => row.dataset.itemId === activeId);
        const current = rows[index];
        const next =
            index === -1 || !focused
                ? (current ?? rows[step === 1 ? 0 : rows.length - 1])
                : rows[Math.min(Math.max(index + step, 0), rows.length - 1)];
        focusRow(next);
        const from = current?.dataset.itemId;
        const to = next?.dataset.itemId;
        if (extend && selectable && from !== undefined && to !== undefined) {
            if (anchor.current === null) {
                anchor.current = from;
            }
            list.select(getRange(rows, anchor.current, to));
        }
    };

    const group = intl.formatMessage(messages.shortcutsGroup);
    const rowKeys = (key: string, arrow: string) => (focused ? [key, arrow] : key);
    useShortcut({
        id: 'panneau.lists.next',
        keys: rowKeys('j', 'ArrowDown'),
        label: intl.formatMessage(messages.nextItem),
        group,
        enabled,
        perform: () => move(1),
    });
    useShortcut({
        id: 'panneau.lists.previous',
        keys: rowKeys('k', 'ArrowUp'),
        label: intl.formatMessage(messages.previousItem),
        group,
        enabled,
        perform: () => move(-1),
    });
    useShortcut({
        id: 'panneau.lists.selectNext',
        keys: rowKeys('Shift+J', 'Shift+ArrowDown'),
        label: intl.formatMessage(messages.selectNext),
        group,
        enabled: enabled && selectable,
        perform: () => move(1, true),
    });
    useShortcut({
        id: 'panneau.lists.selectPrevious',
        keys: rowKeys('Shift+K', 'Shift+ArrowUp'),
        label: intl.formatMessage(messages.selectPrevious),
        group,
        enabled: enabled && selectable,
        perform: () => move(-1, true),
    });
    useShortcut({
        id: 'panneau.lists.open',
        keys: 'Enter',
        label: intl.formatMessage(messages.openItem),
        group,
        scope: focusedRow,
        enabled,
        // What a click on its title does: the panel or the form (`open` of the resource)
        perform: () =>
            focusedRow.current?.querySelector<HTMLElement>('[data-item-title] a[href]')?.click(),
    });
    useShortcut({
        id: 'panneau.lists.toggle',
        keys: 'x',
        label: intl.formatMessage(messages.toggleItem),
        group,
        scope: focusedRow,
        enabled: enabled && selectable,
        perform: () => {
            if (activeId !== null) {
                anchor.current = activeId;
                list.toggle(activeId);
            }
        },
    });
    useShortcut({
        id: 'panneau.lists.leave',
        keys: 'Escape',
        label: intl.formatMessage(messages.leaveItem),
        group,
        scope: focusedRow,
        enabled,
        perform: () => {
            anchor.current = null;
            if (hasSelection) {
                list.clearSelection();
                return;
            }
            setActiveId(null);
            content.current?.focus();
        },
    });
    useShortcut({
        id: 'panneau.lists.search',
        keys: '/',
        label: intl.formatMessage(messages.focusSearch),
        group,
        enabled: search,
        perform: () =>
            toolbar.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus(),
    });

    return {
        onFocus: (event: FocusEvent) => {
            const row = event.target.matches(ROW) ? (event.target as HTMLElement) : null;
            focusedRow.current = row;
            setFocused(row !== null);
            if (row !== null) {
                setActiveId(row.dataset.itemId ?? null);
            }
        },
        onBlur: () => {
            focusedRow.current = null;
            setFocused(false);
        },
        // Shift and a click on the checkbox of a row selects the rows from the last one selected
        onClickCapture: (event: MouseEvent) => {
            const target = event.target as Element;
            const row = target.closest<HTMLElement>(ROW);
            const id = row?.dataset.itemId;
            if (
                !selectable ||
                id === undefined ||
                target.closest('input[type="checkbox"]') === null
            ) {
                return;
            }
            if (event.shiftKey && anchor.current !== null) {
                list.select(
                    getRange(getRows(content.current), anchor.current, id).filter(
                        (other) => other !== id,
                    ),
                );
            }
            anchor.current = id;
        },
    };
}
