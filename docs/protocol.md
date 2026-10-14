# Protocol (draft)

Status: draft. This document describes the intent and the main conventions. The normative version will be the JSON Schema and OpenAPI files published in `@panneau/protocol`, written in Phase 0 (see [roadmap.md](roadmap.md)). When they disagree, the files win.

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
    - `media`, `relation`, `group`, `repeater`, `slug`.
- **`localized`** makes the value an object keyed by locale (`{ "fr": "…", "en": "…" }`). It replaces the separate `localized` field and the `*Localized` PHP classes of v1.
- **`group`** has `fields`, for a nested object.
- **`repeater`** has `fields`, or `types` for typed blocks, for an array.
- **`relation`** points to another resource:

    ```jsonc
    { "resource": "authors", "multiple": true }
    ```

- **`rules`** use the portable rules below. A backend can also enforce rules that it doesn't expose.

### Portable validation rules

| Rule                | Applies to                              |
| ------------------- | --------------------------------------- |
| `required`          | all                                     |
| `min`, `max`        | number value; length of text and arrays |
| `pattern`           | text                                    |
| `email`, `url`      | text                                    |
| `in`                | select values                           |
| `accept`, `maxSize` | media (MIME types, bytes)               |
| `before`, `after`   | dates (value or other field)            |

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

## HTTP API

All paths are relative to `api.baseUrl`.

### Resources

| Operation   | Request                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| List        | `GET /resources/{resource}`                                               |
| Show        | `GET /resources/{resource}/{id}`                                          |
| Create      | `POST /resources/{resource}`                                              |
| Update      | `PATCH /resources/{resource}/{id}` (partial, with `If-Match`)             |
| Delete      | `DELETE /resources/{resource}/{id}`                                       |
| Action      | `POST /resources/{resource}/actions/{action}` (see [Actions](#actions-1)) |
| Inline edit | `PATCH /resources/{resource}/{id}` with a single field                    |

**List query parameters:**

- `page`, `perPage`
- `sort=-published_at,title`: comma-separated, `-` for descending
- `filter[status]=published`, `filter[tags][]=a`
- `q`: search
- `fields`: requested fields, so lists can ask for less

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
- `version` is also sent as an `ETag` header on single-item responses.
- An update with a stale `If-Match` returns `412 Precondition Failed`, with the current item in the body.

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

### Media

| Operation             | Request                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| List and search       | `GET /media?q=&filter[type]=image&filter[tags][]=`                                               |
| Show, update metadata | `GET`/`PATCH /media/{id}`                                                                        |
| Upload                | `POST /media` (multipart), or a TUS or presigned flow announced in the definition                |
| Replace the file      | `POST /media/{id}/file`                                                                          |
| Edit an image         | `PATCH /media/{id}` with `{ "transform": { "crop": {...}, "rotate": 90, "focalPoint": {...} } }` |
| Delete, restore       | `DELETE /media/{id}`, `POST /media/{id}/restore`                                                 |
| Tags                  | `GET /media/tags`                                                                                |

Media items are referenced from field values by id. A media item also exposes:

- `url` and `thumbnailUrl`;
- `variants`, a map of named sizes;
- `type`, `mime`, `size`, `metadata`;
- `transform`, the non-destructive edits.

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

| Endpoint                                  | Purpose                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET /search?q=`                          | results grouped by resource: `{ "data": [ { "resource": "pages", "items": [...] } ] }`   |
| `GET /dashboard/widgets/{widget}`         | data for one widget, with the widget's own shape declared in the definition              |
| `POST /resources/{resource}/{id}/preview` | sends the unsaved values; returns `{ "url": "…", "expiresAt": "…" }` for iframe previews |

## Conformance

`@panneau/protocol` ships:

- **TypeScript types**, generated from the schemas;
- **the files**: `definition.schema.json` and `openapi.yaml`;
- **a conformance kit**: fixtures and a runner that calls a live backend and validates every response against the spec.

`laravel-panneau` validates its responses against `openapi.yaml` in its feature tests.
