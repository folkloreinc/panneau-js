# @panneau/intl

## 5.0.0-alpha.2

No changes in this release.

## 5.0.0-alpha.1

### Major Changes

- 8d1313a: Add `@panneau/intl`: the messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` in one place. `withPanneauMessages(locale, messages)` merges the messages of every package for a locale with an app's (`fr-CA` falls back to `fr`), `getPanneauMessages(locale)` returns them, and `en`, `fr` and `panneauMessages` are the catalogs. It also exports the message descriptors (`uiMessages`, `fieldsMessages`, `formsMessages`), typed with the values each message takes. A test checks that every message has a French translation with the same arguments.

### Minor Changes

- 712dfcb: Add `@panneau/actions`: it runs the actions that lists and forms hand over. `ActionRunnerProvider` asks for the parameters of an action in a dialog (with the forms of `@panneau/forms`, client validation and the `422` errors of the action endpoint), runs it through an adapter (`runAction()`, `getActionRun()`, `cancelActionRun()` of a `DataAdapter`), shows its result (a toast with its message and counts, and the items that didn't succeed), calls `onResult` to refresh, opens downloads, follows redirects, and follows queued runs until they end. `useActionRunner(resource)` is the `onAction` of a list; `ActionRuns` lists the runs with their progress. `link` actions go through `onNavigate`, and `client` actions render the handler that a plugin registers. `@panneau/intl` has its messages, in English and French. In `@panneau/lists`, an `onAction` that gives `false` keeps the selection (the action didn't run), and resource actions show in the toolbar of a list that has no search, filters, sorting or layouts.
- Add the messages of `@panneau/lists` (`listsMessages`), in English and French, to the catalogs.

### Patch Changes

- 9c844ee: Relation fields show the labels of values that are only ids (`"12"`), and can create items from the picker. `RelationSource` has two optional methods: `resolve(resource, ids)`, which gives the references of ids (fields that show the same ids share one request), and `create(resource, text)`, with `canCreate(resource)`, which the picker offers as "Create “…”". `createRelationSource()` resolves ids with the adapter's `get()`, and creates items with its `create()` when given `create: true` (the text becomes the `itemTitle`, in every locale when it is localized) or a function that gives the values. `RelationField` takes `onCreate`, which can open a dialog and resolves with the new reference. `useRelationReferences()` resolves references for other components. In `@panneau/lists`, relation filters resolve the labels of ids that come from the URL, for their chips and picker. `@panneau/intl` has the new messages, in English and French.
