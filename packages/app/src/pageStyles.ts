import { useEffect } from 'react';

/**
 * The app owns the page it renders in (decision 0078): while it is mounted, the page has no
 * margin, so the browser's default `body { margin: 8px }` doesn't frame the layout, and the
 * `html` and `body` elements take the background and the color scheme of the app's root, so
 * overscroll and the area under a short page match it. The page's own values come back when the
 * app unmounts. Inline styles, set through the DOM: a strict Content Security Policy allows them.
 *
 * `key` is anything that changes the root's background (its color scheme, its theme): the
 * background is read again when it changes.
 */
export function usePageStyles(root: HTMLElement | null, key: unknown): void {
    useEffect(() => {
        if (root === null) {
            return undefined;
        }
        const { body, documentElement: html } = document;
        const previous = {
            margin: body.style.margin,
            bodyBackground: body.style.backgroundColor,
            htmlBackground: html.style.backgroundColor,
            colorScheme: html.style.colorScheme,
        };
        const apply = () => {
            const style = getComputedStyle(root);
            body.style.margin = '0';
            body.style.backgroundColor = style.backgroundColor;
            html.style.backgroundColor = style.backgroundColor;
            html.style.colorScheme = style.colorScheme;
        };
        apply();
        // `auto` follows the system: its background changes with it.
        const media = window.matchMedia?.('(prefers-color-scheme: dark)');
        media?.addEventListener('change', apply);
        return () => {
            media?.removeEventListener('change', apply);
            body.style.margin = previous.margin;
            body.style.backgroundColor = previous.bodyBackground;
            html.style.backgroundColor = previous.htmlBackground;
            html.style.colorScheme = previous.colorScheme;
        };
    }, [root, key]);
}
