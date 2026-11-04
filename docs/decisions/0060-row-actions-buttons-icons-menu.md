# 0060: Row actions are buttons, then icons, then a menu

- Status: proposed
- Date: 2026-11-04
- Changes: the menu of rows of [0040](0040-row-links-and-open-mode.md)

## Context

Since [0040](0040-row-links-and-open-mode.md), the actions placed in `menu` (the built-in `duplicate` and `delete`, and declared actions that say so) go in a menu at the end of each row (`•••`), and the others are buttons with their labels. Most resources have `show`, `edit` and `delete`: each row then has two buttons and a menu that holds `delete` alone. Opening a menu to find the only thing in it is a wasted click, and the `•••` hides what the row offers, even on a wide screen with room to spare.

The labels have a cost too: in a table whose content needs the width, the buttons of each row take it, and the text of the other columns wraps or is cut.

## Decision

Rows show their actions in three steps, and take the next one only when they lack room.

1. **Buttons with their labels.** Every action of the row is a button: those placed in `row`, then those placed in `menu`, and those that destroy (`destructive`) last. `delete` is a button like the others, red.
2. **Icons alone.** When the content needs the room, or the actions crowd the row, the buttons drop their labels and keep their icons. The label stays as the accessible name (`Delete: Contact`) and the tooltip, and `delete` keeps its danger tone. An action without an icon keeps its label.
3. **A menu, last.** Only when even the icons don't fit, the last actions of the row go in the `•••` menu: those that destroy first, then those placed in `menu`. The menu never holds a single action: one left alone stays a button, in the menu's place.

- **Room.** The list measures itself, not the window: it draws each step in turn before the browser paints, and keeps the best one. A step helps when the actions crowd less (the table overflows, the actions of a row wrap, or take more than 40% of its width), or when the content gets room (the rows get shorter, or the text that a display clamps is cut less). The menu only gives the content room on rows of five actions or more, four of which stay out of it. The list measures again when its width or its items change. CSS alone can't tell whether the content of a table needs the room.
- **The same on every row.** The step is chosen for the list, not for each row, and a row keeps the place of the actions that other rows of the page have and it doesn't (an item that can't be deleted): the actions line up in columns.
- **Same actions, same runs.** What a row shows doesn't change what runs: the same abilities decide which actions an item has, and `delete` asks for the same confirmation.
- `placement` keeps its meaning for the toolbar and the selection. On rows, `menu` now says which actions go to the menu first, not that they always do.
- The table, cards and gallery layouts fit their actions this way. A layout of a plugin shows the buttons with their labels.

## Consequences

- The common resource shows `View`, `Edit`, `Duplicate` and `Delete` on each row, one click each, with no menu.
- A list whose content needs the width shows the icons of its actions, with their names in tooltips.
- Rows with many actions, or on a phone, have a menu, never of one action.
- Measuring costs a few renders when the list changes, before the browser paints.
