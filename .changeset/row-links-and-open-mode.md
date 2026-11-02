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
- `@panneau/core`: `getResourceActions()` gives the actions of a resource with its built-in item actions (and without `show` when items open in their form), as `resolveList()` places them: `show` and `edit` in rows, `duplicate` and `delete` in the menu of rows and in forms, `delete` on selections too, so lists are selectable. `isActionAllowedOn()` checks the abilities of the built-in item actions: a declared `show` or `edit` is now hidden on an item without `view: true` or `update: true`. A declared `show` or `edit` with a `url` and no `placement` keeps the placements of item actions. `getOpenMode()` reads `open`.
- `@panneau/intl`: `getActionLabel()` labels an action, and the built-in item actions in the locale: "View", "Edit", "Duplicate", "Delete" ("Voir", "Modifier", "Dupliquer", "Supprimer").
- `@panneau/lists`: `ListView` takes `getLinkHref`, which resolves the built-in links without a URL, and leaves out those it can't resolve. `hasOwnTarget()` says whether a link goes somewhere by itself. `isAllowedOn()` follows the abilities of the built-in item actions.
- `@panneau/data`: `duplicate()` on the data adapter (optional), in the REST adapter, and `useDuplicateItem()`.
- `@panneau/actions`: results and runs label actions with `getActionLabel()`.
- `@panneau/app`: rows link `edit` to the item's form and `show` to its panel, with `duplicate` and `delete` in their menu. `duplicate` copies the item and opens the copy in its form; it is left out with an adapter that can't duplicate. The panel shows "Edit", `duplicate` and `delete` (deleting closes it), and links with a `url` or a `route`; its "Edit" follows a declared `edit`, in a new tab for an external URL. With `"open": "edit"`, titles open the form, and the show route redirects there with its hash, after the `viewAny` check of the list; an item that can't be updated still opens in the panel.
