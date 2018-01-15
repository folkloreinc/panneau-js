import 'whatwg-fetch';

class ResourceApi {
    constructor(resource, opts) {
        this.options = {
            idParamName: 'id',
            ...opts,
        };
        this.resource = resource;
    }

    definition() {
        return this.callApi('definition', 'get');
    }

    index() {
        return this.callApi('index', 'get');
    }

    create() {
        return this.callApi('index', 'get');
    }

    store(data) {
        return this.callApi('index', 'post', data);
    }

    show() {
        return this.callApi('index', 'get');
    }

    edit() {
        return this.callApi('index', 'get');
    }

    update(data) {
        return this.callApi('index', 'put', data);
    }

    destroy() {
        return this.callApi('index', 'delete');
    }

    callApi(action, method, data = undefined) {
        const path = this.getActionPath(action);
        return fetch(path, {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    getActionPath(action) {
        const path = this.resource.getRoutes()[action];
        const { idParamName } = this.options;
        const regex = new RegExp(`:${idParamName}`, 'i');
        if (path.match(regex) !== null) {
            return path.replace(regex, this.resource.getId());
        }
        return path;
    }
}

export default ResourceApi;
