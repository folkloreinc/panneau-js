import { type RefObject, useLayoutEffect, useState } from 'react';

/** The width under which a list is narrow (a phone): that of its `@container` rules. */
const NARROW_REM = 40;

function isNarrow(element: HTMLElement): boolean {
    const rem = Number.parseFloat(getComputedStyle(element.ownerDocument.documentElement).fontSize);
    const width = element.getBoundingClientRect().width;
    // Not laid out (jsdom, a hidden list): wide.
    return width > 0 && width <= NARROW_REM * (Number.isFinite(rem) && rem > 0 ? rem : 16);
}

/**
 * Whether a list is as narrow as a phone, as its `@container panneau-list (max-width: 40rem)`
 * rules say: what it renders changes (the toolbar's menu, the layout of a narrow table), not only
 * its styles. `ref` is the list, rendered from the start. Measured before the first paint, then whenever its width changes.
 */
export function useNarrow(ref: RefObject<HTMLElement | null>): boolean {
    const [narrow, setNarrow] = useState(false);
    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) {
            return undefined;
        }
        setNarrow(isNarrow(element));
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const observer = new ResizeObserver(() => setNarrow(isNarrow(element)));
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);
    return narrow;
}
