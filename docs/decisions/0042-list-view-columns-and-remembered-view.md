# 0042: The view of a list: chosen columns, and the view the browser remembers

- Status: accepted
- Date: 2026-11-03
- Issues: [#176](https://github.com/folkloreinc/panneau-js/issues/176) (column choice), [#179](https://github.com/folkloreinc/panneau-js/issues/179) (remembered view)
- Changes: the columns of a list in the protocol, and the list state of [0022](0022-lists-render-core-state.md)

## Context

The contests platform has big tables (participants, entries, winners), with more fields than fit on a screen, and users who come back to the same lists all day, each with their own filters, sort, layout and columns. A list always opened with its defaults, and showed every column of its definition.

The list state of `@panneau/core` keeps its query in the URL ([0022](0022-lists-render-core-state.md)), so a link opens the same page of the same query. The layout was a state of `ListView`, lost on a reload, and there was no column choice.

Two places could remember the view of a user: the browser, as the app already does for the sidebar and the item panel (`localStorage`), or the backend, through a new part of the protocol, so that it follows the user from one browser to another.

## Decision

### Columns the user chooses

- **A column of the definition says how it can be chosen:**
    - `"hidden": true`: not shown by default. The user can show it.
    - `"hideable": false`: always shown. The user can move it, not hide it. Columns are hideable by default.
- **The user shows, hides and orders the columns** from a "Columns" menu of the list's toolbar: a checkbox and buttons to move each column up and down, which work with the keyboard and a screen reader, and "Reset columns", back to those of the definition. The first column shown is the title of the items, as before.
- **Every layout shows the chosen columns:** the table as its columns, the cards as their title and values.

### The view of a list

- **The view** is the layout and the chosen columns. It is part of the list state of `@panneau/core`, next to its query, but it is not sent to the backend.
- **It is kept in the URL** when it differs from the defaults, as the query is: `?layout=cards&columns=title,status,author`, the ids of the columns shown, in their order. A link opens the same view.
- **What a view can't apply is ignored:** columns that don't exist, a layout the list doesn't have. Columns that can't be hidden are added where the definition has them.

### The view the browser remembers

- **Where:** in the browser (`localStorage`), per user and per list. The app keys it with the user's id (`user.id` of the definition) and the list's resource, so two users of the same browser don't share it. Storage that is blocked or full only means the view isn't remembered.
- **What:** the filters, the sort, the page size, the layout and the columns. Not the page or the cursor, which belong to a query of the moment, nor the search, nor the selection.
- **When it is saved:** when the user changes one of them. Opening a link doesn't save its view: a link shared by someone else doesn't replace the user's own.
- **When the URL wins:**
    - **a URL with any parameter of the list** (`page`, `perPage`, `cursor`, `sort`, `q`, `filter[…]`, `layout`, `columns`) opens exactly what it says, without the remembered view;
    - **a URL without any**, such as the link of the menu, opens the remembered view. The list writes it to the URL, replacing the entry of the history, so the URL shows what the list shows and can be shared, and Back doesn't go through the bare URL.
- **Going back to the defaults:** each part of the view is cleared where it is shown: the filter chips and their "Clear filters", the sort, the layout switch and "Reset columns". What the user clears is saved as the rest is.
- **Lists outside the app** remember their view when they are given a key and a store: `useList({ remember: { key } })`, with `createStorageViewStore()` of `@panneau/core` by default. Without `remember`, nothing is stored.

## Why the browser, for now

- It needs nothing of the backend: every backend of the protocol gets it, now, without a new endpoint before the protocol is frozen for the beta.
- A view is cheap to lose: a user who changes browser picks their filters again. The case for the backend is users who share views ("the entries to judge"), which is a feature of its own: saved views, with a name, shared with a team.
- **The store is an interface** (`ListViewStore`, with `get(key)` and `set(key, view)`). A backend can store the views later without changing lists: an endpoint for the preferences of the user, loaded with the boot config so that reading them stays synchronous, and a store that writes to it. That is additive in protocol version 1.

## Not decided here

- **Saved views**, named and shared with other users, and views stored by the backend.
- **Asking the backend for the fields of the columns shown only** (`fields` of the query): the list still fetches every field.
- **Widths of columns** that the user resizes.

## Consequences

- The protocol's `Column` has `hidden` and `hideable`, in the JSON Schema and its types. `resolveList()` of `@panneau/core` resolves them (`hidden: false`, `hideable: true` by default).
- `@panneau/core`'s list state has a `view` (`{ layout?, columns? }`), with `setLayout()`, `setColumns()` and `resetColumns()`, kept in the URL with its query. `resetQuery()` leaves the view alone. `createList()` and `useList()` take `remember`, and `@panneau/core` has `createStorageViewStore()`.
- `ListView` of `@panneau/lists` reads the layout and the columns from the list state, and has the "Columns" menu. Its `layout` and `onLayoutChange` props still control the layout. A column written by hand has `hidden` and `hideable` too.
- The app remembers the view of each list of a resource, keyed by the user and the resource.
- `laravel-panneau`'s `Column` has `hidden()` and `hideable()`.
