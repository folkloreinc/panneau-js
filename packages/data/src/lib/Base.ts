import { getCSRFHeaders, getJSON, postJSON } from '@folklore/fetch';
import { generatePath } from '@folklore/routes';
import queryString from 'query-string';

interface ApiOptions {
    baseUrl?: string | null;
    routes?: Record<string, string>;
    generateUrl?: ((routeName: string, params?: Record<string, unknown>) => string | null) | null;
    onUnauthorized?: (() => void) | null;
}

class Base {
    options: ApiOptions;

    constructor(opts: ApiOptions) {
        this.options = {
            routes: {},
            generateUrl: null,
            ...opts,
        };
    }

    requestGet<T = unknown>(
        path: string,
        query: Record<string, unknown> | null = null,
        opts: Record<string, unknown> | null = null,
    ): Promise<T | null> {
        return getJSON<T>(this.getFullUrl(path, query), {
            credentials: 'include',
            headers: getCSRFHeaders(),
            ...opts,
        }).catch((error) => {
            this.onError(error);
            return null;
        });
    }

    requestPost<T = unknown>(
        path: string,
        data: Record<string, unknown> | null = null,
        opts: Record<string, unknown> | null = null,
    ): Promise<T | null> {
        return postJSON<T>(this.getFullUrl(path), data, {
            credentials: 'include',
            headers: getCSRFHeaders(),
            ...opts,
        }).catch((error) => {
            this.onError(error);
            return null;
        });
    }

    requestPut<T = unknown>(
        path: string,
        data: Record<string, unknown>,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestPost<T>(
            path,
            {
                _method: 'PUT',
                ...data,
            },
            opts,
        );
    }

    requestPatch<T = unknown>(
        path: string,
        data: Record<string, unknown>,
        opts: Record<string, unknown> | null = null,
    ): Promise<T | null> {
        return this.requestPost<T>(
            path,
            {
                _method: 'PATCH',
                ...data,
            },
            opts,
        );
    }

    requestDelete<T = unknown>(
        path: string,
        opts: Record<string, unknown> | null = null,
    ): Promise<T | null> {
        return this.requestPost<T>(
            path,
            {
                _method: 'DELETE',
            },
            opts,
        );
    }

    hasRoute(route: string) {
        const { routes } = this.options;
        return typeof routes[route] !== 'undefined';
    }

    route(route: string, params: Record<string, unknown> | null = null) {
        const { routes, generateUrl = null } = this.options;
        if (generateUrl !== null) {
            return generateUrl(route, params);
        }
        return generatePath(routes?.[route] || route, params);
    }

    getFullUrl(path: string, query: Record<string, unknown> | null = null) {
        const { baseUrl = null } = this.options;
        const hasProtocol = path.indexOf('://') !== -1;
        const url =
            baseUrl !== null && !hasProtocol
                ? `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
                : path;
        const finalQuery =
            query !== null ? queryString.stringify(query, { arrayFormat: 'bracket' }) : null;
        return `${url}${finalQuery !== null && finalQuery.length > 0 ? `${url.indexOf('?') === -1 ? '?' : '&'}${finalQuery}` : ''}`;
    }

    onError(err) {
        const { onUnauthorized } = this.options;
        const { status = null } = err || {};
        const statusCode = parseInt(status, 10);
        // If status is refused and callback exists
        if ((statusCode === 401 || statusCode === 419) && onUnauthorized !== null) {
            onUnauthorized();
        }
        throw err;
    }
}

export default Base;
