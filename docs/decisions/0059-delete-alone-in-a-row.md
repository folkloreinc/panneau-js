# 0059: `delete` alone in a row is a button

- Status: proposed
- Date: 2026-11-04
- Changes: the menu of rows of [0040](0040-row-links-and-open-mode.md)

## Context

Since [0040](0040-row-links-and-open-mode.md), the built-in `delete` goes in the menu of rows (`•••`), with `duplicate` and the item actions placed in `menu`. Most resources have none of those: their `duplicate` is off, and they declare no other action. Each row then has a menu that holds `delete` alone. Opening a menu to find the only thing in it is a wasted click, and the `•••` hides what the row offers.

## Decision

- **When `delete` is the only action of a row's menu**, the row shows it as an icon button at the end of the row, where the menu would be, instead of the menu:
    - the icon of the action (a trash can for the built-in one, or the icon it names, or the one given for `delete` in `actionIcons`), in the danger tone, as the menu shows it;
    - an accessible name with the item, like the other buttons of rows (`Delete: Contact`), also shown as a tooltip;
    - the same run as from the menu: its confirmation, its pending state, and the same skipped rows (an item that can't be deleted has no button).
- **When the menu has other actions** (`duplicate`, an action placed in `menu`), `delete` stays in it, as before.
- It is decided per row, from the actions the item allows: a row whose item can be duplicated keeps its menu, and the next row, whose item can't, shows the button.
- Only `delete`. Another action alone in the menu stays in it: it was placed there on purpose, and a declared action can say `placement: ["row"]` to be a button. `delete` is in the menu because 0040 puts it there, not because the resource chose it.
- The panel and the form keep their header, which has no menu.

## Consequences

- The common case, a resource with `show`, `edit` and `delete`, has its three actions one click away.
- Rows of the same list can differ, one with a menu and one with a button, when their abilities differ, as rows already differ when an item can't be deleted.
- A button with only an icon is less explicit than a labelled menu item: its accessible name and its tooltip say what it does, and its tone that it destroys.
