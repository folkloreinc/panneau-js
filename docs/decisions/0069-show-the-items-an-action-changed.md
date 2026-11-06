# 0069: "Show" the items an action changed, with a filter of lists on ids

- Status: proposed
- Date: 2026-11-06
- Changes: the list query ([protocol](../protocol.md#resources)), and the actions of toasts ([0062](0062-toasts.md))

## Context

[0062](0062-toasts.md) gives a toast the next step of what was done as its action: "Open", "Details", "Download", "Undo". It left one out: "Show" the items an action changed, the list filtered on them. A list often loses them once the action runs: "Publish" on drafts, in a list filtered on drafts, empties it, and the user has no way back to the pages they just published but to look for them one by one.

The protocol can't ask for those items. `filter[{id}]` only takes the filters of a list's definition, and ids only go in the selection of an action (`{ "selection": { "ids": [...] } }`), not in a list query.

## Decision

- **`filter[ids]` is a filter of every list**, which no definition declares: `filter[ids][]=12&filter[ids][]=13` lists those items only, with the other filters, the search and the sort as usual. Ids the backend doesn't find, or that the user can't see, are left out, without an error. It takes at most 100 ids, as an undo does ([0063](0063-undo-instead-of-a-confirmation.md)): a URL stays short. In an action's query selection, it is JSON as any filter: `"filter": { "ids": ["12", "13"] }`.
- **`ids` is a reserved filter id.** A list's definition can't declare a filter with that id: the JSON Schema refuses it.
- **Lists show it as a chip**, "3 items", which removes it, as the other chips do. It has no control: only a link, or "Show", sets it.
- **"Show" is the action of the toast of a run** that changed items the client knows: those of a selection by ids, without those of its `results` (they failed or were skipped), or the `items` of its `undo`. It opens the list of the resource filtered on them. It comes after the other actions of the toast, which say more ("Undo", "Details", "Download"), and isn't there:
    - for an item action, whose toast names the item;
    - for a `delete`, whose items are gone: its "Undo" brings them back, when the resource has a trash;
    - for a query selection without `undo`, whose items the client doesn't know;
    - above 100 items, or when the run changed none;
    - without a way to open a list, outside an app (`onShowItems`).

## Consequences

- `@panneau/protocol`: `IDS_FILTER` (`ids`) and `IDS_FILTER_LIMIT` (100); the mock filters on it; the JSON Schema refuses a list filter with the id `ids`; the conformance kit checks that a backend reads it (`list.filter-ids`).
- `laravel-panneau` reads `filter[ids]` on every list, within the scope of the resource, and runs the conformance check.
- `@panneau/lists`: the chip of the filter.
- `@panneau/actions`: `ActionRunnerProvider` takes `onShowItems(resource, ids)`, and offers "Show" when it has one.
- `@panneau/app` opens the list of the resource with `filter[ids]`.
