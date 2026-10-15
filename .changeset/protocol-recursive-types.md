---
'@panneau/protocol': patch
---

Keep recursive schemas typed in the published declarations: `Condition.all` and `any`, `Field.fields` and `types`, `BlockType.fields`, `LayoutNode.children` and `MenuItem.children` were typed as `Record<string, unknown>[]` instead of their own type.
