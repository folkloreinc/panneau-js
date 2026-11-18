---
'@panneau/app': minor
'@panneau/lists': minor
---

Destructive actions in a menu (decision 0088). In the header of an item, its edit form and its panel, actions that destroy (`destructive: true`, as the built-in `delete`) are no longer solid danger buttons before the others: they are in a "More actions" menu (`…`), after the other actions, which are all secondary buttons. In rows, they are always in the row's menu, at every width, even alone in it; a row that doesn't have them keeps the place of the menu. In both menus, they keep their icon and the danger color, their confirmation and "Undo". The bulk actions of a selection don't change.
