---
'@panneau/protocol': minor
'@panneau/core': minor
'@panneau/intl': minor
'@panneau/lists': minor
'@panneau/data': minor
'@panneau/actions': patch
'@panneau/app': minor
---

Lists have the `show`, `edit` and `delete` buttons of v4 again, and `duplicate`: every resource has these four item actions without declaring them, shown on the items whose abilities allow them. A resource can also open its items in their form instead of the panel (decision 0040).

- `@panneau/protocol`:
    - The built-in item actions `show`, `edit`, `duplicate` and `delete` need their ability on an item: `view`, `update`, `duplicate`, `delete`. A missing or false ability hides them. A resource picks some of them, in its order, with `itemActions` (`["edit", "delete"]`, `[]` for none). A declared action with one of these ids replaces the built-in one, and its `label` is optional.
    - The ids `show` and `edit` are reserved for `link` actions; every other action needs a `label`. The generated JSON Schema and OpenAPI document check both with `if`/`then`, and also that a `link` has a `url` or a `route` and a `client` action a `component`, as the Zod schemas do.
    - `POST /resources/{resource}/{id}/duplicate` copies an item, and answers `201` with the copy.
    - A resource takes `open`: `panel` (the default) or `edit`, where an item's title goes.
    - `BUILT_IN_ITEM_ACTIONS`, `ITEM_ACTION_ABILITIES`, `isBuiltInItemAction()`, `BUILT_IN_LINK_ACTIONS` and `isBuiltInLink()` are in the runtime entry point.
    - The mock backend allows the four on its items, duplicates items, and answers dry runs of the built-in `delete`. With `writes`, the conformance kit checks the duplication of an item that allows it. Its example definition shows `itemActions` and `open`.
- `@panneau/core`: `getItemActions(resource, item, surface)` decides the actions of an item on each surface, `row`, `menu`, `panel` and `form`, each with its link or to run: the built-in item actions (from `itemActions`, replaced by declared ones with their ids), then the declared actions, by their placement and the item's abilities, without the one that leads to the surface (no `show` in the panel, no `edit` in the form). `form` is the header of the item, in its panel and its form, so an item shows the same actions in its row, its panel and its form. `selectItemActions()` does the same with actions already placed, and `fillActionUrl()` fills a URL template. `getResourceActions()` gives the actions of a resource with its built-in item actions (and without `show` when items open in their form): `show` and `edit` in rows and headers, `duplicate` and `delete` in the menu of rows and headers, `delete` on selections too, so lists are selectable. `isActionAllowedOn()` checks the abilities of the built-in item actions: a declared `show` or `edit` is now hidden on an item without `view: true` or `update: true`. `getOpenMode()` reads `open`.
- `@panneau/intl`: `getActionLabel()` labels an action, and the built-in item actions in the locale: "View", "Edit", "Duplicate", "Delete" ("Voir", "Modifier", "Dupliquer", "Supprimer").
- `@panneau/lists`: rows and their menu show the actions of `selectItemActions()`. `ListView` takes `getLinkHref`, which resolves the built-in links and the links with a `route`, and leaves out the built-in links it can't resolve. `isAllowedOn()` follows the abilities of the built-in item actions.
- `@panneau/data`: `duplicate()` on the data adapter (optional), in the REST adapter, and `useDuplicateItem()`.
- `@panneau/actions`: results and runs label actions with `getActionLabel()`.
- `@panneau/app`: rows, their menu, the panel and the edit form show the actions of `getItemActions()`, and the panel and the form with the same component: "Edit", "Duplicate", "Delete" and the declared links in the panel, "View", "Duplicate", "Delete" and the declared links in the form. The panel now shows only the actions placed in `form`, as the form does; links with a `route` are links in rows too, and links outside the admin open in a new tab. `duplicate` copies the item and opens the copy in its form; it is left out with an adapter that can't duplicate. Deleting from the panel closes it. With `"open": "edit"`, titles open the form, and the show route redirects there with its hash, after the `viewAny` check of the list; an item that can't be updated still opens in the panel.
