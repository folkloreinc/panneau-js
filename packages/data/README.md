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

| Export                  | Content                                                                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/data`         | The `DataAdapter` interface, `createRestAdapter()`, the errors (`ApiError`, `ValidationError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`), `createApiError()` and `readProblem()`      |
| `@panneau/data/laravel` | `createLaravelAdapter()`: the REST adapter with credentials, the `X-XSRF-TOKEN` header from Laravel's cookie, and `419` as unauthorized; `getLaravelHeaders()` and `createLaravelError()` for an app's own endpoints |
| `@panneau/data/uploads` | `createPresignedUploads()`: direct uploads to S3 with URLs that the backend signs, for Uppy 6's `@uppy/aws-s3`                                                                                                       |
| `@panneau/data/query`   | `DataAdapterProvider` and the TanStack Query hooks: `useDefinition`, `useResourceList`, `useResourceItem`, `useCreateItem`, `useUpdateItem`, `useDeleteItem`, `useRunAction`, `useActionRun`                         |

## Adapters

A `DataAdapter` is everything the engine and the app need from a backend: the definition, resources (list, get, create, update, delete), actions and their runs, media, the auth session, search and widget data. Methods reject with an `ApiError` when the backend answers with an error.

- **`createRestAdapter({ baseUrl, fetch, headers, credentials })`** implements the HTTP API of the protocol:
    - `application/problem+json` errors become typed errors, by status: `401` `UnauthorizedError`, `403` `ForbiddenError`, `404` `NotFoundError`, `412` `ConflictError` (with `current`), `422` `ValidationError` (with `errors` keyed by dot path), others `ApiError`. Responses that are not problems get a problem built from their status;
    - `update()` sends `If-Match` from the `version` it is given;
    - list queries use `toSearchParams()` from `@panneau/protocol`;
    - values that contain a `Blob` (imports, uploads) are sent as `multipart/form-data`.
- **`createLaravelAdapter()`** is the preset for `laravel-panneau` with session authentication. Laravel specifics stay there, not in the protocol.
- **A custom adapter** implements `DataAdapter` over another API. A product that only needs a few resources can throw from the methods it doesn't support.

### An app's own endpoints

An app that uses Panneau usually has its own JSON endpoints too. The pieces of the adapters are exported, so that its client gets the same errors, and can pass a `ValidationError` to a Panneau form or handle `UnauthorizedError` in one place:

```ts
import { readProblem } from '@panneau/data';
import { createLaravelError, getLaravelHeaders } from '@panneau/data/laravel';

const response = await fetch('/api/subscriptions', {
    method: 'POST',
    credentials: 'include',
    headers: getLaravelHeaders({ headers: { 'Content-Type': 'application/json' } }),
    body: JSON.stringify(values),
});
if (!response.ok) {
    throw createLaravelError(await readProblem(response));
}
```

- `readProblem(response)` reads an `application/problem+json` body, or builds a problem from Laravel's `{ message, errors }` body or from the status. It reads a clone, so the response stays readable.
- `createApiError(problem)` maps a problem to its typed error by status; `createLaravelError(problem)` also treats `419` (an expired CSRF token or session) as `UnauthorizedError`.
- `getLaravelHeaders({ headers, xsrfCookie, xsrfHeader, cookies })` adds `X-Requested-With` and the CSRF token from Laravel's cookie.

### Direct uploads

Large files (videos of several gigabytes) go from the browser to S3-compatible storage, in parts, with URLs that the backend signs: the `presigned` mode of the protocol ([0025](../../docs/decisions/0025-presigned-uploads.md)). `createPresignedUploads()` gives Uppy 6 its `signRequest`, and completes each upload, so that the backend ingests the file:

```ts
import AwsS3 from '@uppy/aws-s3';
import Uppy from '@uppy/core';

import { createLaravelError, getLaravelHeaders } from '@panneau/data/laravel';
import { createPresignedUploads } from '@panneau/data/uploads';

const uploads = createPresignedUploads({
    endpoint: definition.uploads.endpoint, // the mediatheque's routes: '/media-library/uploads'
    headers: () => getLaravelHeaders(),
    createError: createLaravelError,
});
const uppy = new Uppy().use(AwsS3, { signRequest: uploads.signRequest });
uppy.on('upload-success', async (file, response) => {
    const media = await uploads.complete(response.body.key); // media.status: 'processing'
});
```

It is plain `fetch` and doesn't import Uppy. Small files can still use `uploadMedia()`.

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
