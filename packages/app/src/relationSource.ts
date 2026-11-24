import type { QueryClient } from '@tanstack/react-query';

import type { DataAdapter } from '@panneau/data';
import { queryKeys } from '@panneau/data/query';
import { type RelationSource, createRelationSource } from '@panneau/fields';
import type { Definition, Item } from '@panneau/protocol';

import type { RelatedItemRequests } from './relatedItems';
import { routePath } from './routes';

/**
 * The relation source of the app, for every page that shows fields: relation fields of forms, the
 * relation filters of lists, the cards of details (#292).
 *
 * The items of their ids are those of the item queries: the source only asks for those the query
 * client doesn't have, and caches those it gets there. The cards link to the show route of their
 * items, which goes to the form of an item that opens there (decision 0067).
 *
 * With `related`, the panel over the page with the form of a resource (decision 0110): the fields
 * offer "Create …" in the resources where the user can create, and the cards "Edit" on the items
 * the user can update, and do it there. Their links then open in a new tab, which never leaves the
 * form: "Edit" is how a card changes its item without leaving it.
 */
export function createAppRelationSource(
    adapter: DataAdapter,
    definition: Definition,
    queryClient: QueryClient,
    basePath: string,
    related?: Pick<RelatedItemRequests, 'open' | 'edit'>,
): RelationSource {
    return createRelationSource(adapter, {
        definition,
        ...(related !== undefined
            ? {
                  create: true,
                  createItem: related.open,
                  editItem: related.edit,
                  linksInNewTab: true,
              }
            : {}),
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
