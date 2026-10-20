# @panneau/protocol

## 5.0.0-alpha.2

### Minor Changes

- 5af1673: Densities (decision 0024, step 6). `PanneauRoot` takes `density`: `compact`, `comfortable`, `touch`, or `auto` (the default, as before: touch on touch screens). New density tokens `--panneau-control-padding-x` and `--panneau-row-padding-y`. The paddings of buttons, inputs, list box options and list tables now follow the density. Themes redefine each density in `densities`, and `bootstrapTheme` sets Bootstrap's control sizes for the comfortable density only. `@panneau/protocol` adds `densities` to the `Theme` schema and `density` to the definition's theme. Storybook has a density switcher.
- d5cd252: Typed, composable themes (decision 0024, step 3). `@panneau/ui` adds `defineTheme()`, which type-checks token names, builds on other themes with `extends` and reports unknown tokens, a `palette` for themes (`--panneau-palette-<name>`), `mergeThemes()`, `findUnknownTokens()`, `SEMANTIC_TOKENS` and `PanneauTokens` for a project's own tokens. `@panneau/protocol` adds the `Theme` schema, `theme.schema.json` and `mergeThemes()`, and `definition.theme` now carries a theme that extends themes of plugins by id. The `Theme` of `@panneau/core` plugins is now that of the protocol, and `resolveTheme()` merges the theme of a definition.
- 27a1e08: Typography roles and fonts in themes (decision 0024, step 4). `@panneau/ui` adds the font roles `--panneau-font-family-body`, `-heading` and `-display` (`--panneau-font-family` is now a deprecated alias of the body family), `--panneau-font-numeric`, the `Heading` component with its size tokens (1 to 4, `display-1`, `display-2`), `Text`, and an opt-in `Prose` container for rich content. Themes take `fonts`, font faces or hosted stylesheets, which `PanneauRoot` adds to the page once. `bootstrapTheme` now sets the body family. `@panneau/protocol` adds `fonts` to the `Theme` schema. Numbers in fields and lists use `--panneau-font-numeric`.

## 5.0.0-alpha.1

### Major Changes

- 83999da: Add `@panneau/protocol`, the contract between Panneau frontends and backends.

### Minor Changes

- 345e06c: Add the boot config, which a server writes in the page of the app (`<script type="application/json" id="panneau-boot">`): the `BootConfig` schema and type (`protocol`, `apiBaseUrl`, `basePath`, `locale`, an optional inlined `definition` and `loginUrl`), `validateBootConfig()`, `BOOT_CONFIG_ELEMENT_ID`, `createBootConfigJsonSchema()` and the generated `@panneau/protocol/boot.schema.json`.
- 632b700: Export `createExampleDefinition()` from `@panneau/protocol/mock`: the example definition of the protocol's tests (pages with localized titles, a status, a conditional publication date, an author and typed blocks, in tabs and a sidebar), for the tests and stories of frontends with `createMockBackend()`.
- 2565d67: Add `@panneau/protocol/runtime`: the constants of the protocol and the helpers that run in the browser (`checkValues()`, `checkRules()`, `evaluateCondition()`, `lintDefinition()`, `getValue()`, `isFilled()`, `isProblem()`, `toSearchParams()`, `fromSearchParams()`), without loading zod. The main entry point still exports everything. `isProblem()` no longer uses the `Problem` schema, and accepts the same values. `@panneau/core` and `@panneau/fields` import the helpers from there, so zod (about 360 KB of source) is no longer in the bundles of products that use the forms and lists.
- 61da236: Add the protocol schemas and their types, definition validation and lint, the portable rules, list query helpers, the generated JSON Schema and OpenAPI files, an in-memory mock backend and the conformance kit.
- b3c9d6c: Range filters (`date-range`) send their bounds as their own keys: `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`, both inclusive, with an open end left out. `FilterValue` can be a `FilterRange` (`{ from?, to? }`), which `toSearchParams()` and `fromSearchParams()` read and write, and the protocol adds `isFilterRange()` and `matchesFilterRange()`, the reference of how a backend reads the bounds. The mock backend filters by ranges, and the conformance kit checks that a backend reads the bounds of a resource's `date-range` filter. `@panneau/lists` sends a date range as a `FilterRange` instead of `[from, to]` with an empty string for an open end, and filters items in memory by ranges. `@panneau/core` drops an empty range from the query.

### Patch Changes

- 2401025: Keep recursive schemas typed in the published declarations: `Condition.all` and `any`, `Field.fields` and `types`, `BlockType.fields`, `LayoutNode.children` and `MenuItem.children` were typed as `Record<string, unknown>[]` instead of their own type.
- aa02ea8: Add a `@panneau/source` export condition that points to the sources, used by the other workspace packages in tests and typechecks. Published consumers are not affected.
