---
'@panneau/app': patch
'@panneau/ui': patch
---

The "Go to…" palette opens an item where its title opens in its list: its form, or its panel when its resource has `"open": "panel"` or the user can't update the item (decision 0082). Search results and recent items used to always open the form. Recent items now remember whether the user could update the item; those recorded before open the show route, which goes to the form once the item says it can be updated. The palette also highlights, in labels, the first match of each word of the query, ignoring case and accents. `CommandPalette` of `@panneau/ui` takes `highlightMatches` for this, with the `match-bg`, `match-color` and `match-font-weight` tokens; the marks are presentational, so screen readers read labels as before.
