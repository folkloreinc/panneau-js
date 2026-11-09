---
'@panneau/ui': patch
'@panneau/intl': patch
'@panneau/forms': patch
'@panneau/app': patch
'@panneau/protocol': patch
---

One aside next to lists and forms (decision 0073). `@panneau/ui` has `Aside`, the column next to the main content of a page or a form, made of `AsidePanel`s, and `AsideLayout`, which places it: beside the content from 56rem of the layout, where it stays in view as the page scrolls, and below the content or over it on narrower layouts. A button widens it, panels with a title collapse, and the browser remembers both under a key (`usePreference`, which moves from the app to `@panneau/ui`). Its look comes from the new `aside` component tokens.

The item panel of lists is an `Aside`: it goes beside the list from 56rem of the list's column, and its close button is labelled "Close". The `--panneau-item-panel-*` tokens and `itemPanelTokens` of `@panneau/app` are gone: set `--panneau-aside-*` instead. The classes of the panel's header, toolbar and body are now those of `.panneau-aside`, and `.panneau-form-layout`, `.panneau-form-sidebar` and `.panneau-form-with-sidebar` give way to `.panneau-aside-layout` and `.panneau-aside`.

The `sidebar` nodes of form layouts are panels of an `Aside`: a card that stays in view as the form scrolls. A `sidebar` with a `label` has a title, which the user can collapse unless `collapsible: false`, and `collapsed: true` starts it collapsed. It opens to show an error. `Form` takes `sidebarStorageKey`, under which the browser remembers its collapsed panels; the app sets it per resource.
