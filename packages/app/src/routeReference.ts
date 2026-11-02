import type { Definition, RouteReference } from '@panneau/protocol';

import { routePath } from './routes';

/**
 * The path of a route reference, with its parameters filled in: a named route of the definition
 * (`routes`), or else a page of the definition, with its `params` (decision 0038).
 */
export function resolveRoute(
    definition: Definition,
    basePath: string,
    { route, params = {} }: RouteReference,
) {
    const path = definition.routes?.[route];
    if (path !== undefined) {
        return path.replace(/\{(\w+)\}/g, (match, name: string) =>
            params[name] !== undefined ? encodeURIComponent(String(params[name])) : match,
        );
    }
    const page = definition.pages?.[route];
    if (page === undefined) {
        console.warn(`[panneau] The definition has no route or page "${route}".`);
        return null;
    }
    const names = page.params ?? [];
    const missing = names.filter((name) => params[name] === undefined || params[name] === null);
    if (missing.length > 0) {
        console.warn(
            `[panneau] The page "${route}" needs ${missing.map((name) => `"${name}"`).join(', ')}.`,
        );
        return null;
    }
    return routePath(
        { name: 'page', page: route, segments: names.map((name) => String(params[name])) },
        basePath,
    );
}
