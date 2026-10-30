# @panneau/data

## 5.0.0-alpha.7

### Patch Changes

- Updated dependencies [060e0de]
  - @panneau/protocol@5.0.0-alpha.7

## 5.0.0-alpha.6

### Minor Changes

- 75a6496: Two more field types ([decision 0033](../docs/decisions/0033-more-field-types.md)):
  
  - **`embed`:** the URL of a video, a sound or a post. The backend resolves it with the provider's oEmbed (`GET /embeds?url=`), and the field shows its title and thumbnail. Without the endpoint, the value is `{ url }`.
  - **`location`:** a point and its address, `{ lat, lng, address }`, placed on a Leaflet map loaded on demand, typed, or found by address through a pluggable geocoding source.
  
  And:
  
  - **`@panneau/protocol`:** `EmbedValue`, `EmbedResponse` and `LocationValue`, `GET /embeds` in the OpenAPI document, the two types in `BUILT_IN_FIELD_TYPES`, and `/embeds` in the mock backend.
  - **`@panneau/data`:** `resolveEmbed()`, optional in `DataAdapter`, implemented by the REST adapter.
  - **`@panneau/fields`:** `EmbedField` and `LocationField` at `@panneau/fields/embed` and `/location`; `createEmbedSource()`; the `embedSource` and `maps` of `FieldsProvider`; `GeocodingSource` and `createNominatimSource()`.
  - **`@panneau/lists`:** `EmbedDisplay` and `LocationDisplay`.
  - **`@panneau/app`:** the `maps` option, and the embed source of the adapter.
  - **`@panneau/intl`:** the messages of the new fields, in English and French.

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 88a3d09: Fields check their value with the backend, and the slug field does what sites' `PageSlug` did (decision 0032). A field with `check: true` sends `POST /resources/{resource}/fields/{field}/check` as it is typed (`FieldCheckRequest`), and the backend answers whether the value is available, a free suggestion, the URL's `prefix` and `url`, and `disabled` for an item the field doesn't apply to (`FieldCheckResponse`). The mock backend answers it, and the conformance kit checks it (`fields.check`). `DataAdapter.checkField?()` sends it; `createFieldCheckSource(adapter, resource, id)` gives the fields context its `checkSource`, which `FormView` takes too. The `slug` field follows its source in its own locale, or in the default one, shows the backend's URL, and offers the suggestion when the slug is taken. Field entries get the `locale` of the value they edit.
- b86f35e: A "Go to…" command palette ([decision 0029](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0029-go-to-palette.md)), which products can also use without the app:
  
  - `@panneau/ui`:
      - `CommandPalette`: a search field over groups of items to go to or run, in a dialog near the top of the screen (the whole screen on a phone).
      - It matches items without case or accents, needs every word to match, and ranks the best matches first (`matchCommands()`, `normalizeSearch()`). Groups that are already `matched`, such as results of a server, are shown as they are, after the others.
      - `useCommandShortcut()` opens it with ⌘K or Ctrl+K, unless something already handled the key.
      - Tokens: `--panneau-command-palette-*`.
  - `@panneau/core`: plugins add `commands` (`Command`, `getCommands()`). `isSearchable()` and `getSearchableResources()` tell which resources the global search covers: `features.search`, which defaults to `list.search`.
  - `@panneau/data`: `useSearch()`, `searchQueryOptions()` and `queryKeys.search()`.
  - `@panneau/protocol`:
      - resources get `itemSubtitle` and `itemImage`, next to `itemTitle`;
      - `features.search` defaults to `list.search`;
      - the mock backend answers `GET /search`: 5 items per resource, 20 in all, from 2 characters.
  - `@panneau/app`: "Go to…" in the sidebar (an icon when collapsed), in the phone's top bar, and on ⌘K or Ctrl+K.
      - It lists recent items, kept in the browser, then the navigation, "New {resource}", the commands of plugins and the app's actions.
      - The server's search results follow, grouped by resource, with their subtitle and image.
      - An item opens its edit form.
  - `@panneau/intl`: the messages of the palette, in English and French.
- 6d1f1d8: Previews of items, in the panel of the show route ([decisions 0009 and 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)):
  
  - `@panneau/core`: plugins register preview components by name in `previews`, for resources whose `features.preview` is `{ "mode": "component", "component": "<name>" }`. They get `PreviewProps`: the item, its resource and the locale, to render the page as the site shows it, blocks, partials or charts.
  - `@panneau/data`: `previewItem()`, optional on adapters and implemented by the REST adapter, posts values to `POST /resources/{resource}/{id}/preview` and returns the short-lived URL of the item's page. `useItemPreview()`, `itemPreviewQueryOptions()` and `queryKeys.itemPreview()` fetch it.
  - `@panneau/protocol`: the mock backend answers the preview route, with a `data:` page of the item's values, or the URL of its `previewUrl` option.
  - `@panneau/app`: the panel of an item opens on a Preview tab, before its Details, when its resource has a preview, and remembers the tab. A button widens the panel, for previews (`--panneau-item-panel-width-wide`, half of the page by default).
  - `@panneau/intl`: the messages of previews, in English and French.
- 5779047: The global search reads `limit` and `resources`, and can be narrowed to one resource ([decision 0030](../docs/decisions/0030-search-parameters-and-scope.md)):
  
  - **`@panneau/protocol`:**
      - `GET /search` takes `limit` (1 to 20, 5 by default) and `resources` (comma-separated searchable resources). An invalid parameter is a `422` problem keyed by parameter, and a backend may answer `429` with `Retry-After`.
      - `readSearchQuery()`, `toSearchQueryParams()`, `isSearchableResource()` and the `SEARCH_*` limits are in `@panneau/protocol/runtime`. The mock backend uses them, and `openapi.json` documents them.
      - `runConformance()` checks the search: `search`, `search.scope` and `search.invalid`.
  - **`@panneau/data`:** `adapter.search(q, { limit, resources })`, `useSearch(q, { limit, resources })` and `searchQueryOptions(adapter, q, { limit, resources })`. Search keys are now `['panneau', 'search', q, options]`. A `429` is a `RateLimitedError`, with `retryAfter` from `Retry-After` (`readRetryAfter()`).
  - **`@panneau/ui`:** `CommandPalette` takes a `scope`, shown as a chip before the field, and `onScopeRemove`, called by Backspace in the empty field or the chip's button. Items with `keepsOpen` don't close it. Without results, its list shows its `status`.
  - **`@panneau/core`:** `isSearchable()` uses the protocol's `isSearchableResource()`.
  - **`@panneau/app`:** "Search in" narrows "Go to…" to one resource, with 20 results. "See all N results" opens the list of a resource, searched, when it has more results than shown. Too many searches are said in the palette.
  - **`@panneau/intl`:** the messages of the scope, in English and French.

### Patch Changes

- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [8372b27]
- Updated dependencies [5779047]
- Updated dependencies [5b2f3ce]
  - @panneau/protocol@5.0.0-alpha.5

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
