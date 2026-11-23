import { routePath } from './routes';

// The last query string of each list of a resource, in this tab, so that going back to a list
// from one of its items shows it as the user left it: its filters, sort, page or cursor, search
// and layout (decision 0102). The remembered view of decision 0042 only keeps what lasts from
// one visit to the next; this is what the user was looking at a moment ago.

const PREFIX = 'panneau:list-search:';

// When the storage of the tab is blocked: as long as the page
const fallback = new Map<string, string>();

function storage(): Storage | null {
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

/** The key of the list of a resource, for a user of an app (the key of its remembered view). */
export function getListKey(
    basePath: string,
    userId: string | number | undefined,
    resource: string,
): string {
    return `${basePath}:${userId ?? ''}:${resource}`;
}

/** Keeps the query string of a list (`?…`, or `''`), as it shows now. */
export function rememberListSearch(key: string, search: string): void {
    try {
        const target = storage();
        if (target !== null) {
            target.setItem(`${PREFIX}${key}`, search);
            fallback.delete(key);
            return;
        }
    } catch {
        // Full or blocked: the page keeps it
    }
    fallback.set(key, search);
}

/** The last query string of a list in this tab, or `''`. */
export function getListSearch(key: string): string {
    // What the storage couldn't keep is newer than what it has
    let search = fallback.get(key) ?? null;
    if (search === null) {
        try {
            search = storage()?.getItem(`${PREFIX}${key}`) ?? null;
        } catch {
            search = null;
        }
    }
    return search?.startsWith('?') === true ? search : '';
}

/**
 * The path back to the list of a resource: its index, with the query string it last had in this
 * tab. For links that go back to a list (breadcrumbs, the header's link, after a delete), not for
 * the menus, which open the list with its remembered view.
 */
export function getListPathBack(
    basePath: string,
    userId: string | number | undefined,
    resource: string,
): string {
    return `${routePath({ name: 'resource.index', resource }, basePath)}${getListSearch(getListKey(basePath, userId, resource))}`;
}
