import { type ComponentProps, type MouseEvent, useSyncExternalStore } from 'react';

// A minimal history-mode location, for the placeholder shell. The shell of Phase 2 replaces it
// with the app's router.

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener('popstate', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('popstate', listener);
    };
}

/** The current path, updated on navigation and on back and forward. */
export function usePathname(): string {
    return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/** Navigates to a path of the app, without reloading the page. */
export function navigate(path: string) {
    window.history.pushState(null, '', path);
    listeners.forEach((listener) => listener());
}

/** A link to a path of the app. Plain clicks navigate without reloading the page. */
export function Link({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            (props.target !== undefined && props.target !== '_self')
        ) {
            return;
        }
        event.preventDefault();
        navigate(href);
    };
    return <a {...props} href={href} onClick={handleClick} />;
}
