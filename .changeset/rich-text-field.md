---
'@panneau/editor': minor
'@panneau/protocol': minor
'@panneau/intl': minor
'@panneau/fields': patch
---

Add `@panneau/editor` (#128, decision 0007): the `richtext` field, on TipTap 3, which stores HTML. `editorPlugin` provides the field type; `createEditorPlugin({ extensions, buttons })` adds the TipTap extensions of a project (an inline logo) and the toolbar buttons that insert them.

- The definition sets the toolbar, the heading levels, block styles (a named class on an element: `<p class="big">`) and which links open in a new tab, in `settings`. `@panneau/protocol` describes them with `RichTextSettings` and `RichTextStyle`.
- HTML written by CKEditor 4 and 5 loads as it was written, and the field gives nothing back until the text is edited. Once edited, it renders the same: the field keeps every heading level, the attributes and classes of blocks and marks, `<b>` and `<i>`, bare list items, and the HTML it doesn't edit (media embeds, iframes, tables, social posts), shown in the editor without rendering it.
- Pasted content brings its text, structure, links and marks, not the styles and wrappers of its page (Google Docs, web pages).
- `normalizeRichText()` gives the HTML the field would save for existing content, to check it before a migration.
- `@panneau/intl` has the messages of the editor, in English and French (`editorMessages`).
