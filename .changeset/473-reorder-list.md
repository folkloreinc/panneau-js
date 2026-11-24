---
'@panneau/ui': patch
'@panneau/intl': patch
---

`ReorderList`, `ReorderItem` and `ReorderHandle` reorder the items of a list by dragging a handle (decision 0111): with the pointer and touch through the browser's drag and drop, and with the keyboard and screen readers through React Aria's (Enter or Space picks an item up, Tab or the arrows go from place to place, Enter or Space drops, Escape cancels). Only the handle drags, so the text and fields of an item stay selectable and keep their focus. The list is controlled: it calls `onMove(from, to)` and says the move in a status message. A line shows where the item would go, and items slide to their new places with `--panneau-duration-slow`, not with reduced motion. New messages in `uiMessages`: `reorderItem`, `reorderHandle`, `reorderBefore`, `reorderAfter`, `reorderMoved`.
