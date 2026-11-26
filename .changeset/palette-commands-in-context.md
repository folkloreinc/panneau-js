---
'@panneau/core': minor
'@panneau/app': minor
'@panneau/intl': minor
---

The "Go to…" palette acts on the current page (decision 0116). A new "On this page" group, at the top, offers the actions of the item open in its form or panel, which run as their buttons do (same confirmation, runner and toasts), and the commands of plugins that apply. `CommandContext` gets the current `page` (`route`, `resource`, `item`, `selection`), a `Command` declares when it applies with `when(context)`, and `perform(context)` gets the context. Commands without `when` show in their group as before. `@panneau/core` adds `appliesTo()` and `hasSelection()`.
