---
'@panneau/ui': patch
'@panneau/fields': patch
'@panneau/lists': patch
---

Filters that look like the other controls, and actions that show where they fit.

- The filters of a list's toolbar are boxes with the radius, the height and the border of the other controls, not pills. The whole box, label included, is one control: a press on the label opens a select or focuses the input. The clear button is inside the box, at its end, after the value. A switch has no box. `Select` takes `labelInside`, which shows the label in the button, before the value, and keeps it as the accessible name.
- A searchable select (`ComboBox` with `menuTrigger="focus"`) opens on a press even when its input already has the focus, as after a choice, and selects its text; a press while the list is open places the caret.
- The actions of a relation card and of an item of a repeater or of blocks are buttons while they fit next to the title, and one "⋯" menu when they don't, measured rather than set at a width (decision 0114). `@panneau/ui` exports `useActionsFit()` for such rows.
