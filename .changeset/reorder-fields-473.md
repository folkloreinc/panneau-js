---
'@panneau/ui': patch
'@panneau/intl': patch
'@panneau/fields': patch
'@panneau/media': patch
---

Fields reorder their items by dragging a handle (#473, decisions 0109 and 0111), with the pointer, touch, or the keyboard, and announce each move:

- Repeaters and blocks: a handle at the start of each item's header. "Move up" and "Move down" stay in the tools. Values, errors, open state and focus follow each item by its key, and "Undo" after a removal still works after a move.
- Multiple relations: a handle on each card, and a menu of moves ("Move to the start", "Move before…", "Move after…", "Move to the end") before "Remove".
- Multiple media: a gallery of images reorders as a grid, with the handle and the menu on each image's name; other media reorder as cards. The files of a multiple `file` field reorder too.
- Read-only and disabled fields have no handle.

`@panneau/ui` adds what they use: `ReorderList` takes `layout="grid"`, lists inside items let the drags of other lists through, `ReorderMenu` is the menu of moves, `TileGroup` reorders its tiles with `onMove` and `itemLabel`, `moveItem()` moves a value of a list, and `isReorderDrag()` lets a drop zone refuse the drags of reorderable items, as the drop zones of files of `@panneau/fields` now do. `@panneau/intl` has the messages of the menu, and `namedItem` for the names of repeater items.
