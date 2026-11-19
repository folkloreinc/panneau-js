# 0095: Focus and announcements in lists

- Status: accepted
- Date: 2026-11-19
- Changes: the confirmation of actions ([0017](0017-actions.md)), and the items that leave a list ([0081](0081-motion-tokens-and-leaving-items.md))

## Context

Three things in lists that axe can't catch ([#351](https://github.com/folkloreinc/panneau-js/issues/351)):

- An item that leaves a list is `inert` while it fades out (0081), and nothing moved the focus. After "Delete" in a row, the focus went back to a button that is now inert, and landed on the body. The item went after a timer, `LEAVE_DURATION`, a copy of `--panneau-duration-slow`: a theme that changes the token cut the fade, or kept an invisible item.
- The confirmation of an action focused its confirming button, destructive or not, where the dialog of unsaved changes (`@panneau/forms`) focuses the safe choice. While the dry run of a query selection counts, that button was disabled when the dialog opened, so nothing had the focus.
- Only the count of the selection was a status message. After a search or a filter, the new range and the empty state weren't announced.

## Decision

### The focus of an item that leaves

- **The focus that was in an item that leaves goes to the same control of the item after it** (its title, its menu, its "Delete"), or of the item before it when it was the last. When no item is left, it goes to the list, a group named like it (`tabIndex={-1}`), which says it's empty.
- Only when the focus was in that item: focus elsewhere stays where it is. A browser that already moved the focus to the body counts as the item's.
- Layouts give the element of each item `data-item-id`. A layout of a plugin without it sends the focus to the list.
- **An item goes when its animation ends** (`animationend` of an animation named `leave`), as long as the theme makes it. A timer, a little longer than the animation the browser reports, removes it when the animation doesn't end (hidden, or interrupted), and at once without an animation or with reduced motion.

### The focus of a confirmation

- **A confirmation opens on "Cancel" when the action is `destructive`**, as the dialog of unsaved changes does: Enter doesn't destroy. Otherwise, on its confirming button.
- **While the dry run counts, the confirming button is pending**, not disabled: it keeps the focus, ignores presses, and says it's pending.

### One status message of the results

- **A list has one polite status message of its results**, said once the items of a new search, filter or page are shown: how many items match ("24 items", or "3 items on this page" in a list paged with cursors, which has no total), or that none match the search or the filters, or that there are none yet. Not for a sort, which shows the same items, nor for the first page, which the skeleton announces.
- The count of the selection keeps its own status message.

## Consequences

- `@panneau/lists`: `ListView`, the built-in layouts (`data-item-id`), `ConfirmDialog`, and two messages of `@panneau/intl` (`resultsCount`, `resultsOnPage`). `LEAVE_DURATION` is gone.
- A list has one more `role="status"` once its items are shown: tests that read the only status of a list read it by its text.
