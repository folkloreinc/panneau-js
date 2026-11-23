# 0105: Edits in place show at once

- Status: accepted
- Date: 2026-11-23
- Amends: [0043](0043-inline-editing.md) (what a cell does while it saves)
- Issue: [#442](https://github.com/folkloreinc/panneau-js/issues/442)

## Context

A cell edited in place ([0043](0043-inline-editing.md)) showed its new value with a spinner, and disabled its control until the backend answered. The other lists and the panel of the item showed the old value until then, since the data layer only wrote its cache once the save succeeded. On a slow network, a judge who checks ten boxes waits for each one.

## Decision

### The cell

- **A value saved in place shows at once**, in the cell and in the rest of the row, with a small spinner while it saves. The cell stays usable: its control isn't disabled, and the other cells of the row can be edited.
- **A value picked while the cell saves is saved after it**, on the item the first save gave back, with its version: it doesn't conflict with the first. Only the last value picked is sent, and not at all when it is the value just saved. One toast says it was saved, once the last save is answered; its "Undo" ([0063](0063-undo-instead-of-a-confirmation.md)) puts back the value from before these saves.
- **When the save fails, the value goes back** to what the backend has, and the cell says why, as before: the messages under the control, which keeps the value typed. A value picked after the one that failed is dropped. A cell the user has left doesn't take the focus back.
- **A conflict (`412`) keeps its own flow**: the current item, "Keep theirs" and "Save mine".
- This works without the data layer: the cell shows the value through `onItem`, as it shows the item a save gives back.

### The data layer

- **`useUpdateItem(resource, { optimistic: true })`** writes the values at once in the cached item and in every cached list of the resource that holds it, after cancelling their fetches in flight, which would write over them. The item keeps its version until the backend answers.
- **The edits of one item are sent one after the other.** An edit made from a version that an earlier edit replaced is sent with the version that edit got back: two cells of a row saved quickly don't conflict with each other.
- **A failure puts back the fields of that edit only**, under the edits still pending; a conflict shows the current item of the problem. The lists are refetched once no edit of the item is pending, in the background.
- The form's save and creates stay as they were: they show what the backend saved.

## Consequences

- `@panneau/lists`: the inline cell no longer disables its control while it saves, and queues the values picked meanwhile.
- `@panneau/data`: `UpdateItemOptions` and the `optimistic` option of `useUpdateItem()`.
- `@panneau/app`: the list of a resource saves its edits in place with `optimistic`.
- An item deleted from a list still leaves it once the backend has answered and the list is refetched ([0081](0081-motion-tokens-and-leaving-items.md)): removing it before the answer needs the action runner to say when a run starts, and is left for later.
