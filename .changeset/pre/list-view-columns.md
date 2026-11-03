---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/lists': patch
'@panneau/intl': patch
'@panneau/app': patch
---

Users choose the columns of a list, and lists remember their view ([decision 0042](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0042-list-view-columns-and-remembered-view.md)).

- `@panneau/protocol`: a column has `hidden` (not shown until the user shows it) and `hideable` (`false`: always shown), in the JSON Schema and its types.
- `@panneau/core`: `resolveList()` resolves `hidden` and `hideable` on each column. The list state has a `view`, the layout and the ids of the columns shown, with `setLayout()`, `setColumns()` and `resetColumns()`, kept in the URL (`layout`, `columns`) when it isn't the default, and never sent to the backend. With `remember: { key, store? }`, `createList()` and `useList()` remember the filters, sort, page size, layout and columns the user changes, and restore them when the URL has no parameter of the list: they then write them to the URL, in place of its entry. A URL with any parameter of the list opens as it is, and isn't remembered until the user changes something. `createStorageViewStore()` keeps views in `localStorage` (the default store); `ListViewStore`, `ListViewState` and `RememberedView` are exported. `ListDefaults` takes `layout` and `columns`.
- `@panneau/lists`: a "Columns" menu in the toolbar shows, hides and orders the columns, with buttons to move them and "Reset columns". Columns with `hidden` are left out until the user shows them; those with `hideable: false` can't be hidden. `ListView` reads its layout and its columns from the view of the list state: `columns` is every column of the list, and `columnChoice={false}` leaves the menu out. Its `layout` prop still controls the layout.
- `@panneau/intl`: messages of the column menu, in English and French.
- `@panneau/app`: each list of a resource remembers its view for the user, in the browser.
