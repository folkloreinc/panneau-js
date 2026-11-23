import { type RefObject, useEffect, useRef } from 'react';

import { type ScrollPosition, getRestoredScroll, setScrollContainer } from '../location';
import { type AppRoute, routePath } from '../routes';

/** Whether two routes are the same list, with or without the panel of an item. */
function isSameList(a: AppRoute, b: AppRoute): boolean {
    return (
        (a.name === 'resource.index' || a.name === 'resource.show') &&
        (b.name === 'resource.index' || b.name === 'resource.show') &&
        a.resource === b.resource
    );
}

/** How many frames a page has to grow tall enough for the scroll it is restored to. */
const RESTORE_FRAMES = 30;

/**
 * Scrolls the page back to where it was left, frame after frame while its content is shorter
 * than that, as a list whose items come back from the cache or the backend. Returns a function
 * that stops.
 */
function restoreScroll(main: HTMLElement, position: ScrollPosition): () => void {
    let frame = 0;
    let remaining = RESTORE_FRAMES;
    const step = () => {
        main.scrollTop = position.container;
        window.scrollTo({ top: position.window });
        remaining -= 1;
        const reached =
            Math.abs(main.scrollTop - position.container) < 1 &&
            Math.abs(window.scrollY - position.window) < 1;
        if (!reached && remaining > 0) {
            frame = window.requestAnimationFrame(step);
        }
    };
    step();
    return () => window.cancelAnimationFrame(frame);
}

/**
 * Where focus goes when the route changes, so that screen readers announce the new page: its
 * title, or the page itself without one. Closing the panel of an item goes back to the item's
 * link in the list; opening it is left to the panel. A new page starts at the top; one the browser
 * goes back or forward to gets its scroll back (decision 0102). Returns a function that stops
 * restoring it.
 */
function focusPage(
    main: HTMLElement,
    previous: AppRoute,
    route: AppRoute,
    basePath: string,
): (() => void) | undefined {
    if (isSameList(previous, route)) {
        if (previous.name === 'resource.show' && route.name === 'resource.index') {
            const href = routePath(previous, basePath);
            const link = [...main.querySelectorAll<HTMLAnchorElement>('a[href]')].find(
                (candidate) => {
                    const value = candidate.getAttribute('href') ?? '';
                    return value === href || value.startsWith(`${href}?`);
                },
            );
            link?.focus();
        }
        return undefined;
    }
    const heading = main.querySelector<HTMLElement>('h1');
    if (heading !== null && !heading.hasAttribute('tabindex')) {
        heading.tabIndex = -1;
    }
    (heading ?? main).focus({ preventScroll: true });
    const restored = getRestoredScroll();
    if (restored !== null) {
        return restoreScroll(main, restored);
    }
    main.scrollTop = 0;
    window.scrollTo({ top: 0 });
    return undefined;
}

/**
 * Moves focus to the title of the new page when the route changes, and scrolls the page to the
 * top, or back to where it was left when the browser goes back or forward, in the main element of
 * a layout of the app. The first page keeps the focus where the
 * browser put it.
 */
export function useRouteFocus(
    main: RefObject<HTMLElement | null>,
    route: AppRoute,
    basePath: string,
): void {
    const previousRoute = useRef<AppRoute | null>(null);
    const routeKey = JSON.stringify(route);
    // The history keeps the scroll of this element with each entry
    useEffect(() => setScrollContainer(main.current), [main]);
    useEffect(() => {
        const next = JSON.parse(routeKey) as AppRoute;
        const previous = previousRoute.current;
        previousRoute.current = next;
        if (previous === null || main.current === null) {
            return undefined;
        }
        const element = main.current;
        // After the page renders, and after a dialog that navigated gave focus back
        let stop: (() => void) | undefined;
        const frame = window.requestAnimationFrame(() => {
            stop = focusPage(element, previous, next, basePath);
        });
        return () => {
            window.cancelAnimationFrame(frame);
            stop?.();
        };
    }, [main, routeKey, basePath]);
}
