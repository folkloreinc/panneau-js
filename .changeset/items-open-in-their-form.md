---
'@panneau/protocol': minor
'@panneau/core': minor
'@panneau/app': minor
---

**Items open in their form by default (decision 0082).** `edit` is now the default of a resource's `open`: the title of an item opens its edit form, its show route redirects there, and rows show "Edit" without "View". The panel of an item's details is now a choice of the resource, `"open": "panel"`, for items read more than edited or shown with their preview. An item the user can't update still opens in the panel. `getOpenMode()` returns `edit` unless the resource says `panel`, and clients treat an `open` they don't know as `edit`.

**Breaking:** a definition without `open` used to open items in the panel. To keep it, set `"open": "panel"` on the resource.

Also fixes the show route of an item that opens in its form when its fetch fails (`403`, `404`): the page showed nothing, as the panel's refetch made it wait again. It now shows the panel with the error.
