# Protocol

Version 1. This document explains the protocol and its conventions. The normative version is the `@panneau/protocol` package ([`packages/protocol`](../packages/protocol)):

- its schemas, in `src/schemas`;
- the files generated from them: `schema/definition.schema.json` and `schema/openapi.json`.

When this document and the package disagree, the package wins.

The protocol is the only contract between a Panneau frontend and its backend. It doesn't assume Laravel, Eloquent or numeric ids. `laravel-panneau` is the reference implementation, and it runs the conformance kit in its CI.

## Principles

- **Plain HTTP and JSON**, with standard verbs (`GET`, `POST`, `PATCH`, `DELETE`). No `_method` override and no form encoding, except for file uploads.
- **Opaque ids.** Item ids are strings. The frontend never parses or generates them. A backend can use numeric ids, UUIDs or prefixed ULIDs.
- **Everything the UI shows comes from the definition or the API.** This covers labels, fields, layouts, abilities and messages. The frontend holds no hidden knowledge about a backend.
- **Additive within a version.** Version 1 of the protocol can gain optional properties and endpoints. Removing or changing the meaning of anything requires version 2 and a major release.

## Definition

`GET {api}/definition` returns the definition for the current user, already translated in the current locale.

```jsonc
{
    "protocol": 1,
    "name": "Mon site",
    "locale": "fr",
    "locales": ["fr", "en"],
    "api": { "baseUrl": "/panneau/api" },
    "resources": [/* Resource */],
    "pages": { "home": { "component": "dashboard" } },
    "menus": { "main": [{ "type": "resources" }, { "type": "link", "label": "Site", "url": "/" }] },
    "auth": {/* Auth */},
    "dashboard": { "widgets": [/* Widget */] },
    "search": { "enabled": true },
    "theme": { "colorScheme": "auto" },
    "user": { "id": "usr_123", "name": "Ada", "abilities": { "panneau.view": true } },
}
```

### Resource

```jsonc
{
    "id": "pages",
    "kind": null, // "media" for a media library
    "label": { "singular": "page", "plural": "pages" },
    "fields": [ /* Field */ ],
    "form": { "layout": [ /* LayoutNode */ ] },
    "list": {
        "columns": [ { "field": "title", "sortable": true }, { "field": "published_at", "display": "date" } ],
        "filters": [ { "id": "status", "type": "select", "options": [...] } ],
        "sorts": [ "title", "-published_at" ],
        "defaultSort": "-published_at",
        "layouts": [ "table", "cards" ],
        "perPage": 20,
        "inlineEdit": [ "title", "status" ]
    },
    "actions": [ /* Action */ ],
    "abilities": { "viewAny": true, "create": true },
    "features": { "drafts": false, "revisions": false, "preview": null, "search": true },
    "types": [ { "id": "home", "label": "Accueil", "fields": [...] } ]
}
```

### Field

```jsonc
{
    "name": "title",
    "type": "text",
    "label": "Titre",
    "help": "Affiché dans les résultats de recherche",
    "default": null,
    "localized": true,
    "rules": [{ "rule": "required" }, { "rule": "max", "value": 120 }],
    "visibleWhen": { "field": "type", "in": ["article"] },
    "readOnly": false,
    "settings": { "placeholder": "…" },
}
```

- **`type`** names a field type: built-in or provided by a plugin. Built-in types:
    - `text`, `textarea`, `richtext`, `number`, `boolean`;
    - `date`, `datetime`, `time`;
    - `select`, `email`, `url`, `color`;
    - `media`, `image`, `file`, `relation`, `group`, `repeater`, `slug`;
    - `tel`, `range`, `duration`, `json`, `tags`, `embed`, `location` ([0033](decisions/0033-more-field-types.md)).
- **`localized`** makes the value an object keyed by locale (`{ "fr": "…", "en": "…" }`). It replaces the separate `localized` field and the `*Localized` PHP classes of v1.
- **`group`** has `fields`, for a nested object.
- **`repeater`** has `fields`, or `types` for typed blocks, for an array.
- **`relation`** points to another resource:

    ```jsonc
    { "resource": "authors", "multiple": true }
    ```

- **`slug` values** are strings, or an object per locale when the field is `localized`. `from` names the field the slug follows: in the slug's own locale, or in the default locale for a slug that isn't localized. With `"check": true`, the client checks the slug as it is typed ([Checking a field](#checking-a-field), [0032](decisions/0032-field-checks-and-slugs.md)).
- **`relation` values:**
    - In items, a value is a reference to the related item, `{ "id": "12", "label": "Ada" }`, where `label` is the value of the related resource's `itemTitle`. With `multiple`, it is a list of references. Lists can show related items without fetching them.
    - In requests, the client sends ids: `"12"`, or `["12", "13"]`. A backend also accepts the references it sent, and reads their `id`. It refuses ids that don't exist within the related resource's scope.
- **`media` values** reference media of the libraries the field allows, resources of kind `media` ([Media](#media)). The field's `resource` names one library, or lists several, in the order a picker shows them. Without it, the field allows every library of the definition ([0027](decisions/0027-media-picker.md)).
    - In items, a value is a reference, or a list of them with `multiple`: `{ "id": "med_01H…", "resource": "images", "label": "Portrait", "media": { "type": "image", "thumbnailUrl": "…" }, "transform": { … } }` (`MediaReference`). `resource` is the media's library, `label` its `itemTitle`, `media` what lists and fields show without fetching it, and `transform` the edits of the image for this use only.
    - In requests, the client sends ids (`"med_01H…"`), or `{ "id", "resource", "transform" }`. Ids are unique only within their library, so **a field that allows several libraries needs `resource`** for each media, and the backend refuses an id without it. The backend refuses ids outside the library's scope, as for relations.
- **`image` fields** are `media` fields for images, with an image editor ([0031](decisions/0031-image-editor-and-image-field.md)). Their values, libraries and requests are those of `media` fields, and their `accept` defaults to `["image/*"]`.

    ```jsonc
    {
        "name": "cover",
        "type": "image",
        "ratios": ["16:9", "4:3"], // the ratios the editor suggests
        "rotate": true, // the editor offers rotation and flips (true by default)
        "focalPoint": true, // the editor offers the focal point (true by default)
        "transformBase": "media", // media (the default), original, or choose
        "rules": [{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }],
    }
    ```

    - The `transform` of a value is the edits of the image for this use ([Transform](#media)). `transformBase` sets what it starts from: the media's own transform (`media`), the original file (`original`), or the user's choice in the editor (`choose`).
    - The `crop` rule enforces ratios, and can require a crop for each image.

- **`file` values** are files that belong to the item, outside the media library: an attachment, a PDF, a CSV ([0025](decisions/0025-presigned-uploads.md)).
    - In items, a value is a stored file, `{ "name": "terms.pdf", "url": "https://…", "mime": "application/pdf", "size": 52000 }`, or `null`. With `multiple`, it is a list of them.
    - In requests, the client sends `{ "upload": "upl_…" }` for a file uploaded directly to storage, the stored file it received to keep it, or `null` to remove it. Without direct uploads, it sends the file itself, in `multipart/form-data`.
    - `accept` and `maxSize` are checked on the file the backend receives. The client can also send the `name`, `mime` and `size` of an upload next to its `upload`, so that it checks them first.
- **`richtext` values** are HTML ([0007](decisions/0007-rich-text.md)), or `null` when empty. A client keeps the HTML it received until the content is edited: content written by another editor (CKEditor) saves unchanged. Its `settings` (`RichTextSettings`) set what users can add, not what a value may hold: elements and attributes that the toolbar doesn't offer are kept.

    ```jsonc
    {
        "name": "body",
        "type": "richtext",
        "settings": {
            "toolbar": [
                "heading",
                "style",
                "|",
                "bold",
                "italic",
                "link",
                "bulletList",
                "orderedList",
            ],
            "headings": [2, 3], // the levels the toolbar offers (2, 3 and 4 by default)
            "styles": [{ "label": "Big paragraph", "class": "big", "element": "p" }], // <p class="big">
            "links": { "newTab": "external" }, // choose (the default), external or never
        },
    }
    ```

    - `toolbar` lists buttons in order, with `|` between groups: `heading`, `style`, `bold`, `italic`, `underline`, `strike`, `superscript`, `subscript`, `code`, `link`, `bulletList`, `orderedList`, `blockquote`, `horizontalRule`, `clear`, `undo`, `redo`, and the buttons that plugins add (an inline logo). Clients skip names they don't know.
    - A style in `styles` puts its `class` on an element: `p` (the default), `h1` to `h6`, `blockquote`, `ul`, `ol` or `li`.
    - `links.newTab` sets which links open in a new tab, with `target="_blank" rel="noopener noreferrer"`: as the user chooses, every link to another site, or none.

- **`tel` values** are phone numbers, strings as typed. `pattern` constrains them when a project needs a format.
- **`range` values** are numbers, picked on a slider between the `min` and `max` rules (0 and 100 without them), or `null` until it is moved. Settings `step`, `decimals` and `suffix` are those of `number`.
- **`duration` values** are whole numbers of seconds, typed in hours, minutes and seconds. `settings.precision` is `seconds` (the default) or `minutes`. `min` and `max` are in seconds.
- **`json` values** are objects or arrays, edited as JSON text. The type implies the `json` rule: a client keeps text that doesn't parse as a string, which the rule refuses, and a backend refuses anything but an object, an array or `null`.
- **`tags` values** are lists of strings. `options` suggest tags; with `"settings": { "allowCustom": false }`, only their values are allowed, and `in` applies to each tag. `min` and `max` count the tags.
- **`embed` values** are what a URL embeds: `{ "url", "type", "title", "provider", "thumbnailUrl", "html", "width", "height" }` (`EmbedValue`), where everything but `url` comes from the provider's oEmbed. `type` is `video`, `audio`, `photo`, `rich` or `link`. Clients get it from `GET /embeds`, and send `{ "url" }` alone without it.
- **`location` values** are a point and its address: `{ "lat", "lng", "address" }` (`LocationValue`), with `lat` from -90 to 90, `lng` from -180 to 180, and `address` optional. Settings `zoom` and `center` (`{ "lat", "lng" }`) frame the map before a point is placed, and `tiles` (`{ "url", "attribution", "maxZoom" }`) replaces the app's tiles.
- **`rules`** use the portable rules below. A backend can also enforce rules that it doesn't expose.

### Portable validation rules

| Rule                | Applies to                              |
| ------------------- | --------------------------------------- |
| `required`          | all                                     |
| `min`, `max`        | number value; length of text and arrays |
| `pattern`           | text                                    |
| `email`, `url`      | text                                    |
| `json`              | `json` values: an object or an array    |
| `in`                | select values                           |
| `accept`, `maxSize` | files (MIME types, bytes)               |
| `before`, `after`   | dates (value or other field)            |
| `crop`              | `image` and `media` values              |

- **`crop`** checks the transform of each image of a value: `{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }`.
    - With `required`, each image needs a crop for this use. An id alone has none.
    - With `ratios`, a crop must have one of them once rendered (a quarter turn swaps its width and height). A crop has a ratio when its height is within one pixel of its width divided by the ratio, since crops are in whole pixels.

The frontend checks these rules before sending. The server checks them again, together with server-only rules (uniqueness, existence, business rules).

### Layout

The form layout is a tree that references fields by name. Fields that no layout node references are appended at the end.

```jsonc
[
    { "type": "tabs", "children": [
        { "type": "tab", "label": "Contenu", "children": [
            { "type": "row", "children": [
                { "type": "field", "name": "title", "width": 8 },
                { "type": "field", "name": "status", "width": 4 }
            ] },
            { "type": "field", "name": "body" }
        ] },
        { "type": "tab", "label": "SEO", "children": [ { "type": "section", "label": "Partage", "collapsible": true, "children": [...] } ] }
    ] },
    { "type": "sidebar", "children": [ { "type": "field", "name": "published_at" } ] }
]
```

Node types:

- **Containers:**
    - `row`, whose children have `width` on a 12-column grid;
    - `column`, `section`, `tabs` and `tab`, `sidebar`.
- **Content:** `field`, `text` (a static help paragraph), `component` (rendered by a plugin).

Any node can have `visibleWhen`.

### Actions

An action is an operation applied to one item, a selection, or the whole resource (see [decisions/0017](decisions/0017-actions.md)).

```jsonc
{
    "id": "publish",
    "label": "Publier",
    "icon": "send",
    "kind": "server", // "server" | "link" | "client"
    "scope": ["item", "selection"], // and/or "resource"
    "placement": ["row", "toolbar", "form"],
    "destructive": false,
    "confirm": {
        "title": "Publier les pages",
        "message": "Publier {count, plural, one {# page} other {# pages}} ?",
        "confirmLabel": "Publier",
    },
    "fields": [/* Field */], // parameters, shown in a modal
    "layout": [/* LayoutNode */],
    "queued": false, // true: always answers 202 with a run
    "abilities": { "run": true },
}
```

- **`kind`:**
    - `server` actions call the action endpoint;
    - `link` actions have a `url` template (`/pages/{id}/edit`) or a `route` name from `routes`;
    - `client` actions name a plugin handler in `component`.
- **`scope`:**
    - `item`: one item, from a row or a form;
    - `selection`: the selected items, or every item matching the list query;
    - `resource`: no items, such as import or export of everything.
- **`placement`:** where the action appears.
    - `row`: on each list row;
    - `toolbar`: on the list, for selections and resource actions;
    - `form`: in the item form header;
    - `menu`: in an overflow menu.
- **`confirm`:** `true` uses a default message. Its `message` can use `{count}`.
- **`destructive`:** styles the action and its confirmation as dangerous.

Built-in actions use reserved ids:

| Id                  | Kind     | Scope                   |
| ------------------- | -------- | ----------------------- |
| `show`, `edit`      | `link`   | `item`                  |
| `duplicate`         | `server` | `item`                  |
| `delete`, `restore` | `server` | `item`, `selection`     |
| `export`            | `server` | `selection`, `resource` |
| `import`            | `server` | `resource`              |

A resource lists the built-in actions it enables, possibly with overrides (label, placement, confirm).

### Auth

```jsonc
{
    "mode": "panneau", // "panneau": Panneau's own pages; "external": the site handles login
    "loginUrl": null, // with "external", where to send unauthenticated users
    "password": true,
    "providers": [{ "id": "google", "label": "Google", "url": "/panneau/auth/google" }],
    "passwordReset": true,
    "twoFactor": true,
    "passkeys": true,
    "emailVerification": false,
}
```

## Boot config

The page of the app carries a **boot config**: what the app needs before it can call the API. The server writes it as JSON in an element with the id `panneau-boot` (`BOOT_CONFIG_ELEMENT_ID`), next to the root element of the app:

```html
<div id="panneau"></div>
<script type="application/json" id="panneau-boot">
    { "protocol": 1, "apiBaseUrl": "/panneau/api", "basePath": "/panneau", "locale": "fr" }
</script>
```

```jsonc
{
    "protocol": 1,
    "apiBaseUrl": "/panneau/api", // the app fetches {apiBaseUrl}/definition, and makes every call there
    "basePath": "/panneau", // path of the app; client routes are under it ("/" on its own domain)
    "locale": "fr", // locale of the UI before the definition loads
    "definition": {/* Definition */}, // optional: inlined for the first render
    "loginUrl": "/login", // optional: where to send users when GET /definition answers 401
}
```

- **`definition`** is the response of `GET /definition` for the current user ([decisions/0004](decisions/0004-definitions-are-data.md)). With it, the app skips that request on load.
- **`loginUrl`** is only used before the definition is known. Afterwards, the app uses `auth.loginUrl` of the definition.
- **Escaping.** The server escapes `<`, `>` and `&` in the JSON, so its content can't close the `<script>` element.
- Like the definition, the boot config keeps properties it doesn't know.

`validateBootConfig()` checks a boot config, including the references of its inlined definition. `@panneau/protocol/boot.schema.json` is its JSON Schema, for backends in other languages. The client routes under `basePath` and the handling of `401` are part of the app's entry contract: see [decisions/0019](decisions/0019-app-entry.md).

## HTTP API

All paths are relative to `api.baseUrl`.

### Resources

| Operation   | Request                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| List        | `GET /resources/{resource}`                                                                   |
| Show        | `GET /resources/{resource}/{id}`                                                              |
| Create      | `POST /resources/{resource}`                                                                  |
| Update      | `PATCH /resources/{resource}/{id}` (partial, with `If-Match`)                                 |
| Delete      | `DELETE /resources/{resource}/{id}`                                                           |
| Action      | `POST /resources/{resource}/actions/{action}` (see [Actions](#actions-1))                     |
| Inline edit | `PATCH /resources/{resource}/{id}` with a single field                                        |
| Check       | `POST /resources/{resource}/fields/{field}/check` (see [Checking a field](#checking-a-field)) |

**List query parameters:**

- `page`, `perPage`
- `sort=-published_at,title`: comma-separated, `-` for descending
- `filter[{id}]`: the value of a filter of the list's definition, keyed by its `id`:
    - one value: `filter[status]=published`;
    - any of several values: `filter[tags][]=a&filter[tags][]=b`;
    - the bounds of a range filter (`date-range`): `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`. Both bounds are inclusive, and either can be left out for an open end. A `date-range` has days as bounds (`YYYY-MM-DD`): `to` includes the whole day, so a date-time on `2026-01-31` is in the range above.

    A backend ignores the filters it doesn't declare. In an action's query selection, the same values are JSON: `"filter": { "published_at": { "from": "2026-01-01" } }`.

- `q`: search
- `fields`: requested fields, so lists can ask for less

#### Checking a field

A field with `"check": true`, at the top of a resource, checks its value with the backend as it is typed (debounced), and once when the form opens ([0032](decisions/0032-field-checks-and-slugs.md)):

```jsonc
// POST /resources/pages/fields/slug/check
{ "value": "ete-a-montreal", "locale": "fr", "id": "12", "values": { "parent": "7" } }
// 200
{
    "available": false,
    "suggestion": "ete-a-montreal-2",
    "prefix": "https://example.com/fr/vacances/",
    "url": "https://example.com/fr/vacances/ete-a-montreal"
}
```

- `id` is the item being edited, or null when creating. `values` are the form's current values, as they would be sent to save, for what the answer depends on (a page's parent).
- `available` says whether another item of the resource, in its scope and the same locale, has the value. `suggestion` is a free value close to it when it is taken: the field offers it, without replacing what was typed.
- `prefix` and `url` are what the field shows in front of the value and as a link, or null. `disabled: true` says the field doesn't apply to this item (the home page has no slug): the field is read-only.
- The check runs with the user's permission to create, or to update the item `id`. It isn't authoritative: saving still validates the value.

**List response:**

```json
{
    "data": [
        {
            "id": "12",
            "version": "3",
            "abilities": { "update": true, "delete": false },
            "title": "…"
        }
    ],
    "meta": { "page": 1, "perPage": 20, "total": 134, "lastPage": 7 }
}
```

**Items:**

- Every item has `id`, `version` and `abilities`. `abilities` includes the ids of the actions allowed on that item (`"publish": true`).
- **Single items.** Show, create and update return `{ "data": Item }`. They also send `version` as a quoted `ETag` header (`"3"`).
- **Version conflicts.** An update with a stale `If-Match` returns `412 Precondition Failed`. The current item is in `current`.
- **`version: null`.** The backend has no versions: it sends no `ETag`, and it ignores `If-Match`.

### Actions

**Request.** `POST /resources/{resource}/actions/{action}` sends the selection and the parameter values:

```jsonc
// Selected items
{ "selection": { "ids": ["12", "13"] }, "values": { "notify": true } }

// Every item matching the list query, except some
{ "selection": { "query": { "filter": { "status": "draft" }, "q": "été" }, "except": ["14"] }, "values": {} }

// Resource scope: no selection
{ "values": { "format": "csv" } }
```

- **Query selection.** The backend applies the same scoping, filters and search as the list endpoint.
- **Files.** Parameters that include files (import) use `multipart/form-data`, with `values[...]` keys.
- **Validation.** Invalid values return `422`, with `errors` keyed by paths inside `values`.

**Response.** `200` with an action result:

```json
{
    "message": "12 pages publiées.",
    "summary": { "succeeded": 12, "failed": 1, "skipped": 2 },
    "results": [
        { "id": "14", "status": "failed", "message": "Le titre est obligatoire." },
        { "id": "15", "status": "skipped", "reason": "forbidden" }
    ],
    "refresh": "items",
    "redirect": null,
    "download": {
        "url": "https://…/exports/pages.csv?signature=…",
        "filename": "pages.csv",
        "expiresAt": "2026-10-14T18:00:00Z"
    }
}
```

- **`results`** only lists the items that didn't succeed.
- **`reason`** for skipped items is `forbidden`, `not_found` or `unchanged`.
- **`refresh`:**
    - `none`;
    - `items`: refetch the affected items;
    - `list`: refetch the list and the counts.
- **`redirect`:** a path or a `{ "route": "…", "params": {} }` object.
- **`download`:** a short-lived URL that the UI opens.

**Single item.** A `403` or `404` on the only item of an `item` action is returned as an error, not as a skipped result.

**Dry run.** An action with `"dryRun": true` in the definition answers dry runs: the same request with `"dryRun": true` answers what the action would do, without running it. Lists use it before they confirm an action on every item matching a query ("Select all N items"): they only know the abilities of the current page, and say how many items will be skipped (decision 0017).

```jsonc
// Request
{ "selection": { "query": { "filter": { "status": "draft" } } }, "dryRun": true }

// Response: 200
{ "summary": { "succeeded": 28, "failed": 0, "skipped": 12 }, "results": [{ "id": "15", "status": "skipped", "reason": "forbidden" }] }
```

- **No side effects:** nothing changes, nothing is queued, and the answer is never `202`.
- **`summary`** counts the items that would succeed and those that would be skipped. `results` may list the first skipped items.
- **No values:** a dry run comes before the parameters, so the backend doesn't validate `values`.
- **Opt-in:** the UI only sends `dryRun` to actions that declare it, since a backend that ignores the field would run the action. A dry run of an action that doesn't declare `dryRun` answers `400` and runs nothing.

**Long-running actions.** A queued action, or a selection above the backend's synchronous limit, answers `202 Accepted`:

```json
{
    "run": {
        "id": "run_01JA…",
        "action": "export",
        "resource": "pages",
        "status": "queued",
        "progress": 0,
        "total": 2400
    }
}
```

| Endpoint                     | Purpose                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `GET /actions/runs/{run}`    | status (`queued`, `running`, `succeeded`, `partial`, `failed`), `progress`, `total`, and the action result once finished |
| `GET /actions/runs`          | the current user's recent runs, for the notification area                                                                |
| `DELETE /actions/runs/{run}` | cancel a run that hasn't finished, when the action allows it                                                             |

### Errors

Errors use [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) `application/problem+json`:

```json
{
    "type": "urn:panneau:problem:validation",
    "title": "The given data was invalid.",
    "status": 422,
    "errors": {
        "title.fr": ["Le titre est obligatoire."],
        "blocks.2.image": ["Le fichier est trop lourd."]
    }
}
```

- **`errors` keys** are dot paths into the submitted value. Localized values use the locale as a segment, and arrays use the index.
- **`type`:**
    - `urn:panneau:problem:validation` for `422`;
    - `urn:panneau:problem:version-conflict` for `412`;
    - `about:blank` when the status says it all.

    Clients rely on the status, not on `type`.

- **Status codes:**

    | Status | Meaning                  |
    | ------ | ------------------------ |
    | `401`  | not authenticated        |
    | `403`  | not allowed              |
    | `404`  | not found                |
    | `409`  | conflict (business rule) |
    | `412`  | version conflict         |
    | `422`  | validation               |
    | `429`  | rate limited             |
    | `5xx`  | server error             |

### Uploads

**Direct uploads.** With `"uploads": { "mode": "presigned" }` in the definition, the browser can also send files to S3-compatible storage itself, in parts for large ones, with URLs that the backend signs ([0025](decisions/0025-presigned-uploads.md)). An upload is not a media: values reference it.

```jsonc
// POST /uploads/sign: the request to sign, as Uppy 6's signRequest gives it
{ "method": "POST", "key": "video.mp4" }
// 200: the presigned URL, and for a new file the key and the upload the backend chose
{ "url": "https://bucket.s3…?X-Amz-Signature=…", "key": "uploads/upl_01H…", "upload": "upl_01H…" }

// POST /uploads/{upload}/complete, once the browser completed the upload in storage, with the file's name
{ "name": "video.mp4" }
// 200: the upload
{ "data": { "id": "upl_01H…", "key": "uploads/upl_01H…", "name": "video.mp4", "mime": "video/mp4", "size": 2147483648 } }

// A value that takes a file takes the upload instead: a file field, the file of a media, an import parameter…
{ "values": { "file": { "upload": "upl_01H…" } } }
```

- **Signing:** the first request of a file (`CreateMultipartUpload`, or `PutObject` for a small file) creates the upload and its key. Later requests (`UploadPart`, `ListParts`, `CompleteMultipartUpload`, `AbortMultipartUpload`) are signed only for a key of the same user's open uploads, and get `404` otherwise. `headers` lists the headers a URL was signed with.
- **Completion** checks that the object exists, and gives the upload. Its optional `name` names the file, since the key the backend chose doesn't keep it.
- **Without direct uploads**, requests with files are sent in `multipart/form-data`.
- **`uploads.endpoint`** moves the two routes elsewhere, for a backend whose upload routes are not under its API.

### Media

A media library is a resource of kind `media` ([0026](decisions/0026-media-libraries.md)). A definition can have several, each with its own fields, list, scope and policies: "Images" and "Documents", or one library per product.

```jsonc
{
    "id": "media",
    "kind": "media",
    "label": { "singular": "média", "plural": "médias" },
    "itemTitle": "name",
    "fields": [
        {
            "name": "file",
            "type": "file",
            "accept": ["image/*", "application/pdf"],
            "rules": [{ "rule": "required" }],
        },
        { "name": "name", "type": "text" },
        { "name": "alt", "type": "text", "localized": true },
    ],
    "list": { "filters": [{ "id": "type", "type": "select" }], "search": true },
}
```

- **The `file` field**, of type `file` and not `multiple`, holds the original. Its `accept` and `maxSize` are the library's.
- **Items have a `media`**, which the backend computes from the file. It is read-only: clients never send it. Its `transform` is the media's own transform, from the library's `transform` field: references give it to the fields, which draw a transform for one use over it ([0031](decisions/0031-image-editor-and-image-field.md)).

    ```jsonc
    {
        "id": "med_01H…",
        "name": "Portrait",
        "file": {
            "name": "portrait.heic",
            "url": "https://…",
            "mime": "image/heic",
            "size": 3145728,
        },
        "media": {
            "type": "image", // image, video, audio, document, font, or another type
            "mime": "image/heic",
            "size": 3145728,
            "url": "https://…", // the main file to show or play
            "thumbnailUrl": "https://…",
            "variants": { "large": { "url": "…", "width": 1600, "height": 2000 } },
            "width": 3024,
            "height": 3780,
            "duration": null,
            "status": "ready", // pending or processing until its renditions are made, then ready or failed; ready without it
            "error": null, // with a failed status: { "code": "timeout", "message": "The poster took too long." }
            "transform": { "rotate": 90 }, // the media's own transform, from its transform field
        },
        "version": "3",
        "abilities": { "update": true, "delete": true },
    }
    ```

- **Operations** are those of resources:

    | Operation              | Request                                                                                        |
    | ---------------------- | ---------------------------------------------------------------------------------------------- |
    | List, search, filter   | `GET /resources/{library}?q=&filter[type]=image`                                               |
    | Show, update metadata  | `GET`/`PATCH /resources/{library}/{id}`                                                        |
    | Make a media of a file | `POST /resources/{library}` with `{ "file": { "upload": "upl_…" } }`, or the file in multipart |
    | Replace the file       | `PATCH /resources/{library}/{id}` with a new `file`                                            |
    | Edit an image          | `PATCH` of the library's `transform` field                                                     |
    | Delete, restore        | `DELETE /resources/{library}/{id}`, and the `restore` action                                   |

- **`filter[type]`** (`image`, `video`, `audio`, `document`, `other`) is supported by every library, for pickers.
- **Scope.** A library holds the media of its scope, like any resource: by type, by a column of the project, by tenant. It gives its scope to the media it makes.
- **Ids** are opaque, as for every resource. A backend may give globally unique ids (`med_…`), which content references.

**Transform.** The non-destructive edits of an image, which renderers (`laravel-image`) apply in this order: crop, then rotate, then flip.

```json
{
    "crop": { "x": 120, "y": 0, "width": 1600, "height": 900 },
    "rotate": 90,
    "flipX": true,
    "focalPoint": { "x": 0.42, "y": 0.35 }
}
```

- **`crop`**: whole pixels of the upright original image, after its EXIF orientation, which is what an editor shows. `x` and `y` are from the top left corner.
- **`rotate`**: `0`, `90`, `180` or `270` degrees, clockwise.
- **`flipX`** mirrors left to right, **`flipY`** top to bottom.
- **`focalPoint`**: from `0` to `1`, relative to the upright original, not to the crop, so changing the crop doesn't move it. Renderers map it into the transformed image and clamp it to the crop.
- **`base`**: what a transform for one use starts from ([0031](decisions/0031-image-editor-and-image-field.md)).
    - Without it, the transform starts from the original file, as above.
    - With `"media"`, it applies over the media's own transform: its crop and focal point are relative to the media's version instead of the original.
    - **`baseTransform`** is then the media's own transform it was made on. When the media's transform is no longer the same, clients ask to check the crop, and renderers clamp it to the image.

    ```json
    {
        "base": "media",
        "baseTransform": { "rotate": 90 },
        "crop": { "x": 0, "y": 900, "width": 3024, "height": 1701 }
    }
    ```

- **Other keys** can be added by editor tools. Renderers ignore the keys they don't know.
- The shape is shared by Panneau, `laravel-mediatheque` 2 (the media's `transform` field) and `laravel-image` 2 (folkloreinc/laravel-image#88).

### Auth

These endpoints only exist with `auth.mode = "panneau"`:

| Endpoint                                                        | Purpose                                             |
| --------------------------------------------------------------- | --------------------------------------------------- |
| `GET /auth/session`                                             | current user and abilities, or `401`                |
| `POST /auth/login`, `POST /auth/logout`                         | password login and logout                           |
| `GET /auth/providers/{provider}/redirect`                       | OAuth start; the callback is handled by the backend |
| `POST /auth/password/forgot`, `POST /auth/password/reset`       | password reset                                      |
| `POST /auth/two-factor/challenge`                               | second factor at login                              |
| `POST /auth/passkeys/options`, `POST /auth/passkeys/login`      | WebAuthn login                                      |
| `GET`/`PATCH /account`                                          | profile                                             |
| `/account/password`, `/account/two-factor`, `/account/passkeys` | security settings                                   |

With `auth.mode = "external"`, the frontend only calls `GET /auth/session` and sends unauthenticated users to `auth.loginUrl`.

### Search, dashboard, preview

| Endpoint                                  | Purpose                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `GET /search?q=&limit=&resources=`        | results grouped by resource: `{ "data": [ { "resource": "pages", "items": [...], "total": 34 } ] }` |
| `GET /embeds?url=`                        | what a URL embeds, for `embed` fields: `{ "data": EmbedValue }`, or a `422` when it can't embed it  |
| `GET /dashboard/widgets/{widget}`         | data for one widget, with the widget's own shape declared in the definition                         |
| `POST /resources/{resource}/{id}/preview` | sends the unsaved values; returns `{ "url": "…", "expiresAt": "…" }` for iframe previews            |

Global search ([decisions/0029](decisions/0029-go-to-palette.md)):

- **Searchable resources.** A resource is searched when its `features.search` is `true`, or, without it, when its list has a search (`list.search`), and the user can list it. With `"search": { "enabled": false }` in the definition, clients don't call `GET /search`.
- **Parameters:**
    - `q`: the search, trimmed, from 2 to 255 characters. The backend searches it the way the list of each resource reads `q`, within the same scope.
    - `limit`: items per resource, an integer from 1 to 20. Defaults to 5.
    - `resources`: comma-separated ids of searchable resources, to search only those (`resources=pages`). Defaults to every searchable resource.
- **Results.** The resources with results, in the order of the definition, at most `limit` items each and 20 in all. Items are serialized as in lists. `total`, when the backend counts it, is how many items of the resource match: the list of the resource, with `q`, shows them all. An item's title is its resource's `itemTitle`; `itemSubtitle` and `itemImage` name the fields shown under it and next to it, in search results, cards and pickers.
- **Errors:**
    - an invalid parameter is a `422` problem, with `errors` keyed by parameter (`q`, `limit`, `resources`): a search shorter than 2 characters, a limit out of bounds, or a resource that isn't searchable;
    - a backend can limit how often a user searches: `429`, with `Retry-After` in seconds. Clients wait for the next search, and say so.
- **Reference.** `readSearchQuery()` of `@panneau/protocol/runtime` reads and validates these parameters; `toSearchQueryParams()` writes them.

## Conformance

`@panneau/protocol` ships:

- **schemas and TypeScript types**. `Definition` is a definition after parsing, with defaults applied; `DefinitionInput` is a definition as a backend writes it.
- **validation helpers**:
    - `validateDefinition()` checks the schema, then the references between parts;
    - `lintDefinition()` checks those references alone: layout nodes and columns that name a field, relations that name a resource, unique names;
    - `validateBootConfig()` checks a [boot config](#boot-config).
- **the portable rules**: `checkValues()` is the reference implementation.
- **range filters**: `matchesFilterRange()` is the reference of how a backend reads the bounds of a range.
- **a light entry point for browsers** (`@panneau/protocol/runtime`): the constants and the helpers above that don't need the schemas (`checkValues()`, `evaluateCondition()`, `lintDefinition()`, the list query helpers, `isProblem()`), without loading zod. UI packages import them from there, and only types from the main entry point.
- **generated files**: `@panneau/protocol/definition.schema.json` and `@panneau/protocol/boot.schema.json` (JSON Schema 2020-12), and `@panneau/protocol/openapi.json` (OpenAPI 3.1).
- **a mock backend** (`@panneau/protocol/mock`): an in-memory implementation of the resource routes.
- **a conformance kit** (`@panneau/protocol/conformance`): `runConformance()` calls a live backend and checks its responses against the schemas. It also checks that the backend reads the bounds of the resource's first `date-range` filter, if it has one, and that `GET /search` finds an item by a word of its title, reads `limit` and `resources`, and refuses invalid parameters with a `422`.

```ts
import { formatReport, runConformance } from '@panneau/protocol/conformance';

const report = await runConformance({
    baseUrl: 'http://localhost:8000/panneau/api',
    init: { headers: { Authorization: `Bearer ${token}` } },
    resource: 'pages',
    // Optional: also checks create, update (with If-Match), conflicts and delete.
    writes: { create: { title: { fr: 'Test' } }, update: { title: { fr: 'Test 2' } } },
});
console.log(formatReport(report));
```

`laravel-panneau` validates its responses against `openapi.json`, and the page of the app against `boot.schema.json`, in its feature tests.
