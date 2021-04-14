class ResourcesApi {
    constructor(api) {
        this.api = api;
    }

    resourceRoute({ id, has_routes: hasRoutes = false }, route, params) {
        const routePrefix = hasRoutes ? `resources.${id}` : 'resources';
        return this.api.route(
            `${routePrefix}.${route}`,
            hasRoutes
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

    get(resource, query = {}, page = 1, count = 10) {
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

    block(resource, id) {
        return this.api.requestPost(
            this.resourceRoute(resource, 'block', {
                id,
            }),
            null,
            {
                withCredentials: true,
            },
        );
    }

    unblock(resource, id) {
        return this.api.requestPost(
            this.resourceRoute(resource, 'unblock', {
                id,
            }),
            null,
            {
                withCredentials: true,
            },
        );
    }
}

export default ResourcesApi;
