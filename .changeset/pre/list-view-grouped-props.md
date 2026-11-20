---
'@panneau/lists': minor
'@panneau/codemods': minor
'@panneau/app': patch
---

`ListView` and `List` group their props by what they are about, before the API freezes in 5.0:

- `actions={{ available, onRun, preview, icons, primary }}` takes the place of `actions`, `onAction`, `previewAction`, `actionIcons` and `primaryAction`;
- `inline={{ fields, onEdit, formatError }}` takes the place of `inlineEdit`, `onInlineEdit` and `formatError`;
- `layouts={{ available, current, onChange, components }}` takes the place of `layouts`, `layout`, `onLayoutChange` and `layoutComponents`.

To migrate, run `npx @panneau/codemods@alpha list-view-props resources/js` (`--dry` first). It rewrites the props of `ListView` and `List`, and reports the props spread on them: spreading what `resolveList()` gives (`{...resolved}`) no longer fits, since its `actions`, `layouts` and `inlineEdit` go in the objects. Give its `columns`, `filters`, `search`, `selectable`, `calendar` and `perPageOptions` as props, and the rest in the objects. The types of the objects are exported: `ListViewActions`, `ListViewInline` and `ListViewLayouts`, with `ListInlineEditHandler` and `ListInlineEditEvent`.
