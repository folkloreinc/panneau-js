# 0043: Inline editing in lists, one field at a time

- Status: accepted
- Date: 2026-11-03
- Issue: [#177](https://github.com/folkloreinc/panneau-js/issues/177)
- Changes: what `list.inlineEdit` does, and partial updates in the protocol

## Context

The definition has had `list.inlineEdit` since the first protocol, the fields "editable in the list", and the protocol lists "Inline edit: `PATCH /resources/{resource}/{id}` with a single field". No client edited in place: the contests platform's judges open each entry to change its status or its score.

A partial `PATCH` already exists: the mock backend and `laravel-panneau` only validate the fields that are sent. But they decide whether a field applies (`visibleWhen`) from the values sent alone: a field shown only when `status` is `published`, sent alone, was dropped without an error.

## Decision

### What is editable in place

- **A column edits its field in place** when its field is in `inlineEdit` and is one of the simple types: `text`, `number`, `select` (one value), `boolean` and `date`. Other types are shown as before. So are localized fields, a `select` with `multiple`, and fields that are read-only, create-only or that `visibleWhen` hides for the item.
- **Only on items that can be updated** (`abilities.update: true`), as the `edit` action ([0040](0040-row-links-and-open-mode.md)). An item without abilities isn't editable.
- **In the table layout.** Cards and the other layouts show the values.

### How a cell edits

- A `boolean` is a checkbox in the cell, saved when it changes.
- The others show their value with their display, as a button ("Edit {field}" for screen readers). Pressing it, or Enter on it, turns the cell into the field's control, focused: a text or number input, the select, or the date picker.
    - **Enter, or leaving the cell, saves**, when the value changed. **Escape cancels** and gives the value back. A `select` and a date save when one is picked.
    - Only one cell edits at a time: opening another saves the first, as leaving it does.
- **Before it saves, the field's portable rules check the value** ([0006](0006-validation-and-errors.md)), with the other values of the item, in the `update` mode. A failure shows under the control, and nothing is sent.
- **While it saves**, the cell shows the new value, and a spinner: the row can't be edited elsewhere until it is done.

### What is sent

- **`PATCH /resources/{resource}/{id}` with the one field**, `{ "status": "published" }`, and `If-Match` with the item's version: an update, partial as every update is. The answer is the item, with its new version: the list shows it, and the other lists and the item's panel are refreshed.
- **A backend decides whether a field applies with the values of the item and those sent**, not those sent alone: a field whose `visibleWhen` names another field is checked against that field's value in the item. The protocol says so for every partial update; the mock backend and `laravel-panneau` do it.

### Errors and conflicts

- **`422`**: the messages of the field (`errors[field]`) show under the control, which keeps the value typed. Messages for other fields, or a `422` without the field, show as the message of the cell.
- **`412`**, the item changed since the list was fetched: the cell says it was changed by someone else, shows the current value (from `current` of the problem), and offers **"Keep theirs"** (the cell shows the current item) or **"Save mine"** (sends the value again with the current version). The rest of the row shows the current item either way.
- **Other errors** (`403`, `404`, the network): the message shows on the cell, which keeps the value, so the user can try again or cancel.

### Lists outside the app

- `ListView` edits in place when it has `inlineEdit` (the field names) and `onInlineEdit`: a function that saves one field and resolves with the updated item, or rejects. Its errors are read as the forms read them: a problem, or an error with a `problem` (`getProblem()` of `@panneau/core`), so a product's own adapter only needs errors with a `problem` for messages and conflicts to show.
- The app saves with the data adapter (`update()`, with the version), and puts the updated item in the cached lists of the resource before refetching them.

## Not decided here

- **Other types in place:** localized values, relations, several values, rich text.
- **Editing several rows at once**, other than with actions.
- **Undo** of a change saved in place.
- **Inline editing in cards** and the other layouts.

## Consequences

- The protocol says that a partial update decides whether a field applies with the item's values and those sent: `checkValues()` takes the `item` of a partial update. The mock backend does it. The conformance kit checks, with `writes`, that a `PATCH` with a single field and `If-Match` changes that field alone (`update.single-field`).
- `laravel-panneau` validates a partial update against the item's values merged with the request: a field that `visibleWhen` shows for the item is saved when it is sent alone.
- `@panneau/lists`: `ListView` takes `inlineEdit`, `onInlineEdit` (`ListInlineEditHandler`) and `formatError`, the messages of the rules (English by default, `useFormatRuleFailure()` of `@panneau/forms` in the app), and the table edits its cells. `ListLayoutProps` gives layouts `renderCell(item, column, content)`, which wraps the content of a cell: a column that edits its field does it there. The item saved is shown until the caller gives another one for its id.
- `@panneau/data`: `useUpdateItem()` puts the updated item in the cached lists of its resource, then refetches them.
- `@panneau/app`: the list of a resource edits its `inlineEdit` fields in place, on items that can be updated.
