# @panneau/actions

## 5.0.0-alpha.12

### Patch Changes

- Updated dependencies [0a8447e]
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/forms@5.0.0-alpha.12
  - @panneau/core@5.0.0-alpha.12
  - @panneau/data@5.0.0-alpha.12
  - @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- Updated dependencies [84bab2b]
  - @panneau/ui@5.0.0-alpha.11
  - @panneau/forms@5.0.0-alpha.11
  - @panneau/core@5.0.0-alpha.11
  - @panneau/data@5.0.0-alpha.11
  - @panneau/intl@5.0.0-alpha.11
  - @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Patch Changes

- 68f5322: Lists have the `show`, `edit` and `delete` buttons of v4 again, and `duplicate`: every resource has these four item actions without declaring them, shown on the items whose abilities allow them. A resource can also open its items in their form instead of the panel (decision 0040).
  
  - `@panneau/protocol`:
      - The built-in item actions `show`, `edit`, `duplicate` and `delete` need their ability on an item: `view`, `update`, `duplicate`, `delete`. A missing or false ability hides them. A resource picks some of them, in its order, with `itemActions` (`["edit", "delete"]`, `[]` for none). A declared action with one of these ids replaces the built-in one, takes its `placement`, `confirm`, `destructive` and `dryRun` when it doesn't set them, and its `label` is optional. The id set to `false` hides the action too (`"edit": false`). An item without abilities shows none of the four.
      - The ids `show` and `edit` are reserved for `link` actions; every other action needs a `label`. The generated JSON Schema and OpenAPI document check both with `if`/`then`, and also that a `link` has a `url` or a `route` and a `client` action a `component`, as the Zod schemas do.
      - `POST /resources/{resource}/{id}/duplicate` copies an item, and answers `201` with the copy, or a `409` problem when the copy conflicts with another item (a unique value).
      - A resource takes `open`: `panel` (the default) or `edit`, where an item's title goes.
      - `BUILT_IN_ITEM_ACTIONS`, `ITEM_ACTION_ABILITIES`, `isBuiltInItemAction()`, `BUILT_IN_LINK_ACTIONS` and `isBuiltInLink()` are in the runtime entry point.
      - The mock backend allows the four on its items, duplicates items, and answers dry runs of the built-in `delete`. It reads abilities as clients do: a missing ability doesn't allow an action, in dry runs, in `delete` (skipped items are reported, and the only item of an item action is a `403`) and in `duplicate` (`403`). Its example definition shows `itemActions` and `open`.
      - The conformance kit checks that the built-in `delete` answers a dry run without being declared (`action.delete`) and, with `writes`, the duplication of an item that allows it, with the `ETag` of the copy (`duplicate`).
  - `@panneau/core`: `getItemActions(resource, item, surface)` decides the actions of an item on each surface, `row`, `menu`, `panel` and `form`, each with its link or to run: the built-in item actions (from `itemActions`, replaced by declared ones with their ids), then the declared actions, by their placement and the item's abilities, without the one that leads to the surface (no `show` in the panel, no `edit` in the form). `form` is the header of the item, in its panel and its form, so an item shows the same actions in its row, its panel and its form. `selectItemActions()` does the same with actions already placed, and `fillActionUrl()` fills a URL template. `getResourceActions()` gives the actions of a resource with its built-in item actions (and without `show` when items open in their form): `show` and `edit` in rows and headers, `duplicate` and `delete` in the menu of rows and headers, `delete` on selections too, so lists are selectable. `isActionAllowedOn()` checks the abilities of the built-in item actions, also on an item without abilities, which shows none of them: a declared `show` or `edit` is now hidden on an item without `view: true` or `update: true`. `getOpenMode()` reads `open`.
  - `@panneau/intl`: `getActionLabel()` labels an action, and the built-in item actions in the locale: "View", "Edit", "Duplicate", "Delete" ("Voir", "Modifier", "Dupliquer", "Supprimer").
  - `@panneau/lists`: rows and their menu show the actions of `selectItemActions()`. `ListView` takes `getLinkHref`, which resolves the built-in links and the links with a `route`, and leaves out the built-in links it can't resolve. `isAllowedOn()` follows the abilities of the built-in item actions.
  - `@panneau/data`: `duplicate()` on the data adapter (optional), in the REST adapter, and `useDuplicateItem()`.
  - `@panneau/actions`: results and runs label actions with `getActionLabel()`.
  - `@panneau/app`: rows, their menu, the panel and the edit form show the actions of `getItemActions()`, and the panel and the form with the same component: "Edit", "Duplicate", "Delete" and the declared links in the panel, "View", "Duplicate", "Delete" and the declared links in the form. The panel now shows only the actions placed in `form`, as the form does; links with a `route` are links in rows too, and links outside the admin open in a new tab. `duplicate` asks first when a form has unsaved changes, then copies the item and opens the copy in its form; it is left out with an adapter that can't duplicate. Deleting from the panel closes it. The links of the panel's header have the class of the edit page's (`.panneau-pages-action-link`): `.panneau-item-panel-action` is gone. With `"open": "edit"`, titles open the form, and the show route redirects there with its hash, after the `viewAny` check of the list; an item that can't be updated still opens in the panel. While the item loads, the show route shows nothing rather than the list for an instant.
- Updated dependencies [810fc90]
- Updated dependencies [2fcd438]
- Updated dependencies [68f5322]
  - @panneau/protocol@5.0.0-alpha.10
  - @panneau/core@5.0.0-alpha.10
  - @panneau/forms@5.0.0-alpha.10
  - @panneau/intl@5.0.0-alpha.10
  - @panneau/data@5.0.0-alpha.10
  - @panneau/ui@5.0.0-alpha.10

## 5.0.0-alpha.9

### Patch Changes

- Updated dependencies [a49284e]
- Updated dependencies [30f227f]
- Updated dependencies [33a2779]
- Updated dependencies [2a6cf2a]
- Updated dependencies [ca1aa46]
  - @panneau/ui@5.0.0-alpha.9
  - @panneau/protocol@5.0.0-alpha.9
  - @panneau/core@5.0.0-alpha.9
  - @panneau/intl@5.0.0-alpha.9
  - @panneau/forms@5.0.0-alpha.9
  - @panneau/data@5.0.0-alpha.9

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/core@5.0.0-alpha.8
  - @panneau/data@5.0.0-alpha.8
  - @panneau/forms@5.0.0-alpha.8
  - @panneau/intl@5.0.0-alpha.8
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Patch Changes

- Updated dependencies [9c6c087]
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
- Updated dependencies [fb534de]
  - @panneau/forms@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
  - @panneau/core@5.0.0-alpha.7
  - @panneau/data@5.0.0-alpha.7

## 5.0.0-alpha.6

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/data@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6
  - @panneau/forms@5.0.0-alpha.6

## 5.0.0-alpha.5

### Patch Changes

- 282e968: The `Parameters` story of the action runner waits for the "This field is required." error to be visible, instead of checking it once while its dialog may still be entering. Tests only: no change for users.
- Updated dependencies [3830b4f]
- Updated dependencies [bdb1173]
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [eadfc08]
- Updated dependencies [f2c79b5]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [6d1f1d8]
- Updated dependencies [8372b27]
- Updated dependencies [199a687]
- Updated dependencies [fb33783]
- Updated dependencies [5779047]
- Updated dependencies [5b9aa44]
- Updated dependencies [5b2f3ce]
  - @panneau/core@5.0.0-alpha.5
  - @panneau/forms@5.0.0-alpha.5
  - @panneau/intl@5.0.0-alpha.5
  - @panneau/protocol@5.0.0-alpha.5
  - @panneau/data@5.0.0-alpha.5
  - @panneau/ui@5.0.0-alpha.5

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/data@5.0.0-alpha.4
  - @panneau/forms@5.0.0-alpha.4
  - @panneau/intl@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4
  - @panneau/ui@5.0.0-alpha.4

## 5.0.0-alpha.3

### Minor Changes

- 5a2ae0c: Dry runs of actions, so that a list can say how many items of a query selection ("Select all N items") an action will skip before the user confirms it. In the protocol, an action declares `dryRun`, and a request with `"dryRun": true` answers an action result without running anything; the mock backend answers them, and the conformance kit checks them (`action.dry-run`). `@panneau/actions` adds `useActionPreview()` and `previewAction()`, and `ListView` takes a `previewAction`: its confirmation shows that it is checking, then the backend's count, and runs at once when nothing is skipped and the action asks no confirmation.

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [3c68628]
- Updated dependencies [4ad084e]
- Updated dependencies [2b657fd]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/intl@5.0.0-alpha.3
  - @panneau/data@5.0.0-alpha.3
  - @panneau/ui@5.0.0-alpha.3
  - @panneau/core@5.0.0-alpha.3
  - @panneau/forms@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- 3befc22: Class names are now stable and readable, without a hash, so that projects can target them like Bootstrap's: `.panneau-card`, `.panneau-card-header`, `.panneau-button-sm` (decision 0024). Each package lists its classes in `api/<package>.classes.md`. They are public API.

### Patch Changes

- Updated dependencies [deb08a8]
- Updated dependencies [8c15647]
- Updated dependencies [5af1673]
- Updated dependencies [1a76a03]
- Updated dependencies [f86c757]
- Updated dependencies [3befc22]
- Updated dependencies [3b5c39f]
- Updated dependencies [7ee3af3]
- Updated dependencies [e4cb313]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/ui@5.0.0-alpha.2
  - @panneau/protocol@5.0.0-alpha.2
  - @panneau/forms@5.0.0-alpha.2
  - @panneau/core@5.0.0-alpha.2
  - @panneau/data@5.0.0-alpha.2
  - @panneau/intl@5.0.0-alpha.2

## 5.0.0-alpha.1

### Minor Changes

- 712dfcb: Add `@panneau/actions`: it runs the actions that lists and forms hand over. `ActionRunnerProvider` asks for the parameters of an action in a dialog (with the forms of `@panneau/forms`, client validation and the `422` errors of the action endpoint), runs it through an adapter (`runAction()`, `getActionRun()`, `cancelActionRun()` of a `DataAdapter`), shows its result (a toast with its message and counts, and the items that didn't succeed), calls `onResult` to refresh, opens downloads, follows redirects, and follows queued runs until they end. `useActionRunner(resource)` is the `onAction` of a list; `ActionRuns` lists the runs with their progress. `link` actions go through `onNavigate`, and `client` actions render the handler that a plugin registers. `@panneau/intl` has its messages, in English and French. In `@panneau/lists`, an `onAction` that gives `false` keeps the selection (the action didn't run), and resource actions show in the toolbar of a list that has no search, filters, sorting or layouts.

### Patch Changes

- Updated dependencies [dbab586]
- Updated dependencies [712dfcb]
- Updated dependencies [b1d02aa]
- Updated dependencies [de03e3d]
- Updated dependencies [3e4f251]
- Updated dependencies [8d1313a]
- Updated dependencies [dfb0b1f]
- Updated dependencies [632b700]
- Updated dependencies
- Updated dependencies [8d1313a]
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [9c844ee]
- Updated dependencies [daf7c87]
- Updated dependencies [56a9917]
- Updated dependencies [10aaed0]
- Updated dependencies [aa02ea8]
  - @panneau/ui@5.0.0-alpha.1
  - @panneau/intl@5.0.0-alpha.1
  - @panneau/core@5.0.0-alpha.1
  - @panneau/data@5.0.0-alpha.1
  - @panneau/forms@5.0.0-alpha.1
  - @panneau/protocol@5.0.0-alpha.1
