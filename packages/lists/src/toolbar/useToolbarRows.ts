import { type RefObject, useLayoutEffect, useState } from 'react';

function px(value: string): number {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

/**
 * The width the toolbar needs to hold everything on one line: the search at its basis, the filters
 * at their own widths, and the toolbar's controls. Every part is measured at a width that doesn't
 * depend on the layout, so the answer doesn't change with it.
 */
function neededWidth(toolbar: HTMLElement): number | null {
    const filters = [...toolbar.querySelectorAll<HTMLElement>('[data-toolbar-filter]')].filter(
        (element) => element.getBoundingClientRect().width > 0,
    );
    if (filters.length === 0) {
        return null;
    }
    const style = getComputedStyle(toolbar);
    const gap = px(style.columnGap);
    const parts: number[] = filters.map((element) => element.getBoundingClientRect().width);
    const filterGap = px(getComputedStyle(filters[0]?.parentElement ?? toolbar).columnGap);
    const search = toolbar.querySelector<HTMLElement>('[data-toolbar-search]');
    const end = toolbar.querySelector<HTMLElement>('[data-toolbar-end]');
    let width =
        parts.reduce((sum, part) => sum + part, 0) + filterGap * Math.max(0, parts.length - 1);
    if (search !== null) {
        width += px(getComputedStyle(search).flexBasis) + gap;
    }
    if (end !== null && end.getBoundingClientRect().width > 0) {
        width += end.getBoundingClientRect().width + gap;
    }
    return width;
}

/**
 * The rows of a list's toolbar (#519): one while the search, the filters and the controls fit on
 * one line, two when they don't: the search and the controls first, the filters under them. With
 * `isOff`, one row: a narrow list has its own layout (the filters behind one button), and a list
 * without a toolbar has none.
 *
 * The parts of the toolbar say what they are: `data-toolbar-search` on the search,
 * `data-toolbar-filter` on each filter and on the button of the others, `data-toolbar-end` on the
 * controls. Measured before the first paint, then whenever the toolbar or one of them changes size.
 */
export function useToolbarRows(ref: RefObject<HTMLElement | null>, isOff: boolean): 1 | 2 {
    const [rows, setRows] = useState<1 | 2>(1);
    useLayoutEffect(() => {
        const toolbar = ref.current;
        if (toolbar === null || isOff) {
            setRows(1);
            return undefined;
        }
        const measure = () => {
            const needed = neededWidth(toolbar);
            // Not laid out (jsdom): one row
            const width = toolbar.getBoundingClientRect().width;
            setRows(needed !== null && width > 0 && needed > width + 0.5 ? 2 : 1);
        };
        measure();
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        // A chip grows with its value: each part is observed, and those that come later too.
        const resizes = new ResizeObserver(measure);
        const observe = () => {
            resizes.observe(toolbar);
            toolbar
                .querySelectorAll('[data-toolbar-filter], [data-toolbar-end]')
                .forEach((element) => resizes.observe(element));
        };
        observe();
        const mutations =
            typeof MutationObserver === 'undefined'
                ? null
                : new MutationObserver(() => {
                      observe();
                      measure();
                  });
        mutations?.observe(toolbar, { childList: true, subtree: true });
        return () => {
            resizes.disconnect();
            mutations?.disconnect();
        };
    }, [ref, isOff]);
    return rows;
}
