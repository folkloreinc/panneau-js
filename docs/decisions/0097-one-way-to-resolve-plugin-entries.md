# 0097: One way to resolve plugin entries

- Status: accepted
- Date: 2026-11-19
- Changes: the registry entries of lists ([0022](0022-lists-render-core-state.md)), and the built-in widget types of the dashboard ([0064](0064-dashboard-widgets.md))

## Context

A plugin (`PanneauPlugin`, `packages/core/src/plugins.ts`) gives components by kind (`fields`, `displays`, `listLayouts`, `actions`, `pages`, `widgets`, `components`, `panels`, `previews`), and data for three more (`commands`, `locales`, `themes`). `createPluginRegistry()` merges them into one `Map` per kind, a later plugin over an earlier one. Each package then reads its kinds its own way ([#350](https://github.com/folkloreinc/panneau-js/issues/350)):

- **Untyped entries.** `PluginComponent` is `ComponentType<any>`, so every reader casts. Examples: `Object.fromEntries(plugins.fields) as Record<string, FieldEntry>` (`packages/forms/src/FormView.tsx`), `plugins.displays` (`packages/lists/src/useRenderValue.tsx`), `plugins.panels as ReadonlyMap<string, FormPanelComponent>` (`FormView.tsx`), `plugins.actions.get(name) as ClientActionHandler | undefined` (`packages/actions/src/ActionRunnerProvider.tsx`). A plugin can register a component with the wrong props, and nothing says so.
- **Five different precedences.**

    | Kind                 | Read in                                | Order, last wins                                                                                  |
    | -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
    | `fields`             | `forms/src/FormView.tsx`               | built-ins (`builtInFields`), plugins, props (`components`)                                        |
    | `panels`             | `forms/src/FormView.tsx`               | built-ins (`builtInPanels`), plugins, props (`panels`)                                            |
    | `displays`           | `lists/src/useRenderValue.tsx`         | built-ins (`builtInDisplays`), plugins, props (`displays`)                                        |
    | `listLayouts`        | `lists/src/layouts/resolve.ts`         | built-ins (`builtInLayouts`), plugins, props (`layoutComponents`)                                 |
    | `actions`            | `actions/src/ActionRunnerProvider.tsx` | plugins, props (`clientActions`); no built-ins                                                    |
    | `pages`              | `app/src/Shell.tsx`                    | plugins, then the built-in `dashboard` only when no plugin has it                                 |
    | `widgets`            | `app/src/dashboard/Dashboard.tsx`      | the built-in types win: a `switch` on `stat`, `series`, `list`, `breakdown`, `metric` and `table` |
    | `previews`           | `app/src/pages/ItemPreview.tsx`        | plugins only                                                                                      |
    | `components`         | `forms/src/layout/Layout.tsx`          | plugins only                                                                                      |
    | filters (not a kind) | `lists/src/filters/Filters.tsx`        | props (`filterControls`), built-ins (`builtInFilters`), then `text`; `app` never passes the prop  |

    A project can't tell from the docs what it may replace. A plugin's `stat` widget is never drawn. A project's own filter type falls back to a text input without a word.

- **Props types in six packages, one missing.** `WidgetProps` (`core/src/widget.ts`), `PreviewProps` (`core/src/preview.ts`), `FieldEntryProps` (`fields/src/shared/types.ts`), `DisplayProps`, `ListLayoutProps` and `FilterControlProps` (`lists/src/types.ts`), `LayoutComponentProps` (`forms/src/layout/Layout.tsx`), `FormPanelProps` (`forms/src/panels/panels.tsx`), `ClientActionProps` (`actions/src/types.ts`). The props of a page are a private `PageProps` in `app/src/Shell.tsx`.
- **Built-in plugins differ.** Ids: `panneau-fields`, `panneau-lists`, `panneau-media`, `panneau-editor`, against `panneau.credits`, `panneau.sessions` and `panneau.publication`. Typing: an explicit object type (`fieldsPlugin`, `listsPlugin`, `mediaPlugin`), an inferred object (`creditsPlugin`, `publicationPlugin`), or an interface of its own (`EditorPlugin`, made by `createEditorPlugin()`); none goes through `definePlugin()`. The README of `@panneau/core` leaves out `panels`, `previews` and `commands`.

## Decision

### Kinds typed through declaration merging

- **`@panneau/core` declares an empty map of kinds**, and each package adds the kinds it renders, with the type of their entries, by augmenting it:

    ```ts
    // @panneau/core
    export interface PluginKinds {}
    export type PluginKind = keyof PluginKinds;

    // @panneau/fields
    declare module '@panneau/core' {
        interface PluginKinds {
            fields: FieldEntry;
        }
    }
    ```

    | Kind          | Entry                                 | Declared by        |
    | ------------- | ------------------------------------- | ------------------ |
    | `fields`      | `FieldEntry` (`FieldEntryProps`)      | `@panneau/fields`  |
    | `displays`    | `DisplayEntry` (`DisplayProps`)       | `@panneau/lists`   |
    | `listLayouts` | `ListLayoutEntry` (`ListLayoutProps`) | `@panneau/lists`   |
    | `filters`     | `FilterEntry` (`FilterControlProps`)  | `@panneau/lists`   |
    | `actions`     | `ClientActionHandler`                 | `@panneau/actions` |
    | `components`  | `ComponentType<LayoutComponentProps>` | `@panneau/forms`   |
    | `panels`      | `FormPanelComponent`                  | `@panneau/forms`   |
    | `widgets`     | `ComponentType<WidgetProps>`          | `@panneau/core`    |
    | `previews`    | `ComponentType<PreviewProps>`         | `@panneau/core`    |
    | `pages`       | `ComponentType<PageProps>`            | `@panneau/core`    |

- **The map types entries, not their props**: a field entry also carries what lists read from it (the `summarize` of a compound field, [0065](0065-compound-fields.md)), which a map of props would have to type apart.
- **`PanneauPlugin` and `PluginRegistry` derive from the map**: `{ [K in PluginKind]?: Record<string, PluginKinds[K]> }`, and `ReadonlyMap<string, PluginKinds[K]>` for each kind, beside `commands`, `locales` and `themes`. `PluginComponent` and the casts go. A plugin that gives a field with the props of a display fails to type-check where it is declared.
- **The kinds a project sees are those of the packages it imports**: an app that only uses `@panneau/fields` and `@panneau/forms` has no `widgets`. A kind no package declares can't be given.
- `PageProps` moves to `@panneau/core`, beside `WidgetProps` and `PreviewProps`, and is exported: the values of the page's `props`, its `params`, and the definition.

### One `resolveEntry()`, one precedence

- **`@panneau/core` resolves every kind the same way**, through one function and its hook:

    ```ts
    resolveEntry(registry, kind, type, { builtIn, overrides }): PluginKinds[kind] | undefined;
    getEntries(registry, kind, { builtIn, overrides }): ReadonlyMap<string, PluginKinds[kind]>;
    useEntry(kind, type, options); useEntries(kind, options);
    ```

    `getEntries()` is for the readers that need every entry of a kind: the layout switch of a list, the menu of panels.

- **One order for every kind, the last wins: built-ins, then plugins in their order, then the props of the component that renders them** (`components` of `Form`, `displays`, `layoutComponents` and `filterControls` of `ListView`, `clientActions` of `ActionRunnerProvider`). It is the order of `fields`, `displays`, `listLayouts` and `actions` today: a page that renders a `Form` with its own `components` means them, over what any plugin registers. For `actions`, `previews` and `components`, which have no built-ins, nothing changes. For `pages`, a plugin's `dashboard` keeps replacing the built-in one.
- **A missing entry is `undefined`**, and each kind keeps saying what it draws in its place, as today (a field as text, a page or a preview as a warning, a widget as an empty card). In development, `resolveEntry()` warns once per kind and type, so that a filter that falls back to `text` no longer does it silently.
- The built-ins stay where they are (`builtInFields`, `builtInDisplays`…) and are passed as `builtIn`: a project that uses one package doesn't load the registries of the others. `fieldsPlugin`, `listsPlugin` and the others stay, for projects that register the built-ins as plugins: same entries, same result.

### A `filters` kind

- **Filter controls are a kind**, keyed by filter type, with `FilterControlProps`. `ListView` resolves them with `builtInFilters` and its `filterControls` prop. A project's own filter type (a `region` filter, a `tree` of categories) is a plugin entry, and the list page of `app` draws it without passing anything.
- An unknown filter type still falls back to `text`, with the warning above.

### A registry of built-in widgets

- **`builtInWidgets` replaces the `switch` of `app/src/dashboard/Dashboard.tsx`**: `{ stat, series, list, breakdown, metric, table }`, each a component with `WidgetProps` and what it needs of the dashboard (its period, its currency), in `@panneau/app`.
- **A plugin can replace a built-in widget type** (`stat`), as it can replace a field. This amends 0064, where the built-in types stayed built in and the `dashboard` page was what a plugin replaced. The data of a built-in type is still checked against the protocol's schema of that type (`checkWidgetData()`) before the widget gets it, whoever draws it: a plugin that wants other data declares another type.
- `isBuiltInWidgetType()` stays the protocol's list of the types every frontend draws; `drawn` in `DashboardWidget` asks the resolved entries.

### One id convention

- **A plugin id is `{vendor}.{name}`**, in lowercase with dashes inside each part: `panneau.fields`, `panneau.lists`, `panneau.media`, `panneau.editor`, `panneau.credits`, `folklore.pages`, `urbania.newsletter`. `panneau.` is for the plugins of this repository.
- **The four built-in plugins with a dash** (`panneau-fields`, `panneau-lists`, `panneau-media`, `panneau-editor`) **take the dotted id now, without aliases**. An id only has to be unique (`createPluginRegistry()` throws on a duplicate), and nothing reads it otherwise, so the change only breaks a project that registered two of them on purpose. It goes in the changeset.
- Every built-in plugin is declared with `definePlugin()`, which returns the plugin with its kinds typed, so the three ways of typing them become one.

### What stays not extensible, on purpose

The docs page lists these, with the reason, so that a project doesn't look for a hook that isn't there:

- **The types that columns edit in place** (`INLINE_TYPES` in `lists/src/inline/editable.ts`: `text`, `number`, `select`, `boolean` and `date`, [0043](0043-inline-editing.md)): a plugin's field type isn't edited in a cell. The cell would need its own small control, its own commit and its own errors.
- **The containers of form layouts** (`row`, `column`, `section`, `tabs`, `tab`, `sidebar`, `field`, `text`, `BUILT_IN_LAYOUT_NODE_TYPES`): a layout's extension point is the `component` node, whose children stay in the form.
- **The built-in item actions and their semantics** (`show`, `edit`, `duplicate`, `delete`, `restore`, [0040](0040-row-links-and-open-mode.md)): a resource declares its own actions; a `client` action is the extension point.
- **What the protocol defines**: the portable rules, the shapes of filter values, the data of the built-in widget types. A plugin adds a field type, a filter control or a widget type, and its backend sends what it reads; it doesn't change what the built-in ones mean.
- **The shell** (sidebar, menus, the "Go to…" palette's own entries): a plugin adds pages, commands and menu entries through the definition, not by replacing the shell.
- **The tokens of the theme**: a theme sets their values, and `extends` themes of plugins ([0024](0024-theme-model.md)); it doesn't add tokens that components would read.

### The docs page "Extending Panneau"

`docs/extending.md`, linked from `docs/README.md` and the README of `@panneau/core`, written with the implementation:

1. **Plugins.** What a plugin is, `definePlugin()`, the id convention, where to pass plugins (`<Panneau plugins>`, `PanneauProvider`, nested providers), and the order: built-ins, plugins, props.
2. **Kinds.** One section per kind, each with its entry and props type, its key in the definition (field `type`, column `display`, list `layouts`, filter `type`, action `component`, page `component`, widget `type`, layout `component`, sidebar `panel`, preview `component`), what a missing entry draws, and a short example:
    - `fields` (with compound fields and `summarize`), `displays`, `filters`, `listLayouts`;
    - `actions` (client actions), `components` and `panels` (forms);
    - `pages`, `widgets` (with the built-in types it can replace), `previews`;
    - `commands`, `locales`, `themes`.
3. **Replacing a built-in.** A field (`richtext`, with `createEditorPlugin()`), a display, the `stat` widget, the `dashboard` page.
4. **Typing a kind of your own.** Augmenting `PluginKinds` from a package that renders its own entries, and `resolveEntry()`.
5. **What isn't extensible, and why.** The list above.
6. **A plugin with its backend.** A Laravel package that ships a PHP field and its JS plugin: the field type in the definition, and the entry that draws it.

## Consequences

- `@panneau/core`: `PluginKinds`, `PluginKind`, `resolveEntry()`, `getEntries()`, `useEntry()`, `useEntries()`, `PageProps`. `PluginComponent` and `PluginComponentKind` are deprecated for one minor, then removed. `PanneauPlugin` and `PluginRegistry` keep their shape for the existing kinds.
- `@panneau/fields`, `@panneau/lists`, `@panneau/actions`, `@panneau/forms`: augment `PluginKinds`, read their kinds through `resolveEntry()`/`getEntries()`, without casts. `@panneau/lists` adds the `filters` kind.
- `@panneau/app`: `builtInWidgets` in place of the `switch`; the `Shell` resolves pages the same way.
- The built-in plugins take dotted ids, without aliases, and `definePlugin()`. A breaking change for a project that relies on their ids, in the changeset.
- The implementation comes after [#349](https://github.com/folkloreinc/panneau-js/issues/349), which removes the deprecated APIs of every package, so that it doesn't deprecate names about to go.
