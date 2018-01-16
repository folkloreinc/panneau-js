import get from 'lodash/get';
import isObject from 'lodash/isObject';
import 'whatwg-fetch';

import {
    throwResponseError,
    throwValidationError,
} from './requests';

class ResourceApi {
    constructor(resource, urlGenerator, opts) {
        this.resource = resource;
        this.urlGenerator = urlGenerator;
        this.options = {
            idParamName: 'id',
            ...opts,
        };
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

    show(id) {
        return this.callApi('index', 'get', id);
    }

    edit(id) {
        return this.callApi('index', 'get', id);
    }

    update(id, data) {
        return this.callApi('index', 'put', id, data);
    }

    destroy(id) {
        return this.callApi('index', 'delete', id);
    }

    callApi(action, method, id = undefined, data = undefined) {
        const path = this.getActionPath(action, id);
        const body = (isObject(id) ? id : data) || null;
        return fetch(path, {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: body !== null ? JSON.stringify(body) : null,
        })
            .then(response => throwResponseError(response))
            .catch(error => throwValidationError(error));
    }

    getActionPath(action, id = undefined) {
        const { urlGenerator } = this;
        const resource = get(this.resource, 'id');
        const defaultPath = urlGenerator.route(`resource.${action}`, {
            resource,
            id,
        });
        const path = get(this.resource, `routes.${action}`, defaultPath);
        const { idParamName } = this.options;
        const idPattern = new RegExp(`:${idParamName}([/](.*)?)?$`, 'i');
        return path.replace(idPattern, id);
    }
}

export default ResourceApi;
