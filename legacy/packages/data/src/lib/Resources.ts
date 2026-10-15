import { Pagination, Resource, ResourceItem } from '@panneau/core';

import Base from './Base';

export type ItemsResponse<T> =
    | {
          data: T[];
          pagination: Pagination;
          meta?: Pagination;
      }
    | T[];

class ResourcesApi extends Base {
    constructor(opts) {
        super({
            ...opts,
            routes: {
                'resources.index': '/:resource',
                'resources.show': '/:resource/:id',
                'resources.store': '/:resource',
                'resources.update': '/:resource/:id',
                'resources.destroy': '/:resource/:id',
                'resources.clone': '/:resource/:id/clone',
                'resources.restore': '/:resource/:id/restore',
                ...(opts?.routes || null),
            },
        });
    }

    find<T = ResourceItem>(
        resource: Resource,
        id: string,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestGet<T>(
            this.resourceRoute(resource, 'show', {
                id,
            }),
            null,
            opts,
        );
    }

    get<T = ResourceItem, TResponse = ItemsResponse<T>>(
        resource: Resource,
        query: Record<string, unknown>,
        page: number = 1,
        count: number = 12,
        opts: Record<string, unknown> | null = null,
    ) {
        const finalQuery = {
            ...query,
        };
        if (page !== null) {
            finalQuery.page = page;
        }
        if (count !== null) {
            finalQuery.count = count;
        }
        return this.requestGet<TResponse>(this.resourceRoute(resource, 'index'), finalQuery, opts);
    }

    store<T = ResourceItem>(
        resource: Resource,
        data: Record<string, unknown>,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestPost<T>(this.resourceRoute(resource, 'store'), data, opts);
    }

    update<T = ResourceItem>(
        resource: Resource,
        id: string,
        data: Record<string, unknown>,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestPatch<T>(
            this.resourceRoute(resource, 'update', {
                id,
            }),
            data,
            opts,
        );
    }

    destroy<T = unknown>(
        resource: Resource,
        id: string,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestDelete<T>(
            this.resourceRoute(resource, 'destroy', {
                id,
            }),
            opts,
        );
    }

    clone<T = ResourceItem>(
        resource: Resource,
        id: string,
        data: Record<string, unknown> | null = null,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestPost<T>(
            this.resourceRoute(resource, 'clone', {
                id,
            }),
            data,
            opts,
        );
    }

    restore<T = ResourceItem>(
        resource: Resource,
        id: string,
        data: Record<string, unknown> | null = null,
        opts: Record<string, unknown> | null = null,
    ) {
        return this.requestPost<T>(
            this.resourceRoute(resource, 'restore', {
                id,
            }),
            data,
            opts,
        );
    }

    resourceRoute(
        { id }: Resource,
        route: string,
        params: Record<string, unknown> | null = null,
    ): string | null {
        return (
            this.route(`resources.${id}.${route}`, params) ??
            this.route(`resources.${route}`, {
                resource: id,
                ...params,
            })
        );
    }
}

export default ResourcesApi;
