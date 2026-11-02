# 0040: Built-in item actions by abilities, and what opens an item

- Status: accepted
- Date: 2026-11-02
- Changes: the built-in actions of [0017](0017-actions.md), and what titles link to in [0028](0028-item-panel.md)

## Context

In v4, lists have an `actions` column with `show`, `edit` and `delete` buttons on each row. [0017](0017-actions.md) keeps `show`, `edit`, `duplicate` and `delete` as built-in actions, and the protocol said a resource lists the built-in actions it enables. But a `link` action needed a `url` or a `route`, and a backend doesn't know the paths of the app: none could declare `edit` so that it opens the app's form. So migrated lists had no buttons left, and the edit form was only reached through the panel of [0028](0028-item-panel.md).

Declaring the same four actions on every resource is also noise: what a user can do with an item is already in its abilities ([0011](0011-permissions.md)).

For some resources (orders, users), the panel adds nothing: their users want the title of a row to open the form. [0028](0028-item-panel.md) left "a resource whose show route goes elsewhere" to a property of the protocol, to decide when a project needs it. One does.

## Decision

### Built-in item actions

- **Every resource has four item actions without declaring them:** `show`, `edit`, `duplicate` and `delete`. The client shows each one on the items whose abilities allow it:

    | Action      | Ability     | What it does                                       | Placement                 | So it shows in                        |
    | ----------- | ----------- | -------------------------------------------------- | ------------------------- | ------------------------------------- |
    | `show`      | `view`      | links to the item (its panel, or its form)         | `row`, `form`             | rows and the form (it is the panel)   |
    | `edit`      | `update`    | links to the item's form                           | `row`, `form`             | rows and the panel (it is the form)   |
    | `duplicate` | `duplicate` | `POST /resources/{resource}/{id}/duplicate`        | `menu`, `form`            | the menu of rows, the panel, the form |
    | `delete`    | `delete`    | the built-in `delete` action, after a confirmation | `menu`, `form`, `toolbar` | the same, and selections              |
    - **An ability that is missing or `false` hides the action**, and so does an item without abilities: the UI never shows a button that would fail with `403` ([0011](0011-permissions.md)). The abilities of each item say everything: a backend that sends `{ "view": true, "update": true }` gets "View" and "Edit", and nothing else.
    - **The id of the action set to `false` hides it too**, whatever its ability: `{ "update": true, "edit": false }` hides "Edit": the item can be updated (by an action, say), but has no link to its form.
    - **A resource that can't duplicate** (its repository can't copy items) sends `duplicate: false`, or no `duplicate`, on its items: no other property is needed. A client whose adapter can't duplicate leaves `duplicate` out too.
    - **The client labels them** in its locale ("View", "Edit", "Duplicate", "Delete"; "Voir", "Modifier", "Dupliquer", "Supprimer" in French), and gives them their icons (an eye, a pencil, a copy, a trash can).

- **`itemActions` on a resource states the exception:** which of the four it shows, in which order. `"itemActions": ["edit", "delete"]` shows "Edit" and "Delete", in that order; `[]` shows none. Without it, the four are shown, in the order of the table. Clients ignore ids they don't know.
- **A declared action with a reserved id replaces the built-in one,** at its place: `{ "id": "edit", "kind": "link", "url": "/editor/{id}", "scope": ["item"] }` goes to another editor, and `laravel-panneau`'s `DeleteAction` replaces the built-in `delete`. It is still shown by the ability of the table, and left out when `itemActions` doesn't list its id. **What it doesn't set is the built-in one's:** `placement`, `confirm`, `destructive` and `dryRun`, so a declared `delete` stays in the menu of rows, asks first, and answers dry runs. Its `label` is optional: the client's is used without one.
- **The ids `show` and `edit` are reserved for `link` actions:** a definition with `{ "id": "edit", "kind": "server" }` is invalid. Every other action needs a `label`. The generated JSON Schema checks both, as the Zod schemas do.
- **Actions declared in `actions`** are for the real operations of a resource (publish, export, its page on the site). They keep their rules: a `link` is shown unless the item says otherwise (`"site": false`), other actions when the item lists their id (`"publish": true`).
- **Deleting the item from its panel closes the panel**; from its form, it goes back to the list.

### One rule for the actions of an item, everywhere

An item shows its actions on four surfaces: **the buttons of its row**, **the menu of its row**, **the header of its panel** and **the header of its edit form**. One function of `@panneau/core`, `getItemActions(resource, item, surface)`, decides them all, and every surface renders what it returns:

- **Which actions:** the built-in item actions of the resource (`itemActions`, or the four), replaced by declared ones with their ids, then the other declared actions; those the user can run (`abilities.run`), that apply to items, and that the item's abilities allow.
- **Where:** by placement. `row` is the buttons of rows, `menu` the menu of rows, and `form` **the header of the item: its panel and its form**. A declared item action without `placement` is in `row` and `form`, as `show` and `edit` are; with one, it is where it says. So with the default placements, an item shows the same actions in its row (buttons and menu), its panel and its form.
- **The one exception: the action that leads to the surface is left out.** No `show` in the panel, which it opens; no `edit` in the form, which it opens.
- **Links are resolved once:** a `url` with the item's values, the built-in `show` and `edit` to the app's routes, a `route` to its path in the definition. Links open in a new tab when they leave the admin. A built-in link that nothing resolves is left out (a list outside the app); a `route` nothing resolves runs, and the action runner navigates.
- **The same component** shows them in the headers of the panel and of the form, and rows show them with their buttons and their menu. Running them goes through the same runner, with the same confirmations.

### Running `duplicate` and `delete`

- **`delete` is the built-in `delete` action** of [0017](0017-actions.md): `POST /resources/{resource}/actions/delete` with the selection, after a confirmation, for one item or a selection. The backend answers its dry runs, so that "Select all" says how many items it will skip. `DELETE /resources/{resource}/{id}` stays the deletion of the API.
- **`duplicate` is `POST /resources/{resource}/{id}/duplicate`,** without a body. It answers `201` with the copy, a new item (`{ "data": Item }`, with its `ETag`), or a `403` or `404` problem, or a `409` problem when the copy conflicts with another item (a unique value the backend can't make unique). The client shows the problem's message. The client then opens the copy in its form, or in its panel when the copy can't be updated, and refreshes the lists. A form with unsaved changes asks first. `duplicate()` of the data adapter is optional.

### What opens an item

- **`open` on a resource** says where an item's title goes, in its list and wherever the app links to the item:
    - `"panel"`, the default: the show route, which opens the item's details in a panel next to the list ([0028](0028-item-panel.md));
    - `"edit"`: the edit form of the item.
- **With `"open": "edit"`, the show route redirects to the edit route** (replacing the entry of the history, and keeping its hash), so a link to the item, shared or bookmarked, still opens it. `show` is left out, since it would go to the same place as `edit`.
- **An item that can't be updated** (without `abilities.update: true`) opens in the panel, as with `"panel"`: its title links to the show route, which doesn't redirect it. The client has no read-only form, and the item's form would fail on save. Its row has neither "View" (left out) nor "Edit" (not allowed): its title is the way to it.
- While the item loads, the show route shows nothing, rather than the list and its panel for an instant before the redirect.
- The show route still needs the resource to be listed (`abilities.viewAny`): it redirects only from the list's page.

## Not decided here

- **The show route going to the site** ([0028](0028-item-panel.md)): `open` can take a third value when a project needs it. Clients treat an `open` they don't know as `"panel"`.
- **`restore`, `export` and `import`** stay actions that a resource declares: they don't apply to every resource.

## Consequences

- **What changes for definitions written before this decision:**
    - Lists get "View", "Edit", "Duplicate" and "Delete" on the items whose abilities allow them, and checkboxes for the bulk `delete`, without a change of the backend. A resource that doesn't want them says so in `itemActions`.
    - A declared `show` or `edit` is hidden on an item without `view: true` or `update: true`. Before, a link was shown unless the item said `false`.
    - A backend that sends no abilities on its items gets none of the four. Items without abilities (a product's own records, in lists outside the app) show their other actions, as before.
    - A declared link without `placement` (its page on the site) is in rows and in the headers of the panel and of the form. A link placed elsewhere is no longer in the panel: the panel shows the actions placed in `form`, as the form does. A link with a `route` is a link in rows too.
- The protocol's `Action` has an optional `label` for the four built-in ids, a resource has `itemActions` and `open`, and the API has `POST /resources/{resource}/{id}/duplicate`. The JSON Schema and the OpenAPI document follow. The mock backend allows the four on its items, duplicates them, answers dry runs of the built-in `delete`, and reads abilities as clients do (a missing one doesn't allow). The conformance kit checks that the built-in `delete` answers a dry run without being declared (`action.delete`) and, with `writes`, the duplication of an item that allows it, with the `ETag` of the copy (`duplicate`).
- `@panneau/core`'s `getItemActions()` gives the actions of an item on a surface (`selectItemActions()` for actions already placed, as lists get them), from `getResourceActions()`, the actions of a resource with its built-in item actions, and `isActionAllowedOn()`, which checks their abilities. `fillActionUrl()` fills a URL template. `@panneau/intl` labels them (`getActionLabel()`). `ListView` takes `getLinkHref` to resolve `show` and `edit`: a list without it (outside the app) leaves out links it can't resolve. `@panneau/data` has `duplicate()` on the adapter and `useDuplicateItem()`.
- `laravel-panneau` sends `view`, `update`, `delete` and `duplicate` on each item, answers the duplicate route, and has `itemActions()` and `open()` on `Resource`. It declares no `EditAction` by default. Its migration tools turn the `actions` column of v4 into `itemActions`.
