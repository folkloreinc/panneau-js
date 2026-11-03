# 0041: The panel of an item shows the values of its groups

- Status: accepted
- Date: 2026-11-03
- Changes: what the panel of [0028](0028-item-panel.md) shows

## Context

[0028](0028-item-panel.md) left groups and repeaters out of the panel of an item: "only the form shows" them. A group is often where the details are, though. An order sent through a site's form keeps its customer's name, email and phone in a `contact` group, and its address in an `address` group: its panel shows the product and the amount, but not who ordered it nor where to send it. The resource opens in its form (`"open": "edit"`, [0040](0040-row-links-and-open-mode.md)) for that reason alone, though the panel suits it: its values are read-only, and they are read one order after another, from the list.

A group is one object of named values, which the displays of the lists already know how to show one by one. A repeater is a list of such objects, of any length, sometimes typed blocks with their own fields: a panel has no good way to show it.

## Decision

- **The panel shows a group as its label, with the values of its fields under it**, indented, in the order of the fields. Groups in groups nest the same way. The values use the displays of the lists, as the other values of the panel do. A group without a value shows its labels, with empty values.
- **Repeaters stay in the form only**, as before.
- **`ItemDetails` of `@panneau/lists` takes groups:** a column with `columns` (`ItemDetailsColumn`) is a group, whose values are read in the value of the column, an object. While the item loads, it draws the labels of the group and a skeleton of each of its values. Lists outside the app can use it the same way.

## Consequences

- A resource whose details are in groups can open in its panel. Its definition doesn't change.
- `@panneau/lists` exports `ItemDetailsColumn`. Its stylesheet has `.panneau-item-details-group` and `.panneau-item-details-nested`.
