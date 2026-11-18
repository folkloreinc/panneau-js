---
'@panneau/app': patch
'@panneau/forms': patch
'@panneau/lists': patch
'@panneau/ui': patch
---

Actions that destroy at the bottom of the form and of the panel, instead of a menu (decision 0088, amended). In the header of an item, "Delete" (and every action with `destructive: true`) is no longer in a "More actions" menu: it moves to the start of the edit form's footer, opposite "Save" (or into the `save` panel of its sidebar, opposite "Save" too), and to the footer of the item's panel. It is a quiet button, its icon and label in the danger color without a fill, and keeps its confirmation and "Undo". The header keeps the links and the other actions. In rows, "Delete" is the last icon of the row again, as before 5.0.0-alpha.39, and goes to the row's menu only when the icons don't fit. `Form` takes `startActions`, and `Aside` a `footer`.
