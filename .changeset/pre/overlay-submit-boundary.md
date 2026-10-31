---
'@panneau/ui': patch
---

Submitting a form in a `Dialog` or a `Popover` no longer submits the form around it. React bubbles events along the component tree, through the portal the overlay renders in, so the dialog's form also submitted the form that opened it (a resource's form, for example). The content of `Dialog` and `Popover` now stops the `submit` events that leave it.
