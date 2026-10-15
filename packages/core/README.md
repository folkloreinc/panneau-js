# @panneau/core

The engine of Panneau: plugin registry, definition to forms and lists, form and list state, with React hooks. It renders no UI, and only relies on [`@panneau/protocol`](../protocol): data comes from the caller, or from [`@panneau/data`](../data).

```tsx
import { getItemValues, resolveForm, useForm, useResource } from '@panneau/core';

function EditPage({ item, onSave }) {
    const { resource } = useResource('pages');
    const { fields, layout } = resolveForm(resource, { mode: 'update' });
    const { form, values, errors, status, conflict } = useForm({
        fields,
        values: getItemValues(
            item,
            fields.map((field) => field.name),
        ),
        version: item.version,
        locales: ['fr', 'en'],
        onSubmit: (values, { version, changes }) => onSave(changes, version),
    });
    // Render `layout` with fields from the plugins; `form.setValue('title.fr', …)` on change.
}
```

| Export          | Content                                                      |
| --------------- | ------------------------------------------------------------ |
| `@panneau/core` | Plugins, definition engine, form and list state, React hooks |

## Plugins

`definePlugin()` declares what a plugin adds, keyed by the names the definition uses: `fields`, `displays`, `listLayouts`, `actions` (handlers of `client` actions), `pages`, `widgets`, `components` (layout nodes), `locales` and `themes`.

`PanneauProvider` takes plugins, the definition and a router. Nested providers add their plugins to those of their parent, and later plugins override earlier ones, so a project can replace a built-in field. `usePlugins()` returns the merged registry, and `loadMessages(registry, locale)` the merged messages of a locale.

## Definition engine

- **`resolveForm(resource, { mode, type })`**: the fields of the form and its layout. Field nodes that name unknown fields are dropped, and fields that no node references are appended at the end. `create` drops `updateOnly` fields; `update` makes `createOnly` fields read-only. `type` adds the fields of an item type.
- **`resolveList(resource)`**: columns (label, display and sortability from their field), filters, sorts, default sort, layouts, page size, and the actions the user can run, by placement. Without columns, the list shows the item title and the next fields.
- **Abilities:** `can(abilities, 'create')`, `isActionAllowedOn(action, item)`, `partitionByAction(action, items)`. Without abilities, everything is allowed and the backend decides; with abilities, only what is `true`.
- **`useResource(id)`** resolves a resource of the provider's definition.

## Forms

`createForm(options)`, or `useForm(options)` in a component, manages:

- **Values**, nested and localized, set by dot path (`form.setValue('title.fr', 'Accueil')`), and whether they changed (`dirty`).
- **Client validation** with the portable rules (`checkValues()`): errors of a field show once it was blurred (`form.blur(path)`), and every error shows after a submit. Messages are English by default; `formatError` translates them.
- **Server errors**, by dot path, from a `422`. They go away when their value changes.
- **Visibility:** `form.isVisible(field)` evaluates `visibleWhen`. Hidden fields are not validated.
- **Submit:** `onSubmit(values, { version, changes, mode })`. When it returns an item, the form continues from it, with its new version. When it throws an error that carries problem details (the errors of `@panneau/data` do), a `412` puts the form in the `conflict` status with the current item. `form.resolveConflict('reload')` takes their version; `'overwrite'` submits the local changes again over it.

Values live in a `FormStore`. The default one is local; a shared store (Yjs) can replace it without changing the fields. `useFormField(form, path)` gives the props of a controlled field.

## Lists

`createList(options)`, or `useList(options)`, manages:

- **The query**: page, page size, sort, filters and search, with the list's defaults. Changing filters, search, sort or page size goes back to the first page.
- **The selection**: some ids, kept across pages, or every item matching the query except some (`selectAllMatching()`). `getSelection()` returns the protocol's `Selection` for an action. Changing filters or search clears it.
- **URL sync** through a `Router`: `getSearch()`, `setSearch()` and `subscribe()`. Only values that differ from the defaults are written, next to the other parameters. `createHistoryRouter()` uses `window.history`; `createMemoryRouter()` keeps it in memory. `useList()` uses the provider's router unless given one, or `router: null`.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
