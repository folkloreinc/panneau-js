---
'@panneau/lists': minor
---

Row actions are buttons with their labels, then their icons alone when the row lacks room, and a menu only when even those don't fit (decision 0060). `duplicate`, `delete` and the actions placed in `menu` are buttons too while they fit; the menu never holds a single action. The list measures the room it has (the content of its columns, its width), chooses the same layout for every row, and keeps the place of the actions a row doesn't have, so they line up. `delete` keeps its confirmation, and its button is red.
