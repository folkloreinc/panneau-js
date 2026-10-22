# @panneau/data

## 5.0.0-alpha.4

### Minor Changes

- b9852a0: Media libraries are resources (decision 0026). A resource of kind `media` (`Resource.kind`) has a `file` field and gives each item a read-only `media` (`MediaInfo`: type, mime, size, URLs, renditions, dimensions, duration, status). Every media operation is a resource operation: `POST /resources/{library}` with `{ file: { upload } }` makes a media, and the `/media` endpoints are removed, with the `Media`, `MediaResponse` and `MediaListResponse` schemas and the media methods of `DataAdapter` (`listMedia`, `getMedia`, `uploadMedia`, `updateMedia`, `deleteMedia`). A `media` field references media of a library (its `resource`, optional with a single library): its value is a `MediaReference` (`{ id, label, media, transform }`), and requests send ids or `{ id, transform }`. `lintDefinition()` checks both. The mock backend serves libraries. `MediaField` takes a `resource` and makes media with `create()` and reads them with `get()`; `isMedia()` and `toMedia()` become `toMediaReference()` and `toMediaReferences()`, with `getLibrary()`.
- db1f253: Direct uploads to storage, separate from media (decision 0025). The protocol specifies the `presigned` upload mode: `POST /uploads/sign` signs each request of Uppy 6's S3 client, and `POST /uploads/{upload}/complete` gives an upload (`Upload`), which values reference as `{ "upload": "upl_…" }` (`UploadReference`): a file field, an import, or `POST /media` in JSON to make it a media. `POST /media` in `multipart/form-data` keeps working. A new `file` field type holds files that belong to an item: items give a stored file (`StoredFile`: `name`, `url`, `mime`, `size`), and requests send `{ upload }` to replace it, the stored file to keep it, or `null` to remove it. Media have an optional `status` (`pending`, `processing`, `ready`, `failed`). The mock backend answers the upload routes and stores the uploads that `file` values reference, and the conformance kit checks them (`uploads.sign`). `@panneau/data/uploads` adds `createPresignedUploads()`, without importing Uppy, and `uploadMedia()` takes `{ upload }` as well as a file.
- 3974fb5: `DataAdapter.presignedUploads({ endpoint })` (optional) gives the direct uploads of an adapter: the REST adapter makes them with `createPresignedUploads()`, with its base URL, headers, credentials and errors. The main entry point exports the types of direct uploads (`PresignedUploads`, `PresignedResponse`, `PresignableRequest`). `useOptionalDataAdapter()` of `@panneau/data/query` gives the adapter of `DataAdapterProvider`, or `null` without one.

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
  - @panneau/protocol@5.0.0-alpha.4

## 5.0.0-alpha.3

### Minor Changes

- 3c68628: The pieces of the adapters are exported for an app's own endpoints: `readProblem()` reads the problem of a failed response (`application/problem+json`, Laravel's `{ message, errors }`, or the status), and `@panneau/data/laravel` adds `getLaravelHeaders()` (`X-Requested-With` and the CSRF token from Laravel's cookie) and `createLaravelError()` (`419` as `UnauthorizedError`). The Laravel adapter uses them.

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
  - @panneau/protocol@5.0.0-alpha.3

## 5.0.0-alpha.2

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 3e4f251: Add `@panneau/data`: the `DataAdapter` interface, `createRestAdapter()` with typed errors (`ValidationError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`), `If-Match` from item versions and protocol list queries, the Laravel preset (`@panneau/data/laravel`), and TanStack Query hooks with cache invalidation (`@panneau/data/query`).

### Patch Changes

- de03e3d: Add an example test of a full flow with `@panneau/core`: load the definition, list, edit with validation errors, save and get a version conflict.
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/protocol@5.0.0-alpha.1
