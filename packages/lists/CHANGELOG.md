# @panneau/lists

## 5.0.0-alpha.3

### Minor Changes

- 5a2ae0c: Dry runs of actions, so that a list can say how many items of a query selection ("Select all N items") an action will skip before the user confirms it. In the protocol, an action declares `dryRun`, and a request with `"dryRun": true` answers an action result without running anything; the mock backend answers them, and the conformance kit checks them (`action.dry-run`). `@panneau/actions` adds `useActionPreview()` and `previewAction()`, and `ListView` takes a `previewAction`: its confirmation shows that it is checking, then the backend's count, and runs at once when nothing is skipped and the action asks no confirmation.

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [4ad084e]
- Updated dependencies [2b657fd]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/intl@5.0.0-alpha.3
  - @panneau/ui@5.0.0-alpha.3
  - @panneau/core@5.0.0-alpha.3
  - @panneau/fields@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- 3befc22: Class names are now stable and readable, without a hash, so that projects can target them like Bootstrap's: `.panneau-card`, `.panneau-card-header`, `.panneau-button-sm` (decision 0024). Each package lists its classes in `api/<package>.classes.md`. They are public API.

### Patch Changes

- 5af1673: Densities (decision 0024, step 6). `PanneauRoot` takes `density`: `compact`, `comfortable`, `touch`, or `auto` (the default, as before: touch on touch screens). New density tokens `--panneau-control-padding-x` and `--panneau-row-padding-y`. The paddings of buttons, inputs, list box options and list tables now follow the density. Themes redefine each density in `densities`, and `bootstrapTheme` sets Bootstrap's control sizes for the comfortable density only. `@panneau/protocol` adds `densities` to the `Theme` schema and `density` to the definition's theme. Storybook has a density switcher.
- f86c757: Global element rules of a site, such as Bootstrap's Reboot, no longer leak into Panneau: a `h5` card title no longer gets `margin-bottom: 0.5rem`, legends no longer float, and dividers are no longer faded. The reset of the root now weighs two element selectors, more than a site's element rules and less than any class, and components reset the elements they render (titles, legends, paragraphs, lists, rules) in their own classes.
- 27a1e08: Typography roles and fonts in themes (decision 0024, step 4). `@panneau/ui` adds the font roles `--panneau-font-family-body`, `-heading` and `-display` (`--panneau-font-family` is now a deprecated alias of the body family), `--panneau-font-numeric`, the `Heading` component with its size tokens (1 to 4, `display-1`, `display-2`), `Text`, and an opt-in `Prose` container for rich content. Themes take `fonts`, font faces or hosted stylesheets, which `PanneauRoot` adds to the page once. `bootstrapTheme` now sets the body family. `@panneau/protocol` adds `fonts` to the `Theme` schema. Numbers in fields and lists use `--panneau-font-numeric`.
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
  - @panneau/fields@5.0.0-alpha.2
  - @panneau/core@5.0.0-alpha.2
  - @panneau/intl@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 7274cad: Add `@panneau/lists`, which renders the list state of `@panneau/core`. `ListView` renders a list made with `useList()` and the items of its query; `List` does the same for items held in memory, from columns and items, with or without a definition. Lists have columns with displays (a registry entry per display, extended by plugins), table and cards layouts that turn into stacked rows on phones, sorting, search, filter controls with chips for the active filters, pagination, selection of ids or of every matching item with exceptions, and row and toolbar actions with confirmations, hidden when the user or the item doesn't allow them. Messages are in English and French, in `@panneau/intl`.

### Minor Changes

- dbab586: Icons by name. `getNamedIcon(name)` of `@panneau/ui` turns a Lucide icon name (`"send"`) into an icon component, which loads that icon the first time it renders (one dynamic import per icon), with an empty space of the same size until then. `loadNamedIcon(name)` loads one ahead of time. `@panneau/lists` shows the icon an action names (`"icon": "send"`), and takes icon components by action id for actions written in code (`actionIcons={{ archive: Archive }}` on `ListView` and `List`), which win over names. `getActionIcon()` and `ActionIcons` are exported.
- b3c9d6c: Range filters (`date-range`) send their bounds as their own keys: `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`, both inclusive, with an open end left out. `FilterValue` can be a `FilterRange` (`{ from?, to? }`), which `toSearchParams()` and `fromSearchParams()` read and write, and the protocol adds `isFilterRange()` and `matchesFilterRange()`, the reference of how a backend reads the bounds. The mock backend filters by ranges, and the conformance kit checks that a backend reads the bounds of a resource's `date-range` filter. `@panneau/lists` sends a date range as a `FilterRange` instead of `[from, to]` with an empty string for an open end, and filters items in memory by ranges. `@panneau/core` drops an empty range from the query.
- 9c844ee: Relation fields show the labels of values that are only ids (`"12"`), and can create items from the picker. `RelationSource` has two optional methods: `resolve(resource, ids)`, which gives the references of ids (fields that show the same ids share one request), and `create(resource, text)`, with `canCreate(resource)`, which the picker offers as "Create “…”". `createRelationSource()` resolves ids with the adapter's `get()`, and creates items with its `create()` when given `create: true` (the text becomes the `itemTitle`, in every locale when it is localized) or a function that gives the values. `RelationField` takes `onCreate`, which can open a dialog and resolves with the new reference. `useRelationReferences()` resolves references for other components. In `@panneau/lists`, relation filters resolve the labels of ids that come from the URL, for their chips and picker. `@panneau/intl` has the new messages, in English and French.

### Patch Changes

- 712dfcb: Add `@panneau/actions`: it runs the actions that lists and forms hand over. `ActionRunnerProvider` asks for the parameters of an action in a dialog (with the forms of `@panneau/forms`, client validation and the `422` errors of the action endpoint), runs it through an adapter (`runAction()`, `getActionRun()`, `cancelActionRun()` of a `DataAdapter`), shows its result (a toast with its message and counts, and the items that didn't succeed), calls `onResult` to refresh, opens downloads, follows redirects, and follows queued runs until they end. `useActionRunner(resource)` is the `onAction` of a list; `ActionRuns` lists the runs with their progress. `link` actions go through `onNavigate`, and `client` actions render the handler that a plugin registers. `@panneau/intl` has its messages, in English and French. In `@panneau/lists`, an `onAction` that gives `false` keeps the selection (the action didn't run), and resource actions show in the toolbar of a list that has no search, filters, sorting or layouts.
- Updated dependencies [dbab586]
- Updated dependencies [712dfcb]
- Updated dependencies [b1d02aa]
- Updated dependencies [8d1313a]
- Updated dependencies [e5a3533]
- Updated dependencies [dfb0b1f]
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
  - @panneau/fields@5.0.0-alpha.1
  - @panneau/protocol@5.0.0-alpha.1
