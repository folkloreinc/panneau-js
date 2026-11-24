---
'@panneau/ui': patch
'@panneau/lists': patch
'@panneau/forms': patch
'@panneau/fields': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Polish of the interface (#487):

- `SegmentedControl`: the highlight slides from one segment to the next (`--panneau-duration-slow`, none when the user prefers reduced motion), keeps its padding in every size and density, and the selected segment is readable in the dark scheme.
- `Pagination` of lists: buttons for the first and the last pages, and the current page opens "Go to page", a number field (Enter goes there, within the pages; Escape closes it). Messages in English and French.
- `DatePicker` with a time, and the slug field: in a narrow box, such as the form's sidebar, the date and the time go on two lines, and the slug's prefix is cut rather than its input.
- Hints of keyboard shortcuts (decision 0112): `Tooltip`, `IconButton`, `MenuItem` and the items of `CommandPalette` take a `shortcut`, whose keys show at their end. "Go to…" of the sidebar and the dock no longer shows ⌘K on the button, but in its tooltip; the sidebar's toggle shows ⌘\, "Keyboard shortcuts" shows ?, and the Save button's tooltip names it before its keys.
- The user's menu: the appearance and the density are rows of icons after the menu, each named by its tooltip (decisions 0086 and 0104 amended). `Menu` takes `isInline`, to sit in a popover with other controls.
- Lists: the "Select" button keeps only its icon, with its name in a tooltip. A select filter with a value has its clear button in place of its arrow (`Select` takes `onClear` and `clearLabel`, and `FilterControlProps` gives them to a control that clears itself), and a list sorted by a column tints its sort button as a filter with a value.
- Forms: the floating save bar keeps clear of the home indicator and the rounded corners of phones (`env(safe-area-inset-*)`), and an empty status no longer pushes its button.
