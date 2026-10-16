# 0022: Lists render the list state of the engine

- Status: accepted
- Date: 2026-10-16
- Changes: the dependencies of `@panneau/lists` in [0003](0003-layers-and-packages.md) and [packages.md](../packages.md)

## Context

[packages.md](../packages.md) puts `@panneau/lists` among the UI primitives, depending on `protocol`, `intl`, `ui` and `fields`. [0021](0021-forms-render-core-state.md) let `@panneau/forms` depend on `@panneau/core`, and left the same question open for lists.

`@panneau/core` already holds the list state, with no UI and no network:

- the query (page, page size, sort, filters, search), with its defaults;
- the selection, as ids or as every item matching the query with exceptions, and the `Selection` to send with an action ([0017](0017-actions.md));
- the sync of the query with the URL, through a small `Router` interface;
- the actions of a resource grouped by placement, and the abilities that hide them ([0011](0011-permissions.md));
- the plugin registry, where plugins add displays and list layouts.

A lists package below core would have to duplicate the query and the selection, or take every piece of them as props and callbacks from each caller.

## Decision

- **`@panneau/lists` depends on `@panneau/core`**, and renders its list state:
    - `ListView` renders a list created with `useList()` or `createList()`, and the items of its query;
    - `List` creates the state itself, for items held in memory, and applies the query to them.
- **Lists fetch nothing.** The caller fetches the items of the query (with `@panneau/data` or its own API) and passes them with their total. Lists still work without a definition, a router or a network, as [0003](0003-layers-and-packages.md) requires: columns and items can be written by hand.
- **Displays and layouts are registry entries**, as fields are: built-in ones, then those of core's plugins (`displays`, `listLayouts`), then those passed as props.
- **Core stays below lists:** it never imports `@panneau/lists`, and renders no UI.
- Components read the list's subscribed state (`query`, `selection`), never the list's methods that read it, because the React Compiler would keep their first result (#26).

| Package          | May depend on                              |
| ---------------- | ------------------------------------------ |
| `@panneau/core`  | `protocol`                                 |
| `@panneau/forms` | `protocol`, `intl`, `ui`, `fields`, `core` |
| `@panneau/lists` | `protocol`, `intl`, `ui`, `fields`, `core` |

## Consequences

- The query, the selection and the URL sync are written once, in core. `@panneau/data`'s query hooks and `@panneau/lists` read the same state, so a page fetches exactly what the list shows.
- A project that uses `@panneau/lists` also installs `@panneau/core`, as for forms.
- Lists render the confirmation of actions, and hand the confirmed action to the caller with its selection. Running it (the adapter, parameters in a modal, per-item results and queued runs) is the work of the actions in Phase 2.
