---
'@panneau/ui': patch
'@panneau/fields': patch
'@panneau/intl': patch
'@panneau/lists': patch
---

Fields and filters that keep their shape in narrow places.

- The time zone of a date-time and of a range of dates leaves the input (#517): it shows under it, as help text, in short (`UTC−4 · America/Toronto`), with its long name as its tooltip and its description. The input stays on one line, as high as the other controls. `DatePicker` and `DateRangePicker` take a `hint`, shown under the control and describing it.
- The cards of a relation field give their title the room of the row (#518): "Change" and "Edit" are icon buttons with tooltips, the title keeps a minimum width and shows in full in its tooltip, and a narrow card puts its actions, with its moves, in one "Actions" menu. `@panneau/ui` exports `useReorderMoves()`, the moves of an item of a `ReorderList`, for such a menu.
- The filter bar of a list keeps a stable layout (#519): its filters are chips with their label inside (`Status: Any`), sized to their content, with their clear button inside. When the search, the filters and the controls of the list don't fit on one line, the search and the controls take the first row and the filters wrap under them. A narrow list doesn't change.
