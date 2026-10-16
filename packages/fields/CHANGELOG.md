# @panneau/fields

## 5.0.0-alpha.1

### Major Changes

- e5a3533: Add `@panneau/fields`: controlled fields for the protocol's built-in types (text, textarea, number, boolean, date, datetime, time, select, email, url, color, slug, localized values, group, repeater with typed blocks, relation), one subpath per field. Each subpath also exports the registry entry of its type; `builtInFields` and `fieldsPlugin` gather them, and `FieldsProvider` gives nested fields their components, locales, relation source and a binding to a store by path. `createRelationSource()` searches any adapter with a `list()` method, such as `@panneau/data`'s. `richtext` and `media` render a placeholder until their plugins exist.

### Minor Changes

- 8d1313a: The messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` now live in `@panneau/intl`. `@panneau/ui/locales`, `@panneau/fields/locales` and `@panneau/forms/locales` still export the `en` and `fr` messages of their package, but are deprecated: use `withPanneauMessages()`, `en` or `fr` from `@panneau/intl`, which have the messages of every package. `fieldsPlugin` now carries the French messages of every package, those of `@panneau/forms` included.
- 9c844ee: Relation fields show the labels of values that are only ids (`"12"`), and can create items from the picker. `RelationSource` has two optional methods: `resolve(resource, ids)`, which gives the references of ids (fields that show the same ids share one request), and `create(resource, text)`, with `canCreate(resource)`, which the picker offers as "Create “…”". `createRelationSource()` resolves ids with the adapter's `get()`, and creates items with its `create()` when given `create: true` (the text becomes the `itemTitle`, in every locale when it is localized) or a function that gives the values. `RelationField` takes `onCreate`, which can open a dialog and resolves with the new reference. `useRelationReferences()` resolves references for other components. In `@panneau/lists`, relation filters resolve the labels of ids that come from the URL, for their chips and picker. `@panneau/intl` has the new messages, in English and French.

### Patch Changes

- 2565d67: Add `@panneau/protocol/runtime`: the constants of the protocol and the helpers that run in the browser (`checkValues()`, `checkRules()`, `evaluateCondition()`, `lintDefinition()`, `getValue()`, `isFilled()`, `isProblem()`, `toSearchParams()`, `fromSearchParams()`), without loading zod. The main entry point still exports everything. `isProblem()` no longer uses the `Problem` schema, and accepts the same values. `@panneau/core` and `@panneau/fields` import the helpers from there, so zod (about 360 KB of source) is no longer in the bundles of products that use the forms and lists.
- Updated dependencies [dbab586]
- Updated dependencies [712dfcb]
- Updated dependencies [8d1313a]
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
  - @panneau/protocol@5.0.0-alpha.1
