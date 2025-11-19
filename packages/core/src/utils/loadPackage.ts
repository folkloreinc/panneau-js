import EventEmitter from 'wolfy87-eventemitter';

interface LoaderState<T> {
    loader: Promise<T> | null;
    loaded: boolean;
    resource: T | null;
}

/**
 * Locale loader
 */
const loaders: Record<string, LoaderState<unknown>> = {};
const events = new EventEmitter();

function loadPackage<T = unknown>(name: string, loader: () => Promise<T>): Promise<T> {
    if (typeof loaders[name] === 'undefined') {
        loaders[name] = {
            loader: loader().then((response) => {
                loaders[name].loader = null;
                loaders[name].loaded = true;
                loaders[name].resource = response;
                events.emit(`loaded:${name}`, response);
                return response;
            }),
            loaded: false,
            resource: null,
        };
    }

    return new Promise((resolve) => {
        const { loaded = false, resource } = loaders[name] || {};
        if (loaded === true) {
            resolve(resource as T);
        } else {
            events.once(`loaded:${name}`, (response: T) => {
                resolve(response);
            });
        }
    });
}

export default loadPackage;
