---
'@panneau/fields': patch
'@panneau/protocol': patch
'@panneau/intl': patch
---

Repeater and blocks (decision 0109). Each item has "Duplicate", which adds a copy right after it, expanded, with the focus on its header. Between two items, a control that shows on hover and keyboard focus adds an item there, or opens the menu of block types. That menu shows each type's `icon` and its new `description`. A repeater's `settings.itemTitle`, or a block type's `itemTitle`, names the field (`"title"`) or the template (`"{first_name} {last_name}"`) that titles each item; `RepeaterSettings` describes the settings of a repeater, and `validateDefinition()` checks them. The built-in repeater now loads with its first use, as the other heavy field types do: the first page of an app doesn't load it.
