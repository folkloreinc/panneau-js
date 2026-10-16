# 0023: An action runner in its own package

- Status: accepted
- Date: 2026-10-16
- Changes: the list of packages in [0003](0003-layers-and-packages.md) and [packages.md](../packages.md)

## Context

[0017](0017-actions.md) says how actions run: parameters in a modal rendered by the form engine, a request through the `DataAdapter`, an action result (message, counts, per-item results, refresh, redirect, download), and queued runs that the UI follows. [0022](0022-lists-render-core-state.md) left running them to Phase 2: `ListView` confirms an action and hands it to its `onAction`.

Running an action needs `@panneau/forms` (the parameters) and a backend (the adapter). Lists and forms are UI primitives and can't depend on `@panneau/data` ([0003](0003-layers-and-packages.md)). The app could hold the runner, but a product that uses the pieces without the app (Niche) needs it too, and would then install the whole app for it.

## Decision

- **`@panneau/actions`**, at the data layer, runs actions. It depends on `protocol`, `intl`, `ui`, `core`, `forms` and `data`.
- **`ActionRunnerProvider`** holds what runs: the parameters dialog, the results, the queued runs it follows, and their toasts. It sits inside `PanneauRoot`, and above the router in an app, so that runs are followed across pages.
- **`useActionRunner(resource)`** returns a function that runs an action from a list's `ListActionEvent`, or from an item. It is the `onAction` of a list.
- **The adapter is the action part of `DataAdapter`:** `runAction()`, `getActionRun()` and, optionally, `cancelActionRun()`. A product with its own API implements those three methods, and nothing else.
- **No TanStack Query requirement.** The runner calls `onResult` with each result, and the caller refreshes its data. With `@panneau/data/query`, that is `invalidateActionResult()`.
- **Kinds:** `server` actions go through the adapter; `link` actions go to their URL or route; `client` actions render the plugin handler that their `component` names.

| Package            | Layer | May depend on                                     |
| ------------------ | ----- | ------------------------------------------------- |
| `@panneau/actions` | Data  | `protocol`, `intl`, `ui`, `core`, `forms`, `data` |
| `@panneau/app`     | App   | every package above, including `@panneau/actions` |

## Consequences

- Lists and forms stay free of data: a list's `onAction` is the runner's function, or the product's own.
- The app's notification area (Phase 2) reads the runs of the provider, so it doesn't follow runs itself.
- The runner only knows the runs it started. Runs started elsewhere (another tab) need `listActionRuns()`, which the app's notification area can add.
