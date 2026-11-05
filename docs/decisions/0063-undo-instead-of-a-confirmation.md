# 0063: "Undo" instead of a confirmation

- Status: proposed
- Date: 2026-11-05
- Issue: [#230](https://github.com/folkloreinc/panneau-js/issues/230), and [folkloreinc/laravel-panneau#179](https://github.com/folkloreinc/laravel-panneau/issues/179)
- Changes: the confirmations of [0017](0017-actions.md), and the change in place of [0043](0043-inline-editing.md), which left its undo for later

## Context

A confirmation before every change slows people down, and they learn to click "Confirm" without reading it. What can be undone is better done at once, with "Undo" in the toast that says it was done, as mail apps do. A confirmation then means something: it is kept for what can't be undone. The toasts of `@panneau/ui` take an action and name what was done ([0062](0062-toasts.md)).

## Decision

### What undoes what

- **A change in place** ([0043](0043-inline-editing.md)): the toast that says a value was saved has "Undo", which saves the previous value the same way: `PATCH` of that one field, with `If-Match` of the version the save just got. A conflict shows on the cell, as for any change in place. The backend needs nothing.
- **An action that says how it is undone.** An action declares `"undoable": true`, and its result carries `"undo": { "action": "unarchive", "items": ["…"], "params": {} }`: an action of the same resource, the items it applies to, and its parameters (the `values` of the request that runs it). The items are those the action changed, not the skipped or failed ones. Without `undo` in a result (the backend couldn't), the toast has no "Undo".
    - **`delete` of a resource with a trash** is undone by the built-in `restore`. The backend declares its `delete` with `"undoable": true` (a declared action with a built-in id already overrides it); a resource without a trash keeps the built-in confirmation.
    - **Pairs that projects declare**: archive and unarchive, publish and unpublish, hide and show. The inverse action can appear nowhere (`"placement": []`) and still be run as an undo.
- **The undo is an action like any other**: the client runs it through the action endpoint, the backend checks it with its policies, by the same abilities, and keeps no state for it.

### When the confirmation is skipped

- An action with `"undoable": true` runs **without a confirmation**, unless it sets `confirm` itself. A declared `delete` that is `undoable` doesn't take the built-in confirmation.
- Items that the selection's page knows will be skipped, or that a dry run counts, still ask first, as before.

### What isn't undone, and keeps its confirmation

- **An action whose inverse depends on each item's previous value** ("Change the status" of items that each had their own) is not undoable, for now. One `undo` holds one action and one set of parameters for all its items.
- **More than 100 items** (`UNDO_LIMIT` of `@panneau/protocol`): the confirmation comes back, and the result has no `undo`. The client knows the count before it runs, from the selection or the dry run. Under the limit, the result lists the ids to put back.
- **Queued runs** (`"queued": true`, or a `202`), which finish later: they keep the confirmation, and their result is not undone.

### Where "Undo" lives

- **In its toast only**, for about 10 seconds (the timeout of a toast with an action). It works with the keyboard and a screen reader: the toast region is a landmark (F6), and the button has its label. After that, the undo is done by hand: restoring from the trash, running the inverse action.
- After an undo, a short toast says it was undone, in place of the first one.
- The undo of an undo isn't offered.

## Consequences

- `@panneau/protocol`: `undoable` on `Action`, `undo` on `ActionResult`, `UNDO_LIMIT`, in the JSON Schema, the OpenAPI spec and `docs/protocol.md`. The mock backend keeps a trash for a resource that declares its `delete` undoable, answers its `undo`, and runs `restore`. The conformance kit runs the undo of a result and checks that the items are back.
- `@panneau/core` decides when an action asks first (`asksConfirmation()`), for lists and the header of an item.
- `@panneau/actions`: the runner shows "Undo" when a result has an `undo`, runs it, refreshes, and says it was undone.
- `@panneau/lists`: the toast of a change in place has "Undo".
- `laravel-panneau`: `delete` is undoable on models with `SoftDeletes` (the built-in `restore`), `undoneBy()` declares the inverse of an action, and a run on more than 100 items carries no `undo`.
