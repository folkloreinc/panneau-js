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
            loader: loader().then(
                (response) => {
                    loaders[name].loader = null;
                    loaders[name].loaded = true;
                    loaders[name].resource = response;
                    events.emit(`loaded:${name}`, response);
                    return response;
                },
                (error) => {
                    // Remove the failed loader so a later call can retry
                    delete loaders[name];
                    throw error;
                },
            ),
            loaded: false,
            resource: null,
        };
    }

    const { loaded = false, resource = null, loader: currentLoader = null } = loaders[name];
    if (loaded === true) {
        return Promise.resolve(resource as T);
    }
    return currentLoader as Promise<T>;
}

export default loadPackage;
