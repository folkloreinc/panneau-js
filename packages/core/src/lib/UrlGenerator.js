import reduce from 'lodash/reduce';

class UrlGenerator {
    constructor(routes, opts) {
        this.routes = routes;
        this.options = {
            paramFormat: ':{key}(\\([^\\)]*\\))?', // eslint-disable-line
            ...opts,
        };
    }

    route(key, opts) {
        const options = {
            withHost: false,
            ...this.options,
            ...opts,
        };
        const { withHost, paramFormat, ...params } = options;
        const route = this.routes[key] || key;
        const url = reduce(
            params || {},
            (str, v, k) => str.replace(new RegExp(paramFormat.replace(/\{\s*key\s*\}/gi, k), 'i'), v),
            route,
        );

        const host = typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}`
            : '';
        const hostPattern = host !== null ? `^${host}` : '^$';
        if (typeof withHost !== 'undefined' && withHost === true) {
            return !url.match(hostPattern) ? `${host}${url}` : url;
        }

        const urlWithoutHost = url.replace(new RegExp(hostPattern, 'i'), '');
        return urlWithoutHost === '' ? '/' : urlWithoutHost;
    }
}

export default UrlGenerator;
