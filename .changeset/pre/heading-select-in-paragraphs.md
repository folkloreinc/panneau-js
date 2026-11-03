---
'@panneau/editor': patch
---

The text style select of the rich text field works in a paragraph. It was disabled there, because it asked whether `setParagraph()` could run, which is false in a paragraph: it now asks whether the selection can take any of its styles.
