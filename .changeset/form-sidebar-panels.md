---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/ui': patch
'@panneau/intl': patch
'@panneau/forms': patch
'@panneau/app': patch
---

The panels of a form's sidebar, defined by the resource (decision 0075). A `sidebar` node of a form layout with a `panel` is a block of the app or of a plugin, which gets the node, the form, its fields and its children rendered (`FormPanelProps`), with the node's `props`. A panel that no component provides renders its children.

- Plugins register panels under `panels`, a new kind of `@panneau/core`, and `Form` takes `panels`. In the app, `useFormPage()` gives a panel the resource and the item of its form.
- Built-in panels: `save` (the state of the form and its Save button) and `errors` (the errors after a failed save) in `@panneau/forms`, which show beside the form only, where the form then has no footer nor summary at the top; `publication` in `@panneau/forms/publication`, with Publish and Unpublish buttons that set the publication and save; `actions` in `@panneau/app`, which takes the actions of the item out of the page header.
- `AsidePanel` takes `isBesideOnly`, and an aside hides its empty panels.
- The `pages` of the protocol's example have a sidebar with these panels.
