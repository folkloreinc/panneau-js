import type { QueryClient } from '@tanstack/react-query';

import type { DataAdapter } from '@panneau/data';
import { queryKeys } from '@panneau/data/query';
import { type RelationSource, createRelationSource } from '@panneau/fields';
import type { Definition, Item } from '@panneau/protocol';

import { routePath } from './routes';

/**
 * The relation source of the app, for every page that shows fields: relation fields of forms, the
 * relation filters of lists, the cards of details (#292).
 *
 * The items of their ids are those of the item queries: the source only asks for those the query
 * client doesn't have, and caches those it gets there. The cards link to the show route of their
 * items, which goes to the form of an item that opens there (decision 0067).
 *
 * With `createItem`, the fields offer "Create …" in the resources where the user can create, and
 * create the item there: in a panel with the form of its resource (decision 0110).
 */
export function createAppRelationSource(
    adapter: DataAdapter,
    definition: Definition,
    queryClient: QueryClient,
    basePath: string,
    createItem?: (resource: string, values: Record<string, unknown>) => Promise<Item | null>,
): RelationSource {
    return createRelationSource(adapter, {
        definition,
        ...(createItem !== undefined ? { create: true, createItem } : {}),
        items: {
            get: (resource, id) => queryClient.getQueryData<Item>(queryKeys.item(resource, id)),
            set: (resource, item) =>
                queryClient.setQueryData(queryKeys.item(resource, item.id), item),
        },
        getItemHref: (resource, id) =>
            definition.resources.some((candidate) => candidate.id === resource)
                ? routePath({ name: 'resource.show', resource, id }, basePath)
                : null,
    });
}
