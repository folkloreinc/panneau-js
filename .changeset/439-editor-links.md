---
'@panneau/editor': patch
'@panneau/fields': patch
'@panneau/intl': patch
'@panneau/protocol': patch
---

Rich text: ⌘K (Ctrl+K elsewhere) opens the link dialog on the selection, rather than the app's "Go to…" palette, which still opens outside the editor. The tooltips of the toolbar name the shortcut of their button (⌘B, Ctrl+Shift+8), and buttons have `aria-keyshortcuts`; `RichTextButton` takes a `shortcut`. With a `resource`, a `richtext` field links to items of the site: its link dialog searches them with the relation source, as `page` links of `link` fields do, and still takes a URL (decision 0103). Such a link is `<a href="…" data-page-id="12" data-page-resource="pages">`, and the backend writes the item's URL in `href`. `@panneau/fields/link` exports `PagePicker`. HTML kept as it was written now says what it is ("Embedded video", "Embedded post", "Table", "Image") with its provider and URL, a video of a known provider shows a player drawn in its place, and its element (`figure.media`) is in a tooltip; `HtmlNodeOptions` takes `labels` by `KeptHtmlKind`.
