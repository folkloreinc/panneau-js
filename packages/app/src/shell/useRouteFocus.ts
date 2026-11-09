import { type RefObject, useEffect, useRef } from 'react';

import { type AppRoute, routePath } from '../routes';

/** Whether two routes are the same list, with or without the panel of an item. */
function isSameList(a: AppRoute, b: AppRoute): boolean {
    return (
        (a.name === 'resource.index' || a.name === 'resource.show') &&
        (b.name === 'resource.index' || b.name === 'resource.show') &&
        a.resource === b.resource
    );
}

/**
 * Where focus goes when the route changes, so that screen readers announce the new page: its
 * title, or the page itself without one. Closing the panel of an item goes back to the item's
 * link in the list; opening it is left to the panel.
 */
function focusPage(main: HTMLElement, previous: AppRoute, route: AppRoute, basePath: string) {
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
        return;
    }
    main.scrollTop = 0;
    window.scrollTo({ top: 0 });
    const heading = main.querySelector<HTMLElement>('h1');
    if (heading !== null && !heading.hasAttribute('tabindex')) {
        heading.tabIndex = -1;
    }
    (heading ?? main).focus({ preventScroll: true });
}

/**
 * Moves focus to the title of the new page when the route changes, and scrolls the page to the
 * top, in the main element of a layout of the app. The first page keeps the focus where the
 * browser put it.
 */
export function useRouteFocus(
    main: RefObject<HTMLElement | null>,
    route: AppRoute,
    basePath: string,
): void {
    const previousRoute = useRef<AppRoute | null>(null);
    const routeKey = JSON.stringify(route);
    useEffect(() => {
        const next = JSON.parse(routeKey) as AppRoute;
        const previous = previousRoute.current;
        previousRoute.current = next;
        if (previous === null || main.current === null) {
            return undefined;
        }
        const element = main.current;
        // After the page renders, and after a dialog that navigated gave focus back
        const frame = window.requestAnimationFrame(() =>
            focusPage(element, previous, next, basePath),
        );
        return () => window.cancelAnimationFrame(frame);
    }, [main, routeKey, basePath]);
}
