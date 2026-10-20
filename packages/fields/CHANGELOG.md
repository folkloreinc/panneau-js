# @panneau/fields

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [4ad084e]
- Updated dependencies [2b657fd]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/intl@5.0.0-alpha.3
  - @panneau/ui@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- 3befc22: Class names are now stable and readable, without a hash, so that projects can target them like Bootstrap's: `.panneau-card`, `.panneau-card-header`, `.panneau-button-sm` (decision 0024). Each package lists its classes in `api/<package>.classes.md`. They are public API.

### Patch Changes

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
  - @panneau/intl@5.0.0-alpha.2

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
