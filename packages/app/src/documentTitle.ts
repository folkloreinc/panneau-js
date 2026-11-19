import { useEffect } from 'react';

import { usePanneau } from '@panneau/core';

import { usePageParents } from './pageRoute';

/**
 * Sets the title of the browser's tab: the parts of the page, most specific first, then the parents
 * of its route, nearest first (decision 0093), then the name of the app (`Ten walks for the fall ·
 * Articles · Northwind Journal`). Empty parts are left out.
 */
export function useDocumentTitle(parts: readonly (string | null | undefined)[]): void {
    const { definition } = usePanneau();
    const parents = usePageParents()
        .map((parent) => parent.label)
        .reverse();
    const title = [...parts, ...parents, definition?.name]
        .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
        .join(' · ');
    useEffect(() => {
        if (title !== '') {
            document.title = title;
        }
    }, [title]);
}

/** Sets the title of the browser's tab, as `useDocumentTitle()`. Renders nothing. */
export function DocumentTitle({ parts }: { parts: readonly (string | null | undefined)[] }) {
    useDocumentTitle(parts);
    return null;
}
