import get from 'lodash/get';
import trimEnd from 'lodash/trimEnd';
import isObject from 'lodash/isObject';
import 'whatwg-fetch';

import {
    getResponseAndDataObject,
    throwResponseError,
    throwValidationError,
    getCSRFHeaders,
} from './requests';

class ResourceApi {
    constructor(resource, urlGenerator, opts) {
        this.resource = resource;
        this.urlGenerator = urlGenerator;
        this.options = {
            idParamName: 'id',
            host: '/',
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
        return this.callApi('create', 'get');
    }

    store(data) {
        return this.callApi('store', 'post', data);
    }

    show(id) {
        return this.callApi('show', 'get', id);
    }

    edit(id) {
        return this.callApi('edit', 'get', id);
    }

    update(id, data) {
        return this.callApi('update', 'put', id, data);
    }

    destroy(id) {
        return this.callApi('destroy', 'delete', id);
    }

    callApi(action, method, id = undefined, data = undefined) {
        const path = this.getActionPath(action, id);
        const body = (isObject(id) ? id : data) || null;
        const methodUpperCase = method.toUpperCase();
        let finalMethod;
        let finalBody;
        switch (methodUpperCase) {
        case 'PUT':
        case 'PATCH':
        case 'DELETE':
            finalMethod = 'POST';
            finalBody = {
                ...body,
                _method: methodUpperCase, // Laravel magic
            };
            break;
        default:
            finalMethod = methodUpperCase;
            finalBody = body;
            break;
        }
        return fetch(path, {
            credentials: 'include',
            method: finalMethod,
            headers: {
                ...getCSRFHeaders(),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: finalBody !== null ? JSON.stringify(finalBody) : null,
        })
            .then(getResponseAndDataObject)
            .then(responseObject => throwResponseError(responseObject))
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
        const { idParamName, host } = this.options;
        const idPattern = new RegExp(`:${idParamName}([/](.*)?)?$`, 'i');
        const fullPath = trimEnd(host, '/') + path;
        return fullPath.replace(idPattern, id);
    }
}

export default ResourceApi;
