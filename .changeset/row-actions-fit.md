---
'@panneau/lists': minor
'@panneau/app': minor
---

Row actions are icons in their colors, as in Panneau 4, the same in every list (decision 0060): `show` blue (`info`), `edit` in the main color, `delete` red, with their labels as names and tooltips. The main action, the one the title opens, keeps its label (`primaryAction` of `ListView`; the app sets it from `open`). `duplicate`, `delete` and the actions placed in `menu` are icons too: the `•••` menu only takes the last actions when the icons don't fit (many actions, a narrow list, a phone), and never a single one. The list measures the room it has, chooses the same layout for every row, and keeps the place of the actions a row doesn't have, so they line up. `delete` keeps its confirmation.
