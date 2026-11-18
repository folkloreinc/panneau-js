# 0088: Destructive actions in a menu, in the header of items and in rows

- Status: proposed
- Date: 2026-11-18
- Issue: [#322](https://github.com/folkloreinc/panneau-js/issues/322)
- Amends: the header of an item in [0040](0040-row-links-and-open-mode.md), and the menu of rows in [0060](0060-row-actions-colored-icons.md)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The header of an item, in its edit form and in its panel, shows the actions of the item ([0040](0040-row-links-and-open-mode.md)) as buttons, and each action that destroys as a solid danger button. The built-in item actions come before those a resource declares, so "Delete" sits before a link such as "View on the site": the first button of the header, and the only one in color.

In rows, actions that destroy are last, but they keep their red icon while the icons fit ([0060](0060-row-actions-colored-icons.md)): on a wide list, every row ends with a red trash can.

People delete an item rarely, and it is the action they least want to hit by mistake. It shouldn't be the most visible one, on every item.

## Decision

- **An action that destroys** (`destructive: true`: the built-in `delete`, and declared actions that say so) **is in a "More actions" menu** (`…`), at the end of the header of an item and of each row. Its placement still says on which surfaces it is.
- **In the header of an item** (its form and its panel), the other actions stay buttons, all secondary, links included. The menu comes after them. When an item has no other action, the menu holds the actions that destroy alone: "Delete" is still two clicks away, not one.
    - The menu button is an outlined icon button, as high as the buttons beside it, named "More actions" ("Plus d'actions"), with that name as its tooltip.
- **In rows**, the actions that destroy are always in the row's menu, at every width, even alone in it: the rule of [0060](0060-row-actions-colored-icons.md) that a menu never holds a single action keeps holding for the others. When the icons don't fit, the other actions join them in the menu, from the last, as before.
    - Rows still line up: a row without the action that destroys (an item that can't be deleted) keeps the place of the menu button.
- **What doesn't change:**
    - In the menu, an action that destroys keeps its icon and the danger color.
    - Its confirmation, and "Undo" in place of it ([0063](0063-undo-instead-of-a-confirmation.md)).
    - The bulk actions of a selection: "Delete" is a button of the selection's bar, the only place where it is the point.
    - Which actions an item has: `getItemActions()` of `@panneau/core` decides them, and each surface only places them.

## Consequences

- A resource with only the built-in actions shows its links and "Duplicate" as buttons in the header of its items, then `…`, which holds "Delete". Its rows show the main action with its label, the icons of the others, then `…`.
- A row has a menu on every list where items can be deleted. Rows of five actions or more give the content room as before, counting the actions that destroy among those in the menu.
- `ItemActions` of `@panneau/app` and `RowActions` of `@panneau/lists` render the menu. No change of the protocol, of `getItemActions()` or of the backend.
