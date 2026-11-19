---
'@panneau/protocol': minor
'@panneau/data': minor
---

Shared block types (decision 0093): the definition can share lists of block types in `blockTypeSets`, and a `repeater` can name one with `typeSet` rather than repeat its `types`. `validateDefinition()`, `validateBootConfig()` and the REST adapter's `getDefinition()` resolve them into `types`, the same array for every repeater that names a set, and `resolveBlockTypeSets()` does it for a definition validated otherwise. A missing set, a field with both `types` and `typeSet`, and a set that holds itself are issues of the definition.
