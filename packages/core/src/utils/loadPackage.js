import EventEmitter from 'wolfy87-eventemitter';

/**
 * Locale loader
 */
const loaders = {};
const events = new EventEmitter();

function loadPackage(name, loader) {
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
            resolve(resource);
        } else {
            events.once(`loaded:${name}`, (response) => {
                resolve(response);
            });
        }
    });
}

export default loadPackage;
