---
'@panneau/protocol': patch
'@panneau/fields': patch
'@panneau/intl': patch
---

A definition can turn on the shortcuts of a `date` field: `settings.shortcuts` lists `today`, `yesterday`, `tomorrow`, or dates worked out from today or from another date field of the same object (`{ "label": "A year after the start", "from": "starts_on", "years": 1 }`), disabled while that field is empty. A single `select` with more than 10 options, or with `settings.search: true`, is a combo box whose options are filtered as the user types, with the same value; `settings.search: false` keeps the dropdown. The protocol describes both settings (`DateSettings`, `DateShortcut`, `SelectSettings`, `DATE_SHORTCUTS`), and `validateDefinition()` checks them.
