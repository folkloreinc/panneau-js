---
'@panneau/ui': minor
---

Loading icons by name is now opt-in, so that apps that never name icons no longer get one chunk per Lucide icon (about 1,900) and their map in the runtime of every page. `PanneauRoot` takes an `iconLoader`: pass `lucideIconLoader` from the new `@panneau/ui/named-icons` entry point, or a loader of only the icons the app uses. Without one, named icons render an empty space, with a warning. **Breaking:** `loadNamedIcon(name, loader)` takes the loader, and apps whose definitions name icons (actions with `"icon"`) must set `iconLoader`.
