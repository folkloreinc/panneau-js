import get from 'lodash/get';
import { getLocalizedName } from './utils';

class Resource {
    constructor(resource) {
        this.resource = resource || {};
    }

    id() {
        return this.resource.id;
    }

    type() {
        return this.resource.type || 'default';
    }

    types() {
        return this.resource.types || [];
    }

    localizedName(variant = 'default') {
        return getLocalizedName(this.resource, variant);
    }

    messages() {
        const { messages = {} } = this.resource;
        return messages;
    }

    message(key, defaultValue) {
        return get(this.messages(), key, defaultValue);
    }

    routes() {
        const { routes = {} } = this.resource;
        return routes;
    }

    hasRoutes() {
        const { routes = null } = this.resource;
        return routes !== null;
    }

    forms() {
        const { forms = {} } = this.resource;
        return forms;
    }

    form(action) {
        const forms = this.forms();
        return forms[action] || forms;
    }

    lists() {
        const { lists = {} } = this.resource;
        return lists;
    }

    list(action) {
        const lists = this.lists();
        return lists[action] || lists;
    }
}

export default Resource;
