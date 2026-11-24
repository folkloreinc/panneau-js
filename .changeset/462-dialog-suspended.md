---
'@panneau/ui': patch
---

`Dialog` takes `isSuspended`: it hides the dialog for a moment while it stays open, its content keeping its state, and the page around it is no longer inert. A window that a script adds to the page from the dialog, such as a file picker of another site, can then take the focus and the clicks, and the dialog comes back as it was.
