---
'@panneau/app': patch
'@panneau/lists': patch
---

Actions that destroy come last, outlined (decision 0088, amended). In the header of an item, its edit form and its panel, "Delete" (and every action with `destructive: true`) is no longer in a "More actions" menu: it is a button again, after the links and the other actions, outlined in the danger color without a fill. It keeps its confirmation and "Undo". In rows, "Delete" is the last icon of the row again, as before 5.0.0-alpha.39, and goes to the row's menu only when the icons don't fit.
