# @panneau/data

The data layer of Panneau: the `DataAdapter` interface, the REST adapter of the [protocol](../../docs/protocol.md), its Laravel preset and TanStack Query hooks.

```ts
import { ConflictError, ValidationError, createRestAdapter } from '@panneau/data';

const adapter = createRestAdapter({ baseUrl: '/panneau/api' });

try {
    await adapter.update('pages', item.id, { title: { fr: 'Accueil' } }, { version: item.version });
} catch (error) {
    if (error instanceof ConflictError) {
        // Someone else saved the item: error.current is the current version.
    } else if (error instanceof ValidationError) {
        // error.errors: { 'title.en': ['This field is required.'] }
    }
}
```

| Export                  | Content                                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/data`         | The `DataAdapter` interface, `createRestAdapter()`, and the errors: `ApiError`, `ValidationError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`                   |
| `@panneau/data/laravel` | `createLaravelAdapter()`: the REST adapter with credentials, the `X-XSRF-TOKEN` header from Laravel's cookie, and `419` as unauthorized                                                      |
| `@panneau/data/query`   | `DataAdapterProvider` and the TanStack Query hooks: `useDefinition`, `useResourceList`, `useResourceItem`, `useCreateItem`, `useUpdateItem`, `useDeleteItem`, `useRunAction`, `useActionRun` |

## Adapters

A `DataAdapter` is everything the engine and the app need from a backend: the definition, resources (list, get, create, update, delete), actions and their runs, media, the auth session, search and widget data. Methods reject with an `ApiError` when the backend answers with an error.

- **`createRestAdapter({ baseUrl, fetch, headers, credentials })`** implements the HTTP API of the protocol:
    - `application/problem+json` errors become typed errors, by status: `401` `UnauthorizedError`, `403` `ForbiddenError`, `404` `NotFoundError`, `412` `ConflictError` (with `current`), `422` `ValidationError` (with `errors` keyed by dot path), others `ApiError`. Responses that are not problems get a problem built from their status;
    - `update()` sends `If-Match` from the `version` it is given;
    - list queries use `toSearchParams()` from `@panneau/protocol`;
    - values that contain a `Blob` (imports, uploads) are sent as `multipart/form-data`.
- **`createLaravelAdapter()`** is the preset for `laravel-panneau` with session authentication. Laravel specifics stay there, not in the protocol.
- **A custom adapter** implements `DataAdapter` over another API. A product that only needs a few resources can throw from the methods it doesn't support.

## Query hooks

The hooks need TanStack Query v5 and React (optional peer dependencies, only for this entry point), with a `QueryClientProvider` and a `DataAdapterProvider` above them.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DataAdapterProvider, useResourceList, useUpdateItem } from '@panneau/data/query';

<QueryClientProvider client={queryClient}>
    <DataAdapterProvider adapter={adapter}>
        <Pages />
    </DataAdapterProvider>
</QueryClientProvider>;

function Pages() {
    const { data } = useResourceList('pages', { sort: ['-published_at'], page: 1 });
    const update = useUpdateItem('pages');
    // update.mutate({ id, values, version })
}
```

- Mutations update the cache: create and update cache the item and refetch the lists of the resource; delete removes the item and refetches the lists.
- `useRunAction()` refreshes what the action result asks (`refresh`: `none`, `items` or `list`, the default). A queued action returns a run instead: `useActionRun(run.id)` follows it until it finishes, then refreshes.
- `queryKeys` and the `*QueryOptions()` functions give the keys and options of the hooks, to prefetch or invalidate their data.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
