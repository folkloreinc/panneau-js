# 0111: Reorder the items of a list by dragging a handle

- Status: accepted
- Date: 2026-11-23
- Issue: [#473](https://github.com/folkloreinc/panneau-js/issues/473)
- Updated: 2026-11-24: lists inside items, a grid, a menu of moves, tiles, and the fields that use it
- Uses: [0068](0068-collapsed-items-and-lighter-controls.md) (the tools of an item), [0072](0072-touch-targets-follow-the-density.md) (targets), [0081](0081-motion-tokens-and-leaving-items.md) (motion), [0095](0095-focus-and-announcements-in-lists.md) (focus and status messages)

## Context

The items of a repeater move one place at a time, with "Move up" and "Move down": the twelfth block goes second in ten presses. Multiple relations and multiple media can't be reordered at all.

Items hold whole forms (text inputs, rich text editors), so a drag must not take the item itself: its text must stay selectable, and the focus inside it must stay. React Aria, already in the stack, has two levels of drag and drop:

- `useDragAndDrop` of its collection components (`GridList`, `ListBox`). Their items are rows of a grid or options: arrow keys, typeahead and selection belong to the collection, and the whole row is `draggable`, so a form in an item fights them, and its text can't be selected with the mouse.
- `useDrag` and `useDrop`, exported by `react-aria-components`. They take any element: a drag starts from an element of our choice, with the browser's drag and drop for the pointer and touch, and with React Aria's drag manager for the keyboard and screen readers, which moves the focus through the registered drop targets and makes the rest of the page inert while an item is held.

A prototype with a text input and the rich text editor in each item showed that the second level fits: text stays selectable and editable, a drag of text doesn't move the item, the handle drags with a real mouse in Chromium, and the keyboard picks up, moves and drops. No new dependency is needed.

## Decision

**`@panneau/ui` has `ReorderList`, `ReorderItem` and `ReorderHandle`**, on `useDrag` and `useDrop`:

- **A handle, not the item.** Only `ReorderHandle` is `draggable`. It is one target of the density or a small control, whichever is larger ([0072](0072-touch-targets-follow-the-density.md)): the size of the small icon buttons of an item's header. It is named "Move" and the name of the item.
- **Controlled.** The list calls `onMove(from, to)`, and never changes the order itself. Each item has a key that stays when it moves (`id`), so that the caller's state follows it ([#417](https://github.com/folkloreinc/panneau-js/issues/417)).
- **Within one list.** The dragged data has a type of its own list: another list refuses it. It also has a type shared by every list, `REORDER_DRAG_TYPE`: a drop target that takes something else, as the drop zones of files of the fields, refuses the drags for which `isReorderDrag()` is true. Without it, React Aria counts such a drop zone among the places of a keyboard drag, and may even focus it first.
- **Lists inside items**, as a repeater in a repeater: a list takes the drops of the pointer only while one of its own items is dragged. React Aria stops the events of a drag at a drop target, even one that refuses it: a list that always listened would keep the drags of the list around it from going through it, and the files dragged to a drop zone around it. Each list has its own handles and places, and an item of an inner list stays in it.
- **The pointer and touch** use the browser's drag and drop (a long press on touch screens). The list takes the drop at the gap nearest to the pointer: before the item whose middle is past it, or after the last one. The image that follows the pointer is a copy of the item, or of its part marked `data-reorder-preview`, such as its header.
- **The keyboard and screen readers**: Enter or Space on the handle picks the item up. The places it can go are drop targets of React Aria, named "Before Quote" or "After Credits"; Tab, Shift+Tab and the arrows go through them, Enter or Space drops, Escape puts the item back. The two places around the item, which don't move it, aren't targets. After a drop, the focus goes back to the handle, at the item's new place.
- **A line shows where the item would go**, on the edge of the item before it or after the last one, in the focus color: under the pointer, or on the target that has the focus.
- **Motion** ([0081](0081-motion-tokens-and-leaving-items.md)): after a move, items slide from where they were to their new places (`--panneau-duration-slow`, `--panneau-ease-out`), and the line fades with `--panneau-duration`. With reduced motion the durations are 0, and nothing slides.
- **Announcements** ([0095](0095-focus-and-announcements-in-lists.md)): the list has one polite status message, "Quote moved to position 1 of 4" once an item moved. React Aria says how to drag and drop while it does, in its own messages.
- **A list of one item, or a disabled list**, has disabled handles.
- **A grid** (`layout="grid"`), as a gallery of images in rows: the place under the pointer is before the tile whose middle is past it on its row, or before the first tile of the next row; the line is on the side of the tile, at its inline start (or end, after the last one); the keyboard goes through the places with the four arrows, which follow the direction of the text.
- **A menu of moves**, `ReorderMenu`, in the tools of an item: "Move to the start", "Move before Quote", "Move after Credits", "Move to the end", each when it moves the item. It is the path on phones for cards and tiles, which have no room for two arrows. It has no button in a list of one item or a disabled list. The focus goes back to its button, at the item's new place, and the move is announced as a drag is.
- **Tiles** (`TileGroup` with `onMove` and `itemLabel`): each tile has a handle before its media, above the link of a linked tile, and the caller puts a `ReorderMenu` in its actions.
- **`moveItem(list, from, to)`** gives a copy of the values in the new order, for the `onMove` of the caller.

**The move buttons stay**, in each item's tools: they are the path on phones, where a long press is not obvious, and in browsers where the drag and drop of the page doesn't work with touch. Where an item has no room for two arrows (cards, tiles, images of a gallery), `ReorderMenu` is that path.

## Consequences

- The repeater and blocks use it first, with the handle at the start of the item's header and the tools unchanged ([0109](0109-duplicate-add-in-between-and-titled-blocks.md)).
- Multiple relations: the cards are a `TileGroup` with `onMove`, and `ReorderMenu` before "Remove". The compact chips of a relation field don't reorder.
- Multiple media: a gallery of images is a grid, with the handle at the start of each image's name and `ReorderMenu` at its end, under the image, so the tools over it (Edit, Remove) stay as they are. Other media are tiles, as relations are. A file of a multiple `file` field has its handle at its start and `ReorderMenu` before its button to remove it.
- A field that is read-only or disabled has no handle and no menu. Its value follows the order of the items, and "Undo" after a removal puts the item back by its key, at its new place.
- Moving an item to another list is out of scope.
- A drag with the pointer can't be driven by the test runner in the frame of a story: stories dispatch the events of the browser's drag and drop. The drag on touch screens is the browser's, and isn't checked by CI.
- `@panneau/ui` only depends on `react-aria-components`; nothing loads the drag manager of React Aria until a list uses it.
