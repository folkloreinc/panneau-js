import { getCSRFHeaders, getJSON, postJSON } from '@folklore/fetch';
import { generatePath } from '@folklore/routes';
import queryString from 'query-string';

class Base {
    constructor(opts = {}) {
        this.options = {
            routes: {},
            generateUrl: null,
            ...opts,
            baseUrl: opts.baseUrl,
            onUnauthorized: opts.onUnauthorized || null,
        };
    }

    requestGet(path, query = null, opts = null) {
        const finalQuery =
            query !== null ? queryString.stringify(query, { arrayFormat: 'bracket' }) : null;
        return getJSON(
            `${this.getFullUrl(path)}${
                finalQuery !== null && finalQuery.length > 0 ? `?${finalQuery}` : ''
            }`,
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
                ...opts,
            },
        ).catch((error) => this.onError(error));
    }

    requestPost(path, data, opts = null) {
        return postJSON(this.getFullUrl(path), data, {
            credentials: 'include',
            headers: getCSRFHeaders(),
            ...opts,
        }).catch((error) => this.onError(error));
    }

    requestPut(path, data, opts = null) {
        return postJSON(
            this.getFullUrl(path),
            {
                _method: 'PUT',
                ...data,
            },
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
                ...opts,
            },
        ).catch((error) => this.onError(error));
    }

    requestPatch(path, data, opts = null) {
        return postJSON(
            this.getFullUrl(path),
            {
                _method: 'PATCH',
                ...data,
            },
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
                ...opts,
            },
        ).catch((error) => this.onError(error));
    }

    requestDelete(path) {
        return this.requestPost(this.getFullUrl(path), {
            _method: 'DELETE',
        }).catch((error) => this.onError(error));
    }

    route(route, params) {
        const { routes, generateUrl = null } = this.options;
        if (generateUrl !== null) {
            return generateUrl(route, params);
        }
        return generatePath(routes[route] || route, params);
    }

    getFullUrl(path) {
        const { baseUrl = null } = this.options;
        const hasProtocol = path.indexOf('://') !== -1;
        return baseUrl !== null && !hasProtocol
            ? `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
            : path;
    }

    onError(err) {
        const { onUnauthorized } = this.options;
        const { status = null } = err || {};
        const statusCode = parseInt(status, 10);
        // If status is refused and callback exists
        if ((statusCode === 401 || statusCode === 419) && onUnauthorized !== null) {
            return onUnauthorized();
        }
        throw err;
    }
}

export default Base;
