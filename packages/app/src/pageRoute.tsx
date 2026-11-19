import { createContext, use } from 'react';

import { usePanneau } from '@panneau/core';

import { type PageParent, getPageParents } from './parents';
import type { AppRoute } from './routes';

/** The route of the page the shell renders, and its base path: internal to the app. */
export const PageRouteContext = createContext<{ route: AppRoute; basePath: string } | null>(null);

/**
 * The parents of the page the shell renders, from the top (decision 0093). Empty outside the
 * shell, or without a definition.
 */
export function usePageParents(): PageParent[] {
    const context = use(PageRouteContext);
    const { definition } = usePanneau();
    if (context === null || definition === null) {
        return [];
    }
    return getPageParents(definition, context.basePath, context.route);
}
