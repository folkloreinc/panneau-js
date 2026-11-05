---
'@panneau/protocol': minor
'@panneau/intl': minor
'@panneau/actions': minor
---

Items in use (#240): a backend that can't delete an item because something else uses it (a media that a model uses) skips it with the reason `in_use`, instead of failing the whole run.

- `@panneau/protocol`: `in_use` in the reasons of skipped items, in the JSON Schema, the OpenAPI spec and `docs/protocol.md`, where a `DELETE` of an item in use answers a `409` problem. The mock backend takes an `inUse` option: its `delete` skips those items with `in_use`, alone too, and leaves them out of its `undo`.
- `@panneau/intl`: `reasonInUse`, `inUseItem` and `inUseCount`, in English and French.
- `@panneau/actions`: the toast of a result says which item is in use, by its title when it is the only one (“essai.png” is in use elsewhere: remove it from where it is used, then try again.), or how many, with what was done. With nothing done, it has no "Undo", nor details that would repeat it. `describeResult()` takes the title of the item as a fifth argument.
