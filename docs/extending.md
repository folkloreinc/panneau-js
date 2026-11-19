# Extending Panneau

A project extends Panneau with plugins: field types, displays, filters, list layouts, client actions, form components and panels, pages, dashboard widgets and previews, plus commands, messages and themes. Every kind is resolved the same way ([decision 0097](decisions/0097-one-way-to-resolve-plugin-entries.md)).

## Plugins

A plugin is one object, declared with `definePlugin()` of `@panneau/core`, which types its entries:

```ts
import { definePlugin } from '@panneau/core';

export default definePlugin({
    id: 'folklore.pages',
    fields: { 'page-slug': PageSlugField },
    displays: { 'page-slug': PageSlugDisplay },
    locales: { fr: () => import('./lang/fr.json') },
});
```

- **Its id is `{vendor}.{name}`**, in lowercase: `folklore.pages`, `urbania.newsletter`. `panneau.` is for the plugins of Panneau (`panneau.fields`, `panneau.lists`, `panneau.media`, `panneau.editor`, `panneau.credits`, `panneau.sessions`, `panneau.publication`). Two plugins can't have the same id.
- **Plugins go to the app** (`<Panneau plugins={[…]}>`, `createPanneauApp({ plugins })`), or to `PanneauProvider` when a project only uses the pieces. A nested provider adds its plugins to those of its parent.
- **One order for every kind, the last wins: the built-ins, then the plugins in their order, then the props of the component that renders them** (`components` of `Form`, `displays`, `layoutComponents` and `filterControls` of `ListView`, `clientActions` of `ActionRunnerProvider`). A plugin replaces a built-in entry by giving its name.
- **A name that nothing gives** draws what its kind draws in its place, listed below, and warns once in development.

## Kinds

Each kind is keyed by the name the definition uses. The kinds a project sees are those of the packages it imports: each package declares its own in `PluginKinds`.

| Kind          | Key in the definition                     | Entry and props                                            | Declared by                        | Without an entry          |
| ------------- | ----------------------------------------- | ---------------------------------------------------------- | ---------------------------------- | ------------------------- |
| `fields`      | a field's `type`                          | `FieldEntry` (`FieldEntryProps`)                           | `@panneau/forms`, `@panneau/lists` | a text input              |
| `displays`    | a column's `display`                      | `DisplayEntry` (`DisplayProps`)                            | `@panneau/lists`                   | the value as text         |
| `filters`     | a filter's `type`                         | `FilterEntry` (`FilterControlProps`)                       | `@panneau/lists`                   | a text filter             |
| `listLayouts` | the ids of a list's `layouts`             | `ListLayoutEntry` (`ListLayoutProps`)                      | `@panneau/lists`                   | left out of the layouts   |
| `actions`     | a `client` action's `component`           | `ClientActionHandler` (`ClientActionProps`)                | `@panneau/actions`                 | the action fails          |
| `components`  | a `component` node's `component`          | `ComponentType<WithDefinitionProps<LayoutComponentProps>>` | `@panneau/forms`                   | its children, in a column |
| `panels`      | a `sidebar` node's `panel`                | `ComponentType<WithDefinitionProps<FormPanelProps>>`       | `@panneau/forms`                   | its children              |
| `pages`       | a page's `component`                      | `ComponentType<WithDefinitionProps<PageProps>>`            | `@panneau/core`                    | a warning                 |
| `widgets`     | a widget's `type`                         | `ComponentType<WidgetProps>`                               | `@panneau/core`                    | an empty card             |
| `previews`    | a resource's `features.preview.component` | `ComponentType<PreviewProps>`                              | `@panneau/core`                    | a warning                 |

`commands`, `locales` and `themes` aren't kinds of entries: commands of the "Go to…" palette (a list, or a function of the definition), messages by locale (later plugins override earlier ones), and themes by id that the definition's theme `extends`.

### Fields

A field entry gets `FieldEntryProps`: the field of the definition, its value, `onChange`, its errors. It is controlled: it never keeps its value in its own state. A compound field (a type made of sub-fields, [0065](decisions/0065-compound-fields.md)) is made with `defineCompoundField()` of `@panneau/fields`, whose `summarize` gives one value as text, for titles, lists and details; see the README of `@panneau/fields`.

```ts
definePlugin({ id: 'folklore.pages', fields: { 'page-slug': PageSlugField } });
```

### Displays, filters and list layouts

A display gets the value of a column, the item, the column and its field. A filter control gets the filter, its label, its options, its value and `onChange`. A layout gets the items, the columns and what draws them (`renderValue`, `renderActions`…), and gives the element of each item `data-item-id` ([0095](decisions/0095-focus-and-announcements-in-lists.md)).

```ts
definePlugin({
    id: 'folklore.regions',
    displays: { region: RegionDisplay },
    filters: { region: RegionFilter },
    listLayouts: { map: MapLayout },
});
```

The list page of the app asks the backend for the fields its columns show (`useListFields()` of `@panneau/lists`): a display reads the value of its column, and `item` only has the fields the list asks for.

### Client actions, form components and panels

A client action's handler gets the action, the resource and its target, and ends with `onDone()` or `onCancel()`. A component of a form layout gets its node, the form, the fields and its rendered children; a panel of a form's sidebar gets the form and its children ([0075](decisions/0075-panels-of-a-form-sidebar.md)). Both also get the `props` of their node: data from the definition, unchecked, which a component declares optional (`WithDefinitionProps`).

```tsx
function WordCount({ form, children, unit = 'words' }: FormPanelProps & { unit?: string }) {
    // …
}

definePlugin({ id: 'folklore.writing', panels: { words: WordCount } });
```

### Pages, widgets and previews

A page gets `PageProps`: its id, the definition, the base path, the values of its `params`, and its `props`. A widget gets `WidgetProps`: the widget, its data, the definition, and for the built-in types the currency and the period of the overview; the dashboard draws the card, the skeleton and the error of a plugin's widget ([0064](decisions/0064-dashboard-widgets.md)). A preview gets the item, its resource and the locale.

## Replacing a built-in

A plugin replaces a built-in entry by giving its name:

- **a field**: `richtext`, with the extensions of a project, through `createEditorPlugin({ extensions })` of `@panneau/editor`;
- **a display**: `date`, to show dates in the project's format;
- **a widget type**: `stat`, `series`, `list`, `breakdown`, `metric` or `table`. Its data is still checked against the protocol's schema of the type before the widget gets it: a plugin that wants other data declares another type;
- **a page**: `dashboard`, the built-in page of widgets.

## Typing a kind of your own

A package that renders its own kind declares it, and reads it with `resolveEntry()` or `useEntry()`:

```ts
declare module '@panneau/core' {
    interface PluginKinds {
        maps: ComponentType<MapProps>;
    }
}

const Map = useEntry('maps', settings.map, { builtIn: builtInMaps });
```

`getEntries()` and `useEntries()` give every entry of a kind, in the same order, for a menu of them.

## What isn't extensible, and why

- **The types that columns edit in place**: `text`, `number`, `select`, `boolean` and `date` ([0043](decisions/0043-inline-editing.md)). A plugin's field type isn't edited in a cell, which would need its own small control, commit and errors.
- **The containers of form layouts**: `row`, `column`, `section`, `tabs`, `tab`, `sidebar`, `field` and `text`. The extension point is the `component` node, whose children stay in the form.
- **The built-in item actions and their semantics**: `show`, `edit`, `duplicate`, `delete` and `restore` ([0040](decisions/0040-row-links-and-open-mode.md)). A resource declares its own actions; a `client` action is the extension point.
- **What the protocol defines**: the portable rules, the shapes of filter values, the data of the built-in widget types. A plugin adds a type and its backend sends what it reads; it doesn't change what the built-in ones mean.
- **The shell**: the sidebar, the menus and the palette's own entries. A plugin adds pages and commands, and the definition adds menu entries.
- **The tokens of the theme**: a theme sets their values and extends the themes of plugins ([0024](decisions/0024-theme-model.md)); it doesn't add tokens that components would read.

## A plugin with its backend

A Laravel package can ship a PHP field and its JS plugin together: the PHP field gives its `type` in the definition, and the plugin gives the entry that draws it, under the same name. The `laravel-folklore` Pages, Blocks and PageSlug fields are the first case ([architecture](architecture.md#extension)).
