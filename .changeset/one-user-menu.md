---
'@panneau/app': minor
'@panneau/intl': minor
---

One user's menu at the bottom of the sidebar (decision 0086). The footer only shows the user's avatar, name and email, as one button that opens a menu: who is logged in with their whole email, "Profile", "Appearance" and "Language" as choices with a check on the current one, then "Log out". In the rail, the avatar alone opens it. The dock's user's menu is the same menu. The buttons of the appearance and of the language and the "Log out" button leave the footer, and `@panneau/intl` gains `panneau.app.userMenu` ("Your account ({name})"), the label of the button.

The classes `.panneau-sidebar-user-link` and `.panneau-dock-user-menu` are gone: the user's button is `.panneau-sidebar-user` (with `[data-current]` on the profile), and the menu's popover `.panneau-user-menu-popover`.
