# @panneau/editor

The rich text field of Panneau, on [TipTap 3](https://tiptap.dev): HTML storage, a toolbar and block styles set from the definition, and extensions from plugins ([decision 0007](../../docs/decisions/0007-rich-text.md)).

```bash
npm install @panneau/editor@^5.0.0-alpha.0 @tiptap/core @tiptap/pm @tiptap/react react-aria-components react-intl
```

| Export            | Content                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@panneau/editor` | `RichTextField`, `RichTextFieldEntry`, `editorPlugin`, `createEditorPlugin()`, `createRichTextExtensions()`, `normalizeRichText()`, `getRichTextOptions()`, `builtInButtons`, `DEFAULT_TOOLBAR`, `DEFAULT_HEADINGS`, and their types |

TipTap's core, ProseMirror (`@tiptap/pm`) and its React bindings are peer dependencies: the extensions of a project and the field share one copy of them.

## The field

`RichTextField` (the `richtext` type) edits HTML. Its value is a string, or `null` when the text is empty. Like every field, it is controlled: a value that comes from elsewhere (a reset, another user) replaces its content.

```tsx
import { editorPlugin } from '@panneau/editor';
import { FieldsProvider, builtInFields } from '@panneau/fields';

createPanneauApp({ plugins: [editorPlugin], … });

// Or with the pieces:
<FieldsProvider components={{ ...builtInFields, ...editorPlugin.fields }}>…</FieldsProvider>;
```

Without the plugin, `DefinitionField` shows a placeholder for `richtext` fields, and keeps their value.

### Settings

The definition sets the field in its `settings` (`RichTextSettings` of `@panneau/protocol`), with no JavaScript:

```jsonc
{
    "name": "body",
    "type": "richtext",
    "settings": {
        "toolbar": [
            "heading",
            "style",
            "|",
            "bold",
            "italic",
            "link",
            "bulletList",
            "orderedList",
            "|",
            "logo",
        ],
        "headings": [2, 3],
        "styles": [{ "label": "Big paragraph", "class": "big", "element": "p" }],
        "links": { "newTab": "external" },
    },
}
```

- **`toolbar`** lists the buttons, in order, with `|` between groups: `heading` (paragraph or a heading level), `style`, `bold`, `italic`, `underline`, `strike`, `superscript`, `subscript`, `code`, `link`, `bulletList`, `orderedList`, `blockquote`, `horizontalRule`, `clear`, `undo`, `redo`, and the buttons of plugins. Names it doesn't know are skipped. Defaults to `DEFAULT_TOOLBAR`: text style, style, bold, italic, link and lists.
- **`headings`** are the levels that `heading` offers. Defaults to 2, 3 and 4.
- **`styles`** are block styles: a named class on an element, `p` by default, or `h1` to `h6`, `blockquote`, `ul`, `ol`, `li`. The `style` select puts one on the paragraphs and headings of the selection (or the closest quote, list or item), in place of the other styles of that element, and keeps their other classes: "Big paragraph" gives `<p class="big">`.
- **`links.newTab`**: `choose` (the default) adds "Open in a new tab" to the link dialog, `external` opens every link to another site (`https://…`, `//…`) in a new tab, and `never` opens none. A link in a new tab gets `target="_blank" rel="noopener noreferrer"`, and keeps its other relations (`nofollow`).

`getRichTextOptions(field)` reads these settings, and falls back to the defaults for settings of the wrong type. `RichTextField` takes them as props: `toolbar`, `headings`, `styles` and `newTab`.

### What the field keeps

The toolbar only limits what users add. The field reads everything content may hold, so that HTML written by another editor, CKEditor 4 or 5 in Panneau 4 projects, keeps working:

- **Until the text is edited, the value is not touched**: the field gives nothing back when it loads content.
- Once it is edited, the field writes HTML that renders the same:
    - every heading level, whatever `headings` offers;
    - the attributes of paragraphs, headings, quotes, lists, list items, links and marks (`class`, `style`, `id`, `lang`, `data-*`);
    - marks with the element they were written with (`<b>` and `<strong>`, `<i>` and `<em>`, as CKEditor 5 writes italics);
    - list items written without a `<p>` (`<li>Text</li>`), as CKEditor writes them;
    - elements around text with their attributes: `<span style="…">`, `<abbr title="…">`, anchors.
- **HTML that the field doesn't edit is kept as it was written**, whitespace included: embedded media (`<figure class="media">` of CKEditor 5, with or without its preview), iframes, images, tables, `<div>`, `<pre>`, social posts with their script. The editor shows such a block by its element and what it points to (`figure.media`, its URL), and never renders its markup: its scripts don't run and its iframes don't load in the admin. It can be moved or removed.
- What changes, without changing what the HTML renders: entities become characters (`&eacute;` gives `é`), whitespace between blocks goes, attributes of a link come in their order (`href`, `target`, `rel`), and styles are written as a browser writes them (`color: rgb(231, 76, 60);`).
- **Nothing that would run a script reaches the admin** ([decision 0035](../../docs/decisions/0035-rich-text-kept-html.md)): kept HTML is only written to the value and the clipboard, never to the page, even when the editor unmounts. The elements the editor renders lose their event handlers (`onclick`), `srcdoc`, and URL attributes with a `javascript:`, `vbscript:` or `data:text/html` URL, when content loads and again when they are rendered; links to scripts lose their link. Styles of stored content show in the editor but can't cover the admin: the text contains its painting (`contain: paint`). They stay in the value. Sanitizing HTML for a site's pages is the site's job, or its backend's.
- **Pasted content is cleaned**: a page or a document brings its text, headings, lists, links and marks, not its styles, classes and wrappers (`<span style="font-size: 11pt">` and `<div>` of Google Docs or a web page). Bold and italic written as styles become marks. Content copied from a rich text field of the same page pastes in full, kept HTML included: the field marks what it copies with a random token, which no other page can write. Without it, the slice data of ProseMirror (`data-pm-slice`) is dropped.

`normalizeRichText(html, extensions)` gives the HTML the field would save for some HTML once edited. Run it on existing content before a migration, with the extensions of the project's plugin, to see what would change.

## Extensions and buttons of a project

A project adds TipTap extensions, for custom nodes such as an inline logo, and the toolbar buttons that insert them, through `createEditorPlugin()`. The `toolbar` setting of each field names the buttons it shows. The extensions are in every rich text field, so that content written with them reads everywhere.

```tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { Sparkles } from 'lucide-react';

import { type RichTextButton, createEditorPlugin } from '@panneau/editor';

const Logo = Node.create({
    name: 'logo',
    group: 'inline',
    inline: true,
    atom: true,
    parseHTML: () => [{ tag: 'span[data-logo]' }],
    renderHTML: ({ HTMLAttributes }) => [
        'span',
        mergeAttributes(HTMLAttributes, { class: 'logo', 'data-logo': '' }),
    ],
});

const logoButton: RichTextButton = {
    name: 'logo', // in the `toolbar` setting
    label: 'Logo', // or a message descriptor of the plugin's locales
    icon: Sparkles,
    run: (editor) => editor.chain().focus().insertContent({ type: 'logo' }).run(),
};

createPanneauApp({
    plugins: [createEditorPlugin({ extensions: [Logo], buttons: [logoButton] })],
});
```

- An extension with the name of a built-in one (`link`, `heading`) replaces it, and a button with the name of a built-in one replaces it.
- A button with `isActive` is a toggle; `isDisabled` greys it out for the selection.
- A project gives all its extensions to one plugin: a later plugin that provides `richtext` replaces the field.
- The nodes of extensions are read before the HTML that the field keeps: without the plugin, a logo stays in the content as it was written.
- A node renders its own attributes: one that keeps attributes from stored content filters them as the field does (no `on*` attributes, no `javascript:` URLs).

## The toolbar and the editor

- The toolbar is a React Aria `Toolbar`: arrow keys move between its controls. Its buttons are labelled and show their label as a tooltip, and its toggles are pressed when the selection has their mark. It doesn't show when the field is read-only.
- The text is a `textbox` labelled by the field's label, with its heading, lists and links styled from the `--panneau-*` tokens, like `Prose` of `@panneau/ui`.
- ProseMirror JSON storage, also allowed by decision 0007, is not available yet.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
