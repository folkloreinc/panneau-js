# 0070: Lists show their checkboxes once "Select" is pressed

- Status: proposed
- Date: 2026-11-06
- Changes: the checkboxes of the table ([0068](0068-collapsed-items-and-lighter-controls.md)), and of every layout of a list

## Context

[0068](0068-collapsed-items-and-lighter-controls.md) hid the checkbox of a row until the row is hovered or focused, so that a table doesn't repeat a column of checkboxes nobody uses. The column kept its place while hidden, so that rows don't move when it shows. People found the result misaligned: the title of every row started after an empty column, away from the filters and the edge of the table above it.

Showing the checkbox in a gutter, outside the table, would keep the rows aligned without a column. But a list scrolls sideways, and clips what reaches past it, and a list that draws in the margin of its page breaks where there is none: next to an item, in a picker, on a phone.

## Decision

- **A list that can select has a "Select" button in its toolbar.** Pressing it shows the checkboxes of every layout: the table's column, the cards' and the gallery's boxes. The button then reads "Done": pressing it hides them, and clears the selection.
- **Without it, a list has no checkboxes and no empty column**: its rows start at the edge of the table, as its headers do.
- **A selection shows its checkboxes too**, however it was made (a query in the URL, the code of a product), and running a selection action ends the selection and hides them. An action that didn't run keeps both.
- **Shown checkboxes always show**: the table no longer hides them until hover. A row's checkbox and its header's are there as soon as the list selects.

## Consequences

- `@panneau/lists`: `ListView` keeps whether it selects, and gives `selectable` to its layout only then. The `selectable` prop says whether items can be selected, as before. The table's styles that hid its checkboxes, and its `data-selecting`, are only for themes.
- Selecting takes one more click. Lists that select often could show their checkboxes from the start: a definition or a prop could ask for it later.
- Tests and stories that select press "Select" first.
