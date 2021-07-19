import { postJSON, getJSON, getCSRFHeaders } from '@folklore/fetch';
import { generatePath } from 'react-router';
import { stringify as stringifyQuery } from 'query-string';


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

    requestGet(path, query = null) {
        const queryString =
            query !== null ? stringifyQuery(query, { arrayFormat: 'bracket' }) : null;
        return getJSON(
            `${this.getFullUrl(path)}${
                queryString !== null && queryString.length > 0 ? `?${queryString}` : ''
            }`,
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
            },
        ).catch((error) => {
            return this.onError(error);
        });
    }

    requestPost(path, data) {
        return postJSON(this.getFullUrl(path), data, {
            credentials: 'include',
            headers: getCSRFHeaders(),
        }).catch((error) => {
            return this.onError(error);
        });
    }

    requestPut(path, data) {
        return postJSON(
            this.getFullUrl(path),
            {
                _method: 'PUT',
                ...data,
            },
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
            },
        ).catch((error) => {
            return this.onError(error);
        });
    }

    requestPatch(path, data) {
        return postJSON(
            this.getFullUrl(path),
            {
                _method: 'PATCH',
                ...data,
            },
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
            },
        ).catch((error) => {
            return this.onError(error);
        });
    }

    requestDelete(path) {
        return this.requestPost(path, {
            _method: 'DELETE',
        }).catch((error) => {
            return this.onError(error);
        });
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
        return baseUrl !== null ? `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : path;
    }

    onError(err) {
        const { onUnauthorized } = this.options;
        const { status = null } = err || {};
        const statusCode = parseInt(status, 10);
        // If status is refused and callback exists
        if ((statusCode === 401 || statusCode === 419) && onUnauthorized !== null){
            return onUnauthorized();
        }
        throw err;
    }
}

export default Base;
