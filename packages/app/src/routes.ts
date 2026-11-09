import { AUTH_PAGE_PATHS } from '@panneau/protocol';

/**
 * The client routes of the app, under the base path (see docs/decisions/0019). The shell of
 * Phase 2 builds on them; they are internal until then.
 */
export type AppRoute =
    | { name: 'home' }
    | { name: 'resource.index'; resource: string }
    // `type`: the type of the new item, in a resource with types (decision 0075)
    | { name: 'resource.create'; resource: string; type?: string }
    | { name: 'resource.show'; resource: string; id: string }
    | { name: 'resource.edit'; resource: string; id: string }
    | { name: 'page'; page: string; segments?: readonly string[] }
    | { name: 'account' }
    | { name: 'not-found' };

/** An auth page of the app, which the links of the backend's emails open (decision 0048). */
export type AuthPage = keyof typeof AUTH_PAGE_PATHS;

/**
 * The auth page of a path, under the base path and outside the context: `{basePath}/auth/…`.
 * `null` for every other path.
 */
export function matchAuthPage(pathname: string, basePath: string): AuthPage | null {
    const base = normalizeBasePath(basePath);
    const rest = pathname.startsWith(`${base}/`)
        ? pathname.slice(base.length + 1).replace(/\/+$/, '')
        : null;
    const found = (Object.keys(AUTH_PAGE_PATHS) as AuthPage[]).find(
        (page) => AUTH_PAGE_PATHS[page] === rest,
    );
    return found ?? null;
}

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
    if (first === 'account') {
        return resource === undefined ? { name: 'account' } : { name: 'not-found' };
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
    if (third === 'create') {
        return fourth === undefined
            ? { name: 'resource.create', resource }
            : { name: 'resource.create', resource, type: fourth };
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
        case 'account':
            return path('account');
        case 'resource.index':
            return path('resources', route.resource);
        case 'resource.create':
            return route.type !== undefined
                ? path('resources', route.resource, 'create', route.type)
                : `${path('resources', route.resource)}/create`;
        case 'resource.show':
            return path('resources', route.resource, route.id);
        case 'resource.edit':
            return `${path('resources', route.resource, route.id)}/edit`;
    }
}

/**
 * The prefix of the routes for the values of the context, in the order of `names`:
 * `/client/4/contest/12`, or `` without values (decision 0045).
 */
export function contextPath(values: Readonly<Record<string, string>>, names: readonly string[]) {
    return names
        .filter((name) => values[name] !== undefined && values[name] !== '')
        .map((name) => `/${encodeURIComponent(name)}/${encodeURIComponent(values[name] ?? '')}`)
        .join('');
}

/**
 * The values of the context in a path, from the segments right after the base path: each name of
 * `names` followed by its value. `basePath` is the base path with them, under which the routes
 * of the app are.
 */
export function matchContext(
    pathname: string,
    basePath: string,
    names: readonly string[],
): { values: Record<string, string>; basePath: string } {
    const base = normalizeBasePath(basePath);
    const values: Record<string, string> = {};
    if (names.length === 0 || (pathname !== base && !pathname.startsWith(`${base}/`))) {
        return { values, basePath: base };
    }
    const segments = pathname.slice(base.length).split('/').slice(1);
    let consumed = 0;
    for (;;) {
        const name = decode(segments[consumed] ?? '');
        const value = decode(segments[consumed + 1] ?? '');
        if (
            name === null ||
            !names.includes(name) ||
            name in values ||
            value === null ||
            value === ''
        ) {
            break;
        }
        values[name] = value;
        consumed += 2;
    }
    return {
        values,
        basePath: consumed > 0 ? `${base}/${segments.slice(0, consumed).join('/')}` : base,
    };
}
