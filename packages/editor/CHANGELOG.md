# @panneau/editor

## 5.0.0-alpha.7

### Minor Changes

- 060e0de: Add `@panneau/editor` (#128, decision 0007): the `richtext` field, on TipTap 3, which stores HTML. `editorPlugin` provides the field type; `createEditorPlugin({ extensions, buttons })` adds the TipTap extensions of a project (an inline logo) and the toolbar buttons that insert them.
  
  - The definition sets the toolbar, the heading levels, block styles (a named class on an element: `<p class="big">`) and which links open in a new tab, in `settings`. `@panneau/protocol` describes them with `RichTextSettings` and `RichTextStyle`, and `validateDefinition()` checks them.
  - HTML written by CKEditor 4 and 5 loads as it was written, and the field gives nothing back until the text is edited. Once edited, it renders the same: the field keeps every heading level, the attributes and classes of blocks and marks, `<b>` and `<i>`, bare list items, and the HTML it doesn't edit (media embeds, iframes, tables, social posts), shown in the editor without rendering it.
  - Nothing that would run a script reaches the admin (decision 0035): HTML the field doesn't edit is shown inert, and the elements it renders lose their event handlers and `javascript:` URLs.
  - Pasted content brings its text, structure, links and marks, not the styles and wrappers of its page (Google Docs, web pages); only content copied from a rich text field of the same page pastes in full.
  - `normalizeRichText()` gives the HTML the field would save for existing content, to check it before a migration.
  - `@panneau/intl` has the messages of the editor, in English and French (`editorMessages`).

### Patch Changes

- Updated dependencies [9c6c087]
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
- Updated dependencies [fb534de]
  - @panneau/fields@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
