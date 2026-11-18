# 0060: Row actions are colored icons, and a menu last

- Status: proposed
- Date: 2026-11-04
- Changes: the menu of rows of [0040](0040-row-links-and-open-mode.md)

## Context

Since [0040](0040-row-links-and-open-mode.md), the actions placed in `menu` (the built-in `duplicate` and `delete`, and declared actions that say so) go in a menu at the end of each row (`•••`), and the others are buttons with their labels. Most resources have `show`, `edit` and `delete`: each row then has two labelled buttons and a menu that holds `delete` alone. Opening a menu to find the only thing in it is a wasted click, and the `•••` hides what the row offers.

Panneau 4 showed the actions of rows as a group of icons, each in its color (`show` blue, `edit` in the main color, `delete` red), the same in every list of an admin. People who use it found that clear. Labels on every row also take the width that the content of a table needs.

## Decision

- **Icons in their colors.** Every action of a row is a button that shows its icon, in its tone, on a tinted background (the `subtle` appearance): `show` `info`, `edit` `accent`, `restore` `success`, `delete` and every action that destroys `danger`, the others `neutral`. The label is the accessible name (`Delete: Contact`) and the tooltip. An action without an icon shows its label.
- **The main action keeps its label**: the one the title of an item opens, `edit` for a resource that opens its items in their form, `show` otherwise (`primaryAction` of `ListView`, set by the app from `open`). When room runs short, it is the first to drop its label, before any action goes to the menu.
- **The same in every list.** The rows of every resource of an admin show their actions the same way, whatever their content: no list switches to labels or to another style.
- **Order.** Those placed in `row`, then those placed in `menu`, and those that destroy last.
- **A menu, last.** Only when the icons don't fit (many actions, a narrow list, a phone), the last actions of the row go in the `•••` menu: those that destroy first, then those placed in `menu`. The menu never holds a single action: one left alone stays a button, in the menu's place.
    - The list measures itself, not the window. It draws each step in turn (the main action as an icon, then two actions in the menu, three…), before the browser paints, and keeps the one where the actions crowd least: the table overflows, the actions of a row wrap, or take more than 40% of its width. Ties go to the fewest changes.
    - On rows of five actions or more, the menu also gives the content room (shorter rows, less text cut by a display that clamps it), as long as four actions stay out of it.
    - The list measures again when its width or its items change. CSS alone can't tell whether the actions of a table crowd its rows.
- **Lined up.** The number of actions in the menu is chosen for the list, not for each row, and a row keeps the place of the actions that other rows of the page have and it doesn't (an item that can't be deleted), so the actions line up in columns.
- **Same actions, same runs.** What a row shows doesn't change what runs: the same abilities decide which actions an item has, and `delete` asks for the same confirmation.
- `placement` keeps its meaning for the toolbar and the selection. On rows, `menu` now says which actions go to the menu first, not that they always do.
- The table, cards and gallery layouts fit their actions this way. A layout of a plugin doesn't measure: its rows show every action.

## Consequences

- The common resource shows `View` with its label, then the icons of `Edit`, `Duplicate` and `Delete`, one click each, with no menu, in every list.
- Rows with many actions, or on a phone, have a menu, never of one action.
- Measuring costs a few renders when the list changes, before the browser paints.
