---
'@panneau/fields': patch
'@panneau/media': patch
'@panneau/ui': patch
'@panneau/intl': patch
---

Undo a removal in a field: removing an item of a repeater, a card of a relation or a media of a media field now offers "Undo" in a toast (decision 0063), which puts it back at its place, with its value. Outside a `PanneauRoot`, where there is no toast region, the removal stays immediate. Repeater items now have a stable key, which isn't part of their value: the state of their fields (an editor's history), whether they are expanded and the focus follow them when they move. `@panneau/ui` exports `useUndoToast()`, which offers "Undo" in a toast and is `null` outside a `PanneauRoot`.
