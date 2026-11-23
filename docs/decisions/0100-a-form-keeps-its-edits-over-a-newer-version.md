# 0100: A form keeps its edits over a newer version

- Status: accepted
- Date: 2026-11-23
- Amends: [0008](0008-realtime-and-concurrency.md) (what a form does when a newer version arrives before it saves)
- Issue: [#398](https://github.com/folkloreinc/panneau-js/issues/398)

## Context

[0008](0008-realtime-and-concurrency.md) detects conflicts when a form saves: the update sends `If-Match`, and a `412` opens a dialog to load the current version or save over it. It says nothing of a newer version that reaches the form before it saves: a refetch when the window gets the focus back, after an action, or the item the app caches after a save while the user kept typing.

The app gave its form a new `key` for every version of the item. Each of these refetches started the form over, and dropped what the user was typing without a word.

## Decision

- **A form is not started over for a newer version of the same item.** It starts over for another item, and between creating and editing.
- `Form` takes the item as the backend has it now (`item`), and `form.refresh(item)` of `@panneau/core` decides:
    - the version the form already has, or one that arrives while it saves, changes nothing: the save decides the next version, and keeps what was typed meanwhile;
    - **without unsaved changes**, the form takes the values and the version of the newer item;
    - **with unsaved changes**, the form keeps them, and holds the item in `newer`. The form says that a newer version was saved, and its "Compare" opens the conflict dialog of 0008 on it (`form.reviewNewer()`): load the current version, or save mine over it.
- Saving without comparing sends the old version, so the backend answers `412`, and the same dialog opens. When the `412` doesn't carry the current item, the dialog compares with the newer one the form holds.
- There is no merge field by field: the dialog of 0008 shows the values that differ, and the user chooses.

## Consequences

- Refetches stay cheap and frequent: they never cost the user their work.
- The `saved` prop of `FormView` only matters to a form that starts over after a save; the app's form no longer does.
- A shared store (`@panneau/collab`, 0008) replaces this: everyone edits the same values, and there is no newer version to compare with.
