/**
 * The client routes of the app, under the base path (see docs/decisions/0019). The shell of
 * Phase 2 builds on them; they are internal until then.
 */
export type AppRoute =
    | { name: 'home' }
    | { name: 'resource.index'; resource: string }
    | { name: 'resource.create'; resource: string }
    | { name: 'resource.show'; resource: string; id: string }
    | { name: 'resource.edit'; resource: string; id: string }
    | { name: 'page'; page: string; segments?: readonly string[] }
    | { name: 'not-found' };

/** The base path without its trailing slash: `/panneau/` is `/panneau`, and `/` is ``. */
export function normalizeBasePath(basePath: string): string {
    return basePath.replace(/\/+$/, '');
}

function decode(segment: string): string | null {
    try {
        return decodeURIComponent(segment);
    } catch {
        return null;
    }
}

/**
 * The route of a path, or `null` when the path is outside the base path. Paths under the base
 * path that match no route are `not-found`.
 */
export function matchRoute(pathname: string, basePath: string): AppRoute | null {
    const base = normalizeBasePath(basePath);
    if (pathname !== base && !pathname.startsWith(`${base}/`)) {
        return null;
    }
    const rest = pathname.slice(base.length).replace(/^\/+|\/+$/g, '');
    const segments = rest === '' ? [] : rest.split('/').map(decode);
    if (segments.some((segment) => segment === null || segment === '')) {
        return { name: 'not-found' };
    }
    const [first, resource, third, fourth, ...extra] = segments as string[];
    if (first === undefined) {
        return { name: 'home' };
    }
    if (first === 'pages' && resource !== undefined) {
        // The segments after the page are its `params`, which the page checks.
        const rest = segments.slice(2) as string[];
        return rest.length > 0
            ? { name: 'page', page: resource, segments: rest }
            : { name: 'page', page: resource };
    }
    if (first !== 'resources' || resource === undefined || extra.length > 0) {
        return { name: 'not-found' };
    }
    if (third === undefined) {
        return { name: 'resource.index', resource };
    }
    if (third === 'create' && fourth === undefined) {
        return { name: 'resource.create', resource };
    }
    if (fourth === undefined) {
        return { name: 'resource.show', resource, id: third };
    }
    return fourth === 'edit'
        ? { name: 'resource.edit', resource, id: third }
        : { name: 'not-found' };
}

/** The path of a route, under the base path. */
export function routePath(
    route: Exclude<AppRoute, { name: 'not-found' }>,
    basePath: string,
): string {
    const base = normalizeBasePath(basePath);
    const path = (...segments: string[]) =>
        `${base}/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
    switch (route.name) {
        case 'home':
            return base === '' ? '/' : base;
        case 'page':
            return path('pages', route.page, ...(route.segments ?? []));
        case 'resource.index':
            return path('resources', route.resource);
        case 'resource.create':
            return `${path('resources', route.resource)}/create`;
        case 'resource.show':
            return path('resources', route.resource, route.id);
        case 'resource.edit':
            return `${path('resources', route.resource, route.id)}/edit`;
    }
}
