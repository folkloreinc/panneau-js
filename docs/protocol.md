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
    "open": "panel", // where an item's title goes: "panel" (the default) or "edit"
    "itemActions": ["show", "edit", "duplicate", "delete"], // the built-in item actions shown, the default
    "fields": [ /* Field */ ],
    "form": { "layout": [ /* LayoutNode */ ] },
    "list": {
        "columns": [
            { "field": "title", "sortable": true, "hideable": false },
            { "field": "published_at", "display": "date" },
            { "field": "author", "hidden": true }, // shown when the user chooses it
        ],
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
    "abilities": { "update": false }, // optional: what the current user can do with the field
    "settings": { "placeholder": "…" },
}
```

- **`abilities`** ([0046](decisions/0046-abilities-in-the-ui.md)) say what the current user can do with the field. Only `false` restricts:
    - `view: false`: clients leave the field out of forms, details, list columns, sorts and inline editing. Layouts and columns that name it stay valid. Items don't carry its value.
    - `update: false`: the field is read-only for this user, in forms and in lists. The backend ignores its value on create and update.

    They apply to the fields at the top of a resource and of its types. `readOnly` is for a field that nobody edits.

- **`type`** names a field type: built-in or provided by a plugin. Built-in types:
    - `text`, `textarea`, `richtext`, `number`, `boolean`;
    - `date`, `datetime`, `time`;
    - `select`, `email`, `url`, `color`;
    - `media`, `image`, `file`, `relation`, `group`, `repeater`, `slug`;
    - `tel`, `range`, `duration`, `json`, `tags`, `embed`, `location` ([0033](decisions/0033-more-field-types.md)).
- **`text` settings:** `prefix` and `suffix` show in the control, around the value. With `"secret": true`, the value is a secret, such as an access key: clients type it in a password input that a button reveals, never let the browser fill it in, and show it as dots in lists and details. The backend still decides whether it sends the value back at all.
- **`select` options** are `{ "value", "label", "description", "disabled", "tone" }`. `tone` colors the option where it shows as a badge, in lists and details: `neutral` (the default), `accent`, `success`, `warning`, `danger`, `info`, or a tone of the theme (`{ "value": "failed", "label": "Failed", "tone": "danger" }`).
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
- **`richtext` values** are HTML ([0007](decisions/0007-rich-text.md)), or `null` when empty. A client keeps the HTML it received until the content is edited: content written by another editor (CKEditor) saves unchanged. Its `settings` (`RichTextSettings`, which `validateDefinition()` checks) set what users can add, not what a value may hold: elements and attributes that the toolbar doesn't offer are kept ([0035](decisions/0035-rich-text-kept-html.md)).

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

- **`tel` values** are international numbers in E.164, `+15145550199` ([0047](decisions/0047-countries-regions-and-phone-numbers.md)). The type implies the `tel` rule: a client keeps a number that isn't complete as the text typed, which the rule refuses. `settings.country` is the country of a new number.
- **`range` values** are numbers, picked on a slider between the `min` and `max` rules (0 and 100 without them), or `null` until it is moved. Settings `step`, `decimals` and `suffix` are those of `number`.
- **`duration` values** are whole numbers of seconds, typed in hours, minutes and seconds. `settings.precision` is `seconds` (the default) or `minutes`. `min` and `max` are in seconds.
- **`json` values** are objects or arrays, edited as JSON text. The type implies the `json` rule: a client keeps text that doesn't parse as a string, which the rule refuses, and a backend refuses anything but an object, an array or `null`.
- **`tags` values** are lists of strings. `options` suggest tags; with `"settings": { "allowCustom": false }`, only their values are allowed, and `in` applies to each tag. `min` and `max` count the tags.
- **`embed` values** are what a URL embeds: `{ "url", "type", "title", "provider", "thumbnailUrl", "html", "width", "height" }` (`EmbedValue`), where everything but `url` comes from the provider's oEmbed. `type` is `video`, `audio`, `photo`, `rich` or `link`. Clients get it from `GET /embeds`, and send `{ "url" }` alone without it.
- **`location` values** are a point and its address: `{ "lat", "lng", "address" }` (`LocationValue`), with `lat` from -90 to 90, `lng` from -180 to 180, and `address` optional. Settings `zoom` and `center` (`{ "lat", "lng" }`) frame the map before a point is placed, and `tiles` (`{ "url", "attribution", "maxZoom" }`) replaces the app's tiles.
- **`country` values** are ISO 3166-1 alpha-2 codes in capitals, `CA` (`XK` too). `settings.countries` lists the codes the field allows, `settings.preferred` the ones it shows first. A backend refuses other codes.
- **`region` values** are states, provinces or territories. Their country is the value of the field that `from` names, in the same object, or `settings.country`. For the countries Panneau knows the regions of, a value is the code of the region without its country, `QC` for `CA-QC`; for the others, the text as typed ([0047](decisions/0047-countries-regions-and-phone-numbers.md)).
- **`rules`** use the portable rules below. A backend can also enforce rules that it doesn't expose.

### Portable validation rules

| Rule                | Applies to                              |
| ------------------- | --------------------------------------- |
| `required`          | all                                     |
| `min`, `max`        | number value; length of text and arrays |
| `pattern`           | text                                    |
| `email`, `url`      | text                                    |
| `json`              | `json` values: an object or an array    |
| `tel`               | `tel` values: E.164 (`+15145550199`)    |
| `in`                | select values                           |
| `accept`, `maxSize` | files (MIME types, bytes)               |
| `before`, `after`   | dates (value or other field)            |
| `crop`              | `image` and `media` values              |

- **`required`** fails on `null`, an empty or blank string, and an empty array or object. A file chosen in the browser (`File`), to send in `multipart/form-data`, is filled; `accept` and `maxSize` read its type and size.
- **`mode`** limits a rule to one mode of the form: `create` (the item is created) or `update` (it is updated). Without it, a rule applies in both.

    ```jsonc
    // A password: required to create a user, optional to edit one (empty keeps the current one).
    // The backend never sends its value.
    {
        "name": "password",
        "type": "text",
        "settings": { "secret": true },
        "rules": [
            { "rule": "required", "mode": "create" },
            { "rule": "min", "value": 8 },
        ],
    }
    ```

    - Clients check the rule, and show the required mark, in that mode only. `resolveFields()` and `resolveForm()` of `@panneau/core` keep it, without its `mode`, in that mode, and drop it in the other.
    - A backend applies the rule in that mode only. On an update, a field whose `required` is limited to `create` accepts `null`, or no value at all.
    - Rules with a `mode` that a client checks without knowing the mode (`checkRules()` without one) are skipped: the backend still checks them.

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
    - `form`: in the header of the item, in its panel and its form;
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

**Built-in item actions** ([decisions/0040](decisions/0040-row-links-and-open-mode.md)). `show`, `edit`, `duplicate` and `delete` exist on every resource without being declared. The client shows each one on the items whose abilities allow it; a missing or false ability hides it:

| Action      | Ability     | What it does                                                     |
| ----------- | ----------- | ---------------------------------------------------------------- |
| `show`      | `view`      | links to the item: its panel, or its form with `"open": "edit"`  |
| `edit`      | `update`    | links to the item's form                                         |
| `duplicate` | `duplicate` | `POST /resources/{resource}/{id}/duplicate`, then opens the copy |
| `delete`    | `delete`    | the `delete` action, after a confirmation, also on selections    |

- `itemActions` on a resource picks some of them, in its order: `"itemActions": ["edit", "delete"]`. `[]` shows none. Without it, the four are shown.
- A declared action with one of these ids replaces the built-in one (an `edit` with a `url`, a `delete` with its own confirmation), and takes the built-in one's `placement`, `confirm`, `destructive` and `dryRun` when it doesn't set them. It is still shown by the ability above, and only if `itemActions` lists it. Its `label` is optional.
- The id of the action set to `false` hides it too: `{ "update": true, "edit": false }` hides "Edit". An item without abilities shows none of the four.
- A resource that can't duplicate sends `duplicate: false` (or no `duplicate`) on its items.
- Placements: `show` and `edit` in `row` and `form`; `duplicate` and `delete` in `menu` and `form`, and `delete` in `toolbar` for selections. For item actions, `row` is the buttons of a row, `menu` its menu, and `form` the header of the item, in its panel and its form.
- An item shows the same actions in its row, its panel and its form, but the one that leads there: no `show` in the panel, no `edit` in the form.
- **`abilities.run: false`** on an action hides it for the user everywhere. A resource whose user can't delete any of its items declares `{ "id": "delete", "abilities": { "run": false } }`: lists then have no "Delete", and no checkboxes for it ([0046](decisions/0046-abilities-in-the-ui.md)). Lists have checkboxes when a selection action can run.
- The ids `show` and `edit` are only for `link` actions. Every other action needs a `label`. The JSON Schema checks both.
- Other declared actions are for the resource's own operations, and keep their rules: a `link` is shown unless the item says `false`, other actions when the item lists their id.

**What opens an item.** `open` on a resource says where an item's title goes, in its list and wherever the app links to the item: `panel` (the default), the show route with its details next to the list ([decisions/0028](decisions/0028-item-panel.md)); `edit`, its form. With `edit`, the show route redirects to the edit route, and `show` is left out. An item without `abilities.update: true` still opens in the panel. Clients treat a value they don't know as `panel`.

**Layouts.** `layouts` lists those a list offers, the first being the default. Clients build in `table`, `cards`, `gallery` and `calendar`, and leave out those they can't show ([decisions/0044](decisions/0044-gallery-and-calendar.md)):

- `gallery` shows the image of each item, its `itemImage` field (a media reference, a file or a URL), and is offered when the resource has one.
- `calendar` shows the items of a month on the days of a `date` or `datetime` field, set by `calendar`: `{ "field": "starts_at", "filter": "starts_at", "perPage": 100 }`. `filter` is the list's `date-range` filter on that field (the field's name by default), and `perPage` how many items it asks for a month (100 by default). Instead of a page, the calendar asks for the list's query with that filter set to the days around the month, from 6 days before its first day to 6 days after its last, without `page` or `cursor`: `filter[starts_at][from]=2026-10-26&filter[starts_at][to]=2026-12-06&perPage=100`. When the answer has more items than it gives, the calendar says so. A backend needs nothing else.

**Columns users choose.** The user of a list shows, hides and orders its columns. A column with `"hidden": true` isn't shown until the user shows it; one with `"hideable": false` is always shown. The chosen columns and the layout are the view of the list: clients keep them in the URL with the query, and may remember them for the user. They are never sent to the backend ([decisions/0042](decisions/0042-list-view-columns-and-remembered-view.md)).

### Pages

`pages` are screens that aren't resources, rendered by a component of a plugin (or the built-in `dashboard`), at `{basePath}/pages/{page}`:

```jsonc
"pages": {
    "home": { "component": "dashboard" }, // the home route
    "usage": { "component": "usage", "label": "Usage", "props": { "period": "month" } },
    "job": { "component": "job", "label": "Job", "params": ["id"] }, // {basePath}/pages/job/{id}
}
```

- The component gets the page's `props`, the definition, and `params`: the values of the path segments that `params` names ([decisions/0038](decisions/0038-pages-with-params.md)). A page takes exactly its params.
- A route reference can name a page: `{ "route": "job", "params": { "id": "4f2a" } }`, when `routes` has no route of that name. Menus don't link to pages with params.
- **`abilities`** ([0046](decisions/0046-abilities-in-the-ui.md)): `{ "view": false }` leaves the page out of menus, and its route shows a forbidden state. `pages.home` with `view: false` falls back to the built-in home. Without it, a page is allowed. A backend can also leave out a page the user should not know about.

### Menus and the forbidden state

- **Menus** show an entry when the user can reach its target: a resource with `viewAny`, a page without `view: false`. Groups left empty and extra separators are left out. A `link` entry has no abilities: a backend leaves it out of the definition of a user who can't follow it.
- **The forbidden state** ([0046](decisions/0046-abilities-in-the-ui.md)) is a page of the app, in the shell, with a link to the home page. It shows on the list and show routes of a resource without `viewAny`, the create route of a resource without `create`, the route of a page with `view: false`, and when the request of a page answers `403`. The edit route of an item without `update: true` goes to its show route, or shows the forbidden state when the item can't be viewed either. `401` still goes to the login.

### Context

`context` declares a current context that the user picks in the app, such as a client and a contest ([decisions/0045](decisions/0045-current-context.md)). The client sends its values with every request, and the definition is built for them:

```jsonc
"context": {
    "params": [
        { "name": "client", "label": "Client", "fixed": true, "value": "4", "valueLabel": "Northwind" },
        { "name": "contest", "label": "Contest", "required": true, "value": null },
    ],
}
```

- Params are in order: each one depends on those before it. `name` is an identifier that isn't a reserved first segment of the client routes (`resources`, `pages`, `media`, `search`, `account`, `auth`).
- The choices of a param are its `options`, or `GET /context/{name}/options?q=…` (see [Context header](#context-header)).
- `value` and `valueLabel` say what the definition was built for. A required param without a value has the app show a page to pick it.
- A `fixed` param has a value that the backend sets from the request, such as its domain (the client of a client's domain): the app shows it without a field, and leaves it out of the path and of the header. Elsewhere, the same param can be picked, with an `allLabel` when it is optional.
- In the app, the values of the params that aren't fixed are a prefix of the client routes: `{basePath}/{name}/{value}/…`, in order.

### Auth

```jsonc
{
    "mode": "panneau", // "panneau": Panneau's own pages; "external": the site handles login
    "loginUrl": null, // with "external", where to send unauthenticated users
    "logoutUrl": null, // with "external", the site's logout, where the browser goes to log out
    "password": true, // an email and a password; the default without "token"
    "token": { "label": "Admin token", "help": "…" }, // optional: a login with a single secret
    "providers": [{ "id": "google", "label": "Google", "url": "/panneau/auth/google" }],
    "passwordReset": true,
    "twoFactor": true,
    "passkeys": true,
    "emailVerification": false,
}
```

- **Login.** In `panneau` mode, the app shows its login page when the API answers `401`: a form for an email and a password, a form for the secret of `token`, and a link for each provider, as `auth` says. `POST /auth/login` takes `{ "email", "password", "remember" }`, or `{ "token", "remember" }` with `token`. See [decisions/0037](decisions/0037-login-page-token-and-logout.md).
- **Logout.** In `panneau` mode, the app calls `POST /auth/logout`, then shows the login page. In `external` mode, the browser goes to `logoutUrl`; without it, the app offers no logout.
- **Password reset.** With `passwordReset`, the login page links to a form that calls `POST /auth/password/forgot` with `{ "email" }`. The backend answers `204` whether or not the address has an account, and emails a link to the page of the app at `{basePath}/auth/reset-password?token=…&email=…` (`AUTH_PAGE_PATHS.resetPassword`). That page sends `{ "token", "email", "password" }` to `POST /auth/password/reset`, then shows the login page: the reset doesn't log in. See [decisions/0048](decisions/0048-password-reset-and-email-verification.md).
- **Two-factor authentication.** With `twoFactor`, `POST /auth/login` answers `202` with `{ "twoFactor": true }` for a user who has it: the login page asks for a code of the authenticator app, or a recovery code, and sends `{ "code" }` or `{ "recoveryCode" }` to `POST /auth/two-factor/challenge`. Users set it up through `/account/two-factor` (status, setup with a secret and a QR code shown as an image, confirmation with a code that gives the recovery codes, new codes, turning it off). A user who must have it and hasn't set it up gets a `403` problem of type `urn:panneau:problem:two-factor-required` (`TWO_FACTOR_REQUIRED_PROBLEM_TYPE`) on every operation but those of the auth and of `/account/two-factor`, and the app shows the setup. See [decisions/0049](decisions/0049-two-factor-authentication.md).
- **Password confirmation.** An operation that needs a recent password answers `423`, a problem of type `urn:panneau:problem:password-confirmation`: the app asks for the password, sends it to `POST /auth/password/confirm`, and runs the operation again.
- **Email verification.** With `emailVerification`, the backend answers a user whose address isn't verified with a `403` problem of type `urn:panneau:problem:email-unverified` (`EMAIL_UNVERIFIED_PROBLEM_TYPE`) on every operation but those of the auth. The app then shows a page that sends a new link (`POST /auth/email/verification`). The link opens the page of the app at `{basePath}/auth/verify-email?token=…` (`AUTH_PAGE_PATHS.verifyEmail`), which sends `{ "token" }` to `POST /auth/email/verify`, logged in or not.

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
    "auth": {/* Auth */}, // optional: the auth of the definition, for the login page before it
}
```

- **`definition`** is the response of `GET /definition` for the current user ([decisions/0004](decisions/0004-definitions-are-data.md)). With it, the app skips that request on load.
- **`loginUrl`** is only used before the definition is known. Afterwards, the app uses `auth.loginUrl` of the definition.
- **`auth`** is the `auth` of the definition. In `panneau` mode, the app's login page shows before the definition can be loaded, and reads which logins to offer from it. The server serves the page to guests, rather than redirecting them.
- **Escaping.** The server escapes `<`, `>` and `&` in the JSON, so its content can't close the `<script>` element.
- Like the definition, the boot config keeps properties it doesn't know.

`validateBootConfig()` checks a boot config, including the references of its inlined definition. `@panneau/protocol/boot.schema.json` is its JSON Schema, for backends in other languages. The client routes under `basePath` and the handling of `401` are part of the app's entry contract: see [decisions/0019](decisions/0019-app-entry.md).

## HTTP API

All paths are relative to `api.baseUrl`.

### Resources

| Operation   | Request                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List        | `GET /resources/{resource}`                                                                                                                                       |
| Show        | `GET /resources/{resource}/{id}`                                                                                                                                  |
| Create      | `POST /resources/{resource}`                                                                                                                                      |
| Update      | `PATCH /resources/{resource}/{id}` (partial, with `If-Match`)                                                                                                     |
| Delete      | `DELETE /resources/{resource}/{id}`                                                                                                                               |
| Duplicate   | `POST /resources/{resource}/{id}/duplicate`: `201` with the copy (`{ "data": Item }`), for `abilities.duplicate`; `409` when the copy conflicts with another item |
| Action      | `POST /resources/{resource}/actions/{action}` (see [Actions](#actions-1))                                                                                         |
| Inline edit | `PATCH /resources/{resource}/{id}` with a single field                                                                                                            |
| Check       | `POST /resources/{resource}/fields/{field}/check` (see [Checking a field](#checking-a-field))                                                                     |

**List query parameters:**

- `page`, `perPage`
- `cursor`: for a list whose `pagination` is `cursor`, the `nextCursor` (or `previousCursor`) of a page, instead of `page` ([0039](decisions/0039-cursor-pagination.md))
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

**Cursor pagination.** A list with `"pagination": "cursor"` in its definition (`list`) pages with opaque cursors, for lists too large or too live to count: thousands of jobs a day, newest first. Its pages have no number and no total:

```jsonc
// GET /resources/jobs?perPage=50&cursor=eyJpZCI6NDJ9
{
    "data": [/* Item */],
    "meta": { "perPage": 50, "nextCursor": "eyJpZCI6Nzh9", "previousCursor": null, "total": null },
}
```

- `nextCursor` is `null` on the last page. `previousCursor` is `null` when the previous page is the first, which has no cursor; a backend can leave it out, and clients then go back through the cursors they followed. `total` is optional.
- A cursor belongs to its query: changing the sort, filters, search or page size starts over from the first page, without a cursor. A cursor the backend can't read is a `422` problem, with `errors.cursor`.
- Clients show the previous and next pages, and don't offer to select every matching item, since they can't count them.

**Items:**

- Every item has `id`, `version` and `abilities`. `abilities` includes the ids of the actions allowed on that item (`"publish": true`). `view`, `update`, `duplicate` and `delete` show the built-in item actions ([decisions/0040](decisions/0040-row-links-and-open-mode.md)): without them, the client shows none.
- **Abilities are enforced.** A resource without `viewAny` answers `403` on its list, one without `create` on creates, and an item without `view`, `update` or `delete` on those requests. Items leave out the values of fields with `view: false` ([0046](decisions/0046-abilities-in-the-ui.md)).
- **Single items.** Show, create and update return `{ "data": Item }`. They also send `version` as a quoted `ETag` header (`"3"`).
- **Partial updates.** An update only validates and saves the fields it sends: a list that edits a field in place sends that field alone, with `If-Match` ([decisions/0043](decisions/0043-inline-editing.md)). Whether a field applies (`visibleWhen`), and rules that read other fields, use the item's values for the fields that aren't sent: a field shown when `status` is `published`, sent alone, is saved on a published item.
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

### Context header

When the definition has `context`, the client sends the values of its params in a `Panneau-Context` header, on every request, in the format of a query string, in order: `Panneau-Context: client=4&contest=12` ([decisions/0045](decisions/0045-current-context.md)).

- The backend checks each value for the user. A value the user can't use is a `403` problem of type `urn:panneau:problem:context`, with the refused `param`. Names it doesn't know are ignored.
- `GET /definition` is built for the values. Without a value for a required param, the backend may choose one and say it in `value`.
- A `fixed` param keeps the value the backend sets from the request. Another value in the header is the `403` context problem of that param.
- Each resource applies the values in its scope. Without a value for a required param, the resource routes may answer the same `403` problem.
- `GET /context/{name}/options?q=…` gives the first choices of a param without inline `options` that match `q`, for the values of the params before it: `{ "data": [{ "value": "12", "label": "Summer 2026", "description": "Northwind" }] }`.
- Responses vary with the header (`Vary: Panneau-Context`). A backend on another origin allows it in CORS.

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
    - `urn:panneau:problem:context` for a `403` on a value of `Panneau-Context`, with its `param`;
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

| Endpoint                                                                   | Purpose                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `GET /auth/session`                                                        | current user and abilities, or `401`                                            |
| `POST /auth/login`, `POST /auth/logout`                                    | login (password or token) and logout                                            |
| `GET /auth/providers/{provider}/redirect`                                  | OAuth start; the callback is handled by the backend                             |
| `POST /auth/password/forgot`, `POST /auth/password/reset`                  | password reset                                                                  |
| `POST /auth/email/verification`, `POST /auth/email/verify`                 | email verification: send a link, verify its token                               |
| `POST /auth/two-factor/challenge`                                          | second factor at login                                                          |
| `POST /auth/password/confirm`                                              | confirms the password, for operations that need it                              |
| `POST /auth/passkeys/options`, `POST /auth/passkeys/login`                 | WebAuthn login                                                                  |
| `GET`/`PATCH /account`                                                     | profile                                                                         |
| `GET`/`POST`/`DELETE /account/two-factor`, `…/confirm`, `…/recovery-codes` | two-factor authentication: status, setup, confirmation, new recovery codes, off |
| `/account/password`, `/account/passkeys`                                   | security settings                                                               |

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
- **a conformance kit** (`@panneau/protocol/conformance`): `runConformance()` calls a live backend and checks its responses against the schemas. For a list paged with cursors, it also follows `nextCursor`, and checks that an invalid cursor is a `422`. With `writes`, it also checks that rules limited to `create` don't apply to updates: an update with those fields set to `null` succeeds. It also checks that an update of a single field, with `If-Match`, changes that field alone. It also checks that the built-in `delete` answers a dry run without being declared and, with `writes`, that an item that allows `duplicate` is copied under a new id, with its `ETag`. It also checks that the API agrees with the abilities it announces ([0046](decisions/0046-abilities-in-the-ui.md)): resources without `viewAny` answer `403` on their list, items leave out the values of fields with `view: false`, and a dry run of `delete` skips an item without `delete`; with `writes`, an empty create of a resource without `create`, and an empty update of an item without `update`, answer `403`. It also checks that the backend reads the bounds of the resource's first `date-range` filter, if it has one, and that `GET /search` finds an item by a word of its title, reads `limit` and `resources`, and refuses invalid parameters with a `422`. With a `context` in the definition, it checks the choices of each param, a definition built for a value of the first param, and a value that doesn't exist refused with a `403` context problem. `context` sends values with every request, for a backend whose resources need one.

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
