# 0088: Destructive actions in a menu, in the header of items and in rows

- Status: proposed, amended the same day: a menu never holds a single action (see [Amendment](#amendment-no-menu-of-one-action))
- Date: 2026-11-18
- Issue: [#322](https://github.com/folkloreinc/panneau-js/issues/322)
- Amends: the header of an item in [0040](0040-row-links-and-open-mode.md), and the menu of rows in [0060](0060-row-actions-colored-icons.md)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The header of an item, in its edit form and in its panel, shows the actions of the item ([0040](0040-row-links-and-open-mode.md)) as buttons, and each action that destroys as a solid danger button. The built-in item actions come before those a resource declares, so "Delete" sits before a link such as "View on the site": the first button of the header, and the only one in color.

In rows, actions that destroy are last, but they keep their red icon while the icons fit ([0060](0060-row-actions-colored-icons.md)): on a wide list, every row ends with a red trash can.

People delete an item rarely, and it is the action they least want to hit by mistake. It shouldn't be the most visible one, on every item.

## Decision

- **Actions that destroy** (`destructive: true`: the built-in `delete`, and declared actions that say so) **come last**, at the end of the header of an item and of each row, **in a "More actions" menu** (`…`) **when there are two or more of them**. Their placement still says on which surfaces they are.
- **A menu never holds a single action**, as [0060](0060-row-actions-colored-icons.md) says for rows: an action alone stays a button, in the menu's place. Hiding one action behind `…` only costs a click.
- **In the header of an item** (its form and its panel), every action is a secondary button, links included: no solid danger button. Those that destroy come after the others, in the menu when there are two or more.
    - The menu button is an outlined icon button, as high as the buttons beside it, named "More actions" ("Plus d'actions"), with that name as its tooltip.
- **In rows**, the actions that destroy go in the row's menu when the row has two or more of them, at every width. When the icons don't fit, the other actions join the menu, from the last, as before. A single action that destroys stays its icon, in its danger color, with its label as name and tooltip.
    - Rows still line up: the menu is chosen for the list, and a row that has fewer of its actions keeps their place.
- **What doesn't change:**
    - In the menu, an action that destroys keeps its icon and the danger color.
    - Its confirmation, and "Undo" in place of it ([0063](0063-undo-instead-of-a-confirmation.md)).
    - The bulk actions of a selection: "Delete" is a button of the selection's bar, the only place where it is the point.
    - Which actions an item has: `getItemActions()` of `@panneau/core` decides them, and each surface only places them.

## Amendment: no menu of one action

The first version of this decision put the actions that destroy in the menu even alone: "Delete" was the only item of `…`, in the header of every item and on every row of a list where items can be deleted. Opening a menu to find the only thing in it is the wasted click that [0060](0060-row-actions-colored-icons.md) set out to avoid. The menu now only appears for two actions or more; a single action that destroys is a button, last, secondary in the header and a danger icon in rows.

## Consequences

- A resource with only the built-in actions shows its links, "Duplicate", then "Delete", as secondary buttons in the header of its items, "Delete" last. Its rows show the main action with its label, then the icons of the others, the red "Delete" last, as in [0060](0060-row-actions-colored-icons.md).
- A resource that declares another action that destroys ("Suspend", say) gets `…` with both, in the header and in rows.
- Rows of five actions or more give the content room as before, counting the actions that destroy among those in the menu.
- `ItemActions` of `@panneau/app` and `RowActions` of `@panneau/lists` render the menu. No change of the protocol, of `getItemActions()` or of the backend.
