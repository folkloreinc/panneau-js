# 0088: Actions that destroy come last, outlined

- Status: accepted, amended the same day: last and outlined in the header, instead of a menu, and rows as before (see [Amendment](#amendment-one-place-for-the-actions-of-an-item))
- Date: 2026-11-18
- Issue: [#322](https://github.com/folkloreinc/panneau-js/issues/322)
- Amends: the header of an item in [0040](0040-row-links-and-open-mode.md)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The header of an item, in its edit form and in its panel, shows the actions of the item ([0040](0040-row-links-and-open-mode.md)) as buttons, and each action that destroys as a solid danger button. The built-in item actions come before those a resource declares, so "Delete" sits before a link such as "View on the site": the first button of the header, and the only one in color.

People delete an item rarely, and it is the action they least want to hit by mistake. It shouldn't be the most visible one, next to the title of every item.

## Decision

- **The actions of an item stay in one place**: the header of its form and of its panel, or the `actions` panel of the form's sidebar when its layout has one ([0075](0075-panels-of-a-form-sidebar.md)). The footer of a form is for saving and for the state of the item, not for its actions.
- **Actions that destroy come last** (`destructive: true`: the built-in `delete`, and declared actions that say so), after the links and the other actions, whatever the order of `getItemActions()`.
- **Outlined, not filled:** their icon, label and border in the danger color, without a fill (the `outline` appearance of the `danger` tone). The other actions are secondary buttons.
- **What doesn't change:**
    - Their confirmation, and "Undo" in place of it ([0063](0063-undo-instead-of-a-confirmation.md)).
    - Rows ([0060](0060-row-actions-colored-icons.md)): "Delete" is the last icon of each row, in its danger color, and goes to the row's menu only when the icons don't fit.
    - The bulk actions of a selection: "Delete" is a button of the selection's bar.
    - Which actions an item has: `getItemActions()` of `@panneau/core` decides them, and each surface only places them.

## Amendment: one place for the actions of an item

The first version of this decision (in 5.0.0-alpha.39) put the actions that destroy in a "More actions" menu (`…`) at the end of the header of an item and of each row, even alone in it. "Delete" was then the only item of a menu on every item and on every row of a list where items can be deleted: a wasted click, and a menu that hides what it holds.

Moving "Delete" to the footer of the form and of the panel was considered next. It spreads the actions of an item over two more places, beside "Save" and in the sidebar's `save` panel, which will also hold the state of the item (its versions, its autosave). One place, with the action that destroys last and outlined, is quieter than a solid button and as easy to find.

## Consequences

- A resource with only the built-in actions shows its links, "Duplicate", then "Delete", outlined in red, in the header of its items.
- `ItemActions` of `@panneau/app` orders and outlines the actions that destroy. No change of the protocol, of `getItemActions()` or of the backend.
