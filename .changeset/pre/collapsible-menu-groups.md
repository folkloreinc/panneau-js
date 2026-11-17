---
'@panneau/protocol': patch
'@panneau/app': patch
---

Menus can have collapsible groups and emphasized entries (decision 0079). A `group` with a label and `"collapsible": true` has a button for its title in the sidebar, which shows or hides its links; the browser remembers the user's choice. `"collapsed": true` starts it closed, unless it holds the current page. `"emphasis": true` on a `resource`, `page` or `link` shows its label in bold, in the sidebar and the dock. New sidebar tokens: `link-emphasis-color` and `link-emphasis-weight`.
