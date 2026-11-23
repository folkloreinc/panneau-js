---
'@panneau/fields': patch
'@panneau/media': patch
'@panneau/intl': patch
---

Media fields take files dropped anywhere on them, their media included, with a visible and announced drop state and the same checks as their button (types, size, one file without `multiple`), and files pasted while the focus is inside them, except in a text input. The search of the media picker, and its text filters, wait for a pause in typing (300 ms), and Enter searches at once. A media uploaded in the picker or the media library now shows first in the library it went to, whatever the sort, until the next search, filter or sort, and once only when the pages that follow have it too. `@panneau/fields` exports `FileDropZone`, the zone that takes these drops and pastes, and `FilePicker` gets `isDroppable`, `false` inside one.
