# @panneau/core

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
  - @panneau/protocol@5.0.0-alpha.4

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
  - @panneau/protocol@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- d5cd252: Typed, composable themes (decision 0024, step 3). `@panneau/ui` adds `defineTheme()`, which type-checks token names, builds on other themes with `extends` and reports unknown tokens, a `palette` for themes (`--panneau-palette-<name>`), `mergeThemes()`, `findUnknownTokens()`, `SEMANTIC_TOKENS` and `PanneauTokens` for a project's own tokens. `@panneau/protocol` adds the `Theme` schema, `theme.schema.json` and `mergeThemes()`, and `definition.theme` now carries a theme that extends themes of plugins by id. The `Theme` of `@panneau/core` plugins is now that of the protocol, and `resolveTheme()` merges the theme of a definition.

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- b1d02aa: Add `@panneau/core`: the plugin registry (`definePlugin`, `PanneauProvider`), the definition engine (`resolveForm`, `resolveList`, abilities), form state behind a `FormStore` (dot-path values, dirty tracking, portable-rule validation, server errors, visibility, submit with version conflicts), list state (query, selection, URL sync through a `Router`) and their React hooks (`useForm`, `useFormField`, `useList`, `usePlugins`, `useResource`).

### Minor Changes

- dfb0b1f: Add pure selectors of a form state to `@panneau/core`: `selectValue(state, path)`, `selectErrors(state, path, { nested })`, `selectErrorCount(state, paths)` and `selectVisible(state, target, parentPath)`. Components read the state they subscribed to with them. The form's reading methods (`getValue()`, `getErrors()`, `countErrors()`, `isVisible()`) are now documented as non-React APIs: the React Compiler memoizes their calls by their arguments, so they return stale results in components. `@panneau/forms` uses the selectors of `@panneau/core` instead of its own.

### Patch Changes

- 2565d67: Add `@panneau/protocol/runtime`: the constants of the protocol and the helpers that run in the browser (`checkValues()`, `checkRules()`, `evaluateCondition()`, `lintDefinition()`, `getValue()`, `isFilled()`, `isProblem()`, `toSearchParams()`, `fromSearchParams()`), without loading zod. The main entry point still exports everything. `isProblem()` no longer uses the `Problem` schema, and accepts the same values. `@panneau/core` and `@panneau/fields` import the helpers from there, so zod (about 360 KB of source) is no longer in the bundles of products that use the forms and lists.
- b3c9d6c: Range filters (`date-range`) send their bounds as their own keys: `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`, both inclusive, with an open end left out. `FilterValue` can be a `FilterRange` (`{ from?, to? }`), which `toSearchParams()` and `fromSearchParams()` read and write, and the protocol adds `isFilterRange()` and `matchesFilterRange()`, the reference of how a backend reads the bounds. The mock backend filters by ranges, and the conformance kit checks that a backend reads the bounds of a resource's `date-range` filter. `@panneau/lists` sends a date range as a `FilterRange` instead of `[from, to]` with an empty string for an open end, and filters items in memory by ranges. `@panneau/core` drops an empty range from the query.
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/protocol@5.0.0-alpha.1
