# 0007: TipTap replaces CKEditor

- Status: accepted
- Date: 2026-10-14

## Context

v4 uses a minimal CKEditor 5 build: bold, italic, links and lists. Its uploads and embeds are commented out, and two packaging styles are mixed. CKEditor 5's open-source license is GPL, and its custom builds are heavy. TipTap 3 is built on ProseMirror, has an MIT core, is modular, and works with Yjs.

Niche builds its own advanced editor on TipTap. Its needs go well beyond Panneau's: a block registry, versioned schemas, multiple output formats.

## Decision

- **The `richtext` field uses TipTap 3**, in the `@panneau/editor` package.
- **HTML is the default storage format**, for compatibility with existing content. ProseMirror JSON is available as an option per field.
- **Configuration.** The toolbar and extensions are set per field in the definition: headings, marks, links, lists, tables, media through the media library, embeds. Projects add extensions through plugins.
- **Niche keeps its own editor.** Panneau doesn't try to become Niche's editor, and doesn't depend on it.

## Consequences

- The `html` field of v4 maps to `richtext` with HTML storage. Existing content keeps working; it is sanitized on load.
- Collaboration on rich text (5.x) can use TipTap's Yjs extension.
