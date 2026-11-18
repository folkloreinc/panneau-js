# 0088: Actions that destroy at the bottom of the form and of the panel

- Status: proposed, amended the same day: at the bottom of the form and of the panel instead of a menu, and rows as before (see [Amendment](#amendment-a-danger-zone-at-the-bottom))
- Date: 2026-11-18
- Issue: [#322](https://github.com/folkloreinc/panneau-js/issues/322)
- Amends: the header of an item in [0040](0040-row-links-and-open-mode.md), and the `save` and `actions` panels of [0075](0075-panels-of-a-form-sidebar.md)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The header of an item, in its edit form and in its panel, shows the actions of the item ([0040](0040-row-links-and-open-mode.md)) as buttons, and each action that destroys as a solid danger button. The built-in item actions come before those a resource declares, so "Delete" sits before a link such as "View on the site": the first button of the header, and the only one in color.

People delete an item rarely, and it is the action they least want to hit by mistake. It shouldn't be the most visible one, next to the title of every item.

## Decision

- **An action that destroys** (`destructive: true`: the built-in `delete`, and declared actions that say so) **leaves the header of an item** and goes to its bottom: the "danger zone" of many apps, where people find it when they look for it. Its placement still says on which surfaces it is.
- **In the edit form**, it is at the start of the footer, opposite "Save" (`startActions` of `Form`). When the form's layout puts the `save` panel in its sidebar ([0075](0075-panels-of-a-form-sidebar.md)), it follows "Save" there, opposite it too. The `actions` panel, which takes the header's actions, leaves it out as the header does.
- **In the panel of an item**, it is in the panel's footer, under its details (`footer` of `Aside`).
- **A quiet button:** its icon and its label in the danger color, without a fill (the `ghost` appearance of the `danger` tone). No solid danger button.
- **The header keeps the links and the other actions,** as secondary buttons.
- **What doesn't change:**
    - Its confirmation, and "Undo" in place of it ([0063](0063-undo-instead-of-a-confirmation.md)).
    - Rows ([0060](0060-row-actions-colored-icons.md)): "Delete" is the last icon of each row, in its danger color, and goes to the row's menu only when the icons don't fit.
    - The bulk actions of a selection: "Delete" is a button of the selection's bar.
    - Which actions an item has: `getItemActions()` of `@panneau/core` decides them, and each surface only places them.

## Amendment: a danger zone at the bottom

The first version of this decision (in 5.0.0-alpha.39) put the actions that destroy in a "More actions" menu (`…`) at the end of the header of an item and of each row, even alone in it. "Delete" was then the only item of a menu on every item and on every row of a list where items can be deleted: a wasted click, and a menu that hides what it holds. Rows go back to [0060](0060-row-actions-colored-icons.md), where a red icon at the end of the row is clear and doesn't crowd the title. The header has no menu: "Delete" moves to the bottom of the form and of the panel.

## Consequences

- A resource with only the built-in actions shows its links and "Duplicate" in the header of its items, and "Delete" at their bottom, at the left of the form's footer.
- `Form` of `@panneau/forms` takes `startActions`, and `Aside` of `@panneau/ui` a `footer`. `ItemActions` of `@panneau/app` renders an action that destroys as a quiet button. No change of the protocol, of `getItemActions()` or of the backend.
