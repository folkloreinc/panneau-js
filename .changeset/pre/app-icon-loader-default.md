---
'@panneau/app': minor
---

Apps that render `<Panneau>` with their own `iconLoader` no longer bundle every Lucide icon (about 1,900 chunks). `<Panneau>` has no default `iconLoader` anymore: without one, named icons render an empty space, as with `PanneauRoot`. Pass `lucideIconLoader` of `@panneau/ui/named-icons` for every Lucide icon, as before. `createPanneauApp()` keeps it as its default, so entries written by `panneau:install` don't change (decision 0036).
