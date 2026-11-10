---
'@panneau/app': patch
'@panneau/protocol': patch
'@panneau/intl': patch
'@panneau/ui': patch
'@panneau/forms': patch
---

A dock, in place of the sidebar (decision 0076). With `theme.navigation: "dock"` in the definition, the app shows the `main` menu in a dock at the bottom of the window instead of the sidebar: a raised pill from the `lg` width, where groups open their links in a menu, then "Go to…", the queued action runs and the user's menu (profile, color scheme, log out). On phones, it is a bar of tabs with the first entries and "More" for the others. A bar at the top keeps the site and the current context. `@panneau/protocol` adds `navigation` (`sidebar`, the default, or `dock`) to the definition's theme, and `@panneau/app` exports `dockTokens` (`--panneau-dock-*`). The footer of forms, asides beside the content and toasts stay above the dock (`--panneau-frame-bottom`). Menu items that are links are no longer underlined.
