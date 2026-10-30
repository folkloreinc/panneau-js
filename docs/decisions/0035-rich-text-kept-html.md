# 0035: Rich text keeps HTML it doesn't edit, inert in the admin

- Status: accepted
- Date: 2026-10-29
- Issue: [#128](https://github.com/folkloreinc/panneau-js/issues/128)
- Changes: "existing content is sanitized on load" in the consequences of [0007](0007-rich-text.md)

## Context

[0007](0007-rich-text.md) says that the HTML of v4's `html` field keeps working in the `richtext` field, and that it "is sanitized on load". The two pull in opposite directions. The HTML that CKEditor wrote holds what a sanitizer would remove, and what sites need: media embeds with their iframes, social posts with the script of their provider (`<blockquote class="twitter-tweet">` and `<script src="https://platform.twitter.com/widgets.js">`), tables, `<div>` and `<pre>`. Removing it on load would change the content of a page the first time someone fixes a typo in it.

What has to be protected is the admin: an editor must never run a script or load a frame from content it shows, whoever wrote that content. Sites render the same HTML, and they decide what they trust: sanitizing for the page is their job, or the backend's.

## Decision

- **The field keeps HTML it doesn't edit as it was written**, and never renders it in the admin. An embed, an iframe, a script, a table or a `<div>` is an opaque node: the editor shows its element and what it points to (`figure.media`, its URL), from an inert template. Its markup only goes back to the value.
- **What the editor renders is sanitized on load.** The elements it edits (paragraphs, headings, lists, links, marks) and the wrappers it keeps (`<span>`, `<abbr>`) lose the attributes that would run a script: event handlers (`on*`), and `javascript:`, `vbscript:` and `data:text/html` URLs. Links to scripts lose their link. Nothing in the admin's DOM can run a script or load a frame from the content.
- **Styles of stored content** show in the editor, but can't take an element out of the text (`position` is neutralized there). They stay in the value as they were written.
- **Pasted content** is not trusted as stored content is. It brings what the toolbar can make: no kept HTML, no attributes. Only content copied from a rich text field of the same page, marked with a random token when it is copied, pastes in full; `data-pm-slice`, which any page can write, isn't enough.
- **Untouched content is not rewritten**: the field gives nothing back until the text is edited.

## Consequences

- Content migrated from CKEditor renders the same on sites, embeds and their scripts included.
- A site that renders rich text from users it doesn't trust sanitizes it, as it would without Panneau. Panneau doesn't sanitize values for sites, on the client or in `laravel-panneau`.
- Event handlers and script URLs on the elements the field edits are dropped the first time content is edited. CKEditor 5 removed them too.
- A plugin that adds a node renders its own attributes: it filters them like the field's own elements.
