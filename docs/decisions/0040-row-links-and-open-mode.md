# 0040: Built-in `show` and `edit` links, and what opens an item

- Status: accepted
- Date: 2026-11-02
- Changes: the built-in links of [0017](0017-actions.md), and what titles link to in [0028](0028-item-panel.md)

## Context

In v4, lists have an `actions` column with `show`, `edit` and `delete` buttons on each row. [0017](0017-actions.md) keeps `show` and `edit` as built-in `link` actions, and the protocol says a resource lists the built-in actions it enables. But a `link` action needs a `url` or a `route`, and a backend doesn't know the paths of the app: none can declare `edit` so that it opens the app's form. So migrated lists have no buttons left, and the edit form is only reached through the panel of [0028](0028-item-panel.md).

For some resources (orders, users), the panel adds nothing: their users want the title of a row to open the form. [0028](0028-item-panel.md) left "a resource whose show route goes elsewhere" to a property of the protocol, to decide when a project needs it. One does.

## Decision

### The built-in links

- **A backend declares them as `link` actions with their reserved id, and nothing else:**

    ```jsonc
    "actions": [
        { "id": "edit", "kind": "link", "scope": ["item"] },
        { "id": "show", "kind": "link", "scope": ["item"] },
        { "id": "delete", "label": "Delete", "scope": ["item", "selection"], "destructive": true, "confirm": true }
    ]
    ```

    - Without `url` or `route`, the client resolves them to its own routes: `edit` to the item's edit form, `show` to the item (its panel, or its form, see below).
    - With a `url` or a `route`, they go there, as any link: a project can still replace them.
    - `label` and `icon` are optional for these two ids only: the client labels them in its locale ("Edit", "View"; "Modifier", "Voir" in French) and gives them their icons (a pencil, an eye). A label or an icon given by the backend wins.
    - The ids `show` and `edit` are reserved for `link` actions: a definition with `{ "id": "edit", "kind": "server" }` is invalid.

- **Placement:** without `placement`, they are in the rows (`row`), as in v4. They can be placed in `menu` (the overflow menu of a row) or `form`. `edit` is never shown in the edit form, which it opens.
- **Abilities** ([0011](0011-permissions.md)): `edit` is hidden on an item that can't be updated (`abilities.update: false`), and `show` on an item that can't be viewed (`abilities.view: false`). As for every link, `abilities.edit: false` or `abilities.show: false` hides them too, and without abilities they are shown and the backend decides.
- **The panel** ([0028](0028-item-panel.md)) keeps its own link to edit the item, and doesn't repeat `show` and `edit` among its links. When `edit` has a `url`, the panel's link goes there.
- **No implicit actions.** A resource that declares no action gets none: the client adds no `edit` button by itself. The defaults belong to the backend, which writes the definition ([0004](0004-definitions-are-data.md)): `laravel-panneau` declares `edit` on a resource that doesn't list its actions, and its migration tools turn the `show`, `edit` and `delete` buttons of v4 into the same declarations. A definition written before this decision renders as it did.

### What opens an item

- **`open` on a resource** says where an item's title goes, in its list and wherever the app links to the item:
    - `"panel"`, the default: the show route, which opens the item's details in a panel next to the list ([0028](0028-item-panel.md));
    - `"edit"`: the edit form of the item.
- **With `"open": "edit"`, the show route redirects to the edit route** (replacing the entry of the history), so a link to the item, shared or bookmarked, still opens it. The panel is never shown for that resource, and the built-in `show` link is left out, since it would go to the same place as `edit`.
- An item that can't be updated still opens in its form, which the backend answers read-only or with a `403`, as for a link to its edit route.

## Not decided here

- **The show route going to the site** ([0028](0028-item-panel.md)): `open` can take a third value when a project needs it. Clients treat an `open` they don't know as `"panel"`.
- **Labels from the client for the other built-in actions** (`delete`, `duplicate`, `restore`): their labels stay required, since they also title confirmations and results.

## Consequences

- The protocol's `Action` has an optional `label` (required except for `show` and `edit`) and a resource has `open`. The JSON Schema and the OpenAPI document follow. A backend that already declares `edit` with a `url` is unchanged.
- The conformance kit checks that the items of a resource that declares `edit` say whether they can be updated (`abilities.update`), so the UI never shows a button that would fail with `403`.
- `@panneau/core`'s `isActionAllowedOn()` and `getActionPlacements()` know the built-in links. `@panneau/lists` labels them (`getActionLabel()`), and `ListView` takes `getLinkHref` to resolve them: a list without it (outside the app) leaves out links it can't resolve.
- `laravel-panneau` needs `EditAction` and `ShowAction` classes, `open()` on `Resource`, and its Rector rule and upgrade check to keep the v4 buttons of `index()` as actions instead of dropping them.
