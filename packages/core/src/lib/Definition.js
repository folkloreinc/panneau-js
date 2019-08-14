import Resource from './Resource';
import { getLocalizedName } from './utils';

class Definition {
    constructor({ resources = [], ...definition } = {}) {
        this.definition = {
            ...definition,
            resources: resources.map(it => new Resource(it)),
        };
    }

    allRoutes() {
        const { routes = {} } = this.definition;
        const resourcesRoutes = this.resources()
            .filter(it => it.hasRoutes())
            .reduce((routesMap, resource) => {
                const resourceRoutes = resource.routes();
                return {
                    ...routesMap,
                    ...Object.keys(resourceRoutes).reduce(
                        (mapRoutes, name) => ({
                            ...mapRoutes,
                            [`resource.${resource.id()}.${name}`]: resourceRoutes[name],
                        }),
                        {},
                    ),
                };
            }, {});
        return {
            ...routes,
            ...resourcesRoutes,
        };
    }

    localizedName(variant = 'default') {
        return getLocalizedName(this.definition, variant);
    }

    apiEndpoint() {
        const { api: { endpoint = null } = {} } = this.definition;
        return endpoint;
    }

    apiUploadEndpoint() {
        const { api: { uploadEndpoint = null } = {} } = this.definition;
        return uploadEndpoint;
    }

    layout() {
        const { layout = {} } = this.definition;
        return layout;
    }

    locales() {
        const { localization: { locales = ['en'] } = {} } = this.definition;
        return locales;
    }

    resources() {
        const { resources = [] } = this.definition;
        return resources;
    }

    resource(id) {
        return this.resources().find(it => it.id() === id) || null;
    }

    fields() {
        const { fields = [] } = this.definition;
        return fields;
    }

    field(id) {
        return this.fields().find(it => it.id === id) || null;
    }

    blocks() {
        const { blocks = [] } = this.definition;
        return blocks;
    }

    block(id) {
        return this.blocks().find(it => it.id === id) || null;
    }
}

export default Definition;
