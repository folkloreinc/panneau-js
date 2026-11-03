---
'@panneau/lists': patch
'@panneau/app': patch
---

The panel of an item shows the values of its groups ([decision 0041](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0041-groups-in-item-details.md)).

- `@panneau/lists`: `ItemDetails` takes groups: a column with `columns` (`ItemDetailsColumn`, exported) lists the values of its fields under its label, indented, read in the value of the column. While the item loads, each of them has its skeleton. New classes: `panneau-item-details-group` and `panneau-item-details-nested`.
- `@panneau/app`: the panel of an item shows its `group` fields, with their nested fields, instead of leaving them out. Repeaters stay in the form only.
