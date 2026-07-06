class ResourcesApi {
    constructor(api) {
        this.api = api;
    }

    resourceRoute({ id, has_routes: hasRoutes = false }, route, params) {
        const hasSpecificRoute = this.hasRoute(`resources.${id}.${route}`);
        const routeName = hasSpecificRoute ? `resources.${id}.${route}` : `resources.${id}`;
        return this.api.route(
            routeName,
            hasSpecificRoute
                ? params
                : {
                      resource: id,
                      ...params,
                  },
        );
    }

    find(resource, id) {
        return this.api.requestGet(
            this.resourceRoute(resource, 'show', {
                id,
            }),
            null,
            {
                withCredentials: true,
            },
        );
    }

    get(resource, query = {}, page = 1, count = 12) {
        const finalQuery = {
            ...query,
        };
        if (page !== null) {
            finalQuery.page = page;
        }
        if (count !== null) {
            finalQuery.count = count;
        }
        return this.api.requestGet(this.resourceRoute(resource, 'index'), finalQuery, {
            withCredentials: true,
        });
    }

    store(resource, data) {
        return this.api.requestPost(this.resourceRoute(resource, 'store'), data, {
            withCredentials: true,
        });
    }

    update(resource, id, data) {
        return this.api.requestPatch(
            this.resourceRoute(resource, 'update', {
                id,
            }),
            data,
            {
                withCredentials: true,
            },
        );
    }

    destroy(resource, id) {
        return this.api.requestDelete(
            this.resourceRoute(resource, 'destroy', {
                id,
            }),
            null,
            {
                withCredentials: true,
            },
        );
    }

    clone(resource, id, data = null) {
        return this.api.requestPost(
            this.resourceRoute(resource, 'clone', {
                id,
            }),
            data,
            {
                withCredentials: true,
            },
        );
    }

    restore(resource, id, data = null) {
        return this.api.requestPost(
            this.resourceRoute(resource, 'restore', {
                id,
            }),
            data,
            {
                withCredentials: true,
            },
        );
    }
}

export default ResourcesApi;
