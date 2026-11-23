---
'@panneau/lists': patch
---

The details of an item show its values in full, as list cells don't. Displays get a `variant` (`DisplayVariant`): `cell` in lists, where nothing changes, and `details` in `ItemDetails`, which plugins' displays get too. In details, related items are a list linked to their items, through the `getItemHref()` of the relation source of the fields (the app gives it), with their image, their description and the labels of plain ids; every media shows, not the first one; text keeps its line breaks and JSON is indented, without the two-line clamp of a cell; and a localized value shows each of its locales under its name, the interface's locale first.
