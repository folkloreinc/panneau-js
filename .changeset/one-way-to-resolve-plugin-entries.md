---
'@panneau/core': minor
'@panneau/fields': minor
'@panneau/forms': minor
'@panneau/lists': minor
'@panneau/actions': minor
'@panneau/app': minor
'@panneau/media': minor
'@panneau/editor': minor
---

One way to resolve plugin entries (decision 0097).

**Breaking: the ids of the built-in plugins.** `panneau-fields`, `panneau-lists`, `panneau-media` and `panneau-editor` are now `panneau.fields`, `panneau.lists`, `panneau.media` and `panneau.editor`, without aliases. A plugin id is `{vendor}.{name}`. Nothing reads an id but the check that ids are unique, so this only breaks a project that relies on those strings.

**Breaking for types: the props of the definition are unchecked.** The components and panels of form layouts, and pages, get the `props` of the definition as `WithDefinitionProps<…>`. A component that required one of them (`({ label }: { label: string })`) no longer type-checks: declare them optional, beside the props of its kind (`LayoutComponentProps & { label?: string }`).

`@panneau/core`: `PluginKinds` types the entries of each kind, and packages add theirs by declaration merging. `PanneauPlugin` and `PluginRegistry` derive from it, and `definePlugin()` keeps the type of the plugin. `resolveEntry()`, `getEntries()`, `useEntry()` and `useEntries()` read every kind in one order: built-ins, plugins, then the overrides of the component that renders them, with a warning in development when nothing gives an entry (`warnMissingEntry()`). `PageProps` (the id of a page, the definition, the base path and the params) joins `WidgetProps`, which gets the `currency` and the `period` of built-in widgets. `PluginComponent` and `PluginComponentKind` are deprecated.

`@panneau/forms` declares `fields`, `components` and `panels`; `@panneau/lists` `fields`, `displays`, `listLayouts` and the new `filters`, the filter controls of plugins by filter type; `@panneau/actions` `actions`. `@panneau/app`: a plugin can replace a built-in widget type (`stat`), whose data is still checked against the protocol, and the built-in `dashboard` page. `docs/extending.md` describes every kind.
