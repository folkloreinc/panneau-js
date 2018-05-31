import get from 'lodash/get';
import trimEnd from 'lodash/trimEnd';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import queryString from 'query-string';
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

    index(params = null) {
        const query = params !== null && isObject(params) ? queryString.stringify(params) : (params || '');
        const path = `${this.getActionPath('index')}${!isEmpty(query) ? `?${query.replace(/^\?/, '')}` : ''}`;
        return this.callApi(path, 'get');
    }

    create() {
        const path = this.getActionPath('create');
        return this.callApi(path, 'get');
    }

    store(data) {
        const path = this.getActionPath('store');
        return this.callApi(path, 'post', data);
    }

    show(id) {
        const path = this.getActionPath('show', id);
        return this.callApi(path, 'get');
    }

    edit(id) {
        const path = this.getActionPath('edit', id);
        return this.callApi(path, 'get');
    }

    update(id, data) {
        const path = this.getActionPath('update', id);
        return this.callApi(path, 'put', data);
    }

    destroy(id) {
        const path = this.getActionPath('destroy', id);
        return this.callApi(path, 'delete');
    }

    // eslint-disable-next-line class-methods-use-this
    callApi(path, method, data = undefined) {
        const body = data || null;
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
