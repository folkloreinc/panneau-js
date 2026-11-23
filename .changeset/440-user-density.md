---
'@panneau/app': patch
'@panneau/intl': patch
'@panneau/protocol': patch
---

Users choose the density. The user's menu has "Density" after "Appearance": Compact, Comfortable, and Default, the density of the definition's theme, checked until the user picks another. "Go to…" offers the same choices. The browser remembers the choice, like the color scheme (`panneau:density`). With the `auto` density, touch screens keep the touch density whatever the user chose, and have no choice. `theme.lockDensity: true` in a definition hides the choice and ignores one kept in the browser.
