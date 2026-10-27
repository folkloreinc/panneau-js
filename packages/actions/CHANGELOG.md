# @panneau/actions

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
