# 0103: Links to items in rich text

- Status: accepted
- Date: 2026-11-23
- Issue: [#439](https://github.com/folkloreinc/panneau-js/issues/439)
- Extends: [0055](0055-links.md) (`page` links) to the links of `richtext` fields ([0007](0007-rich-text.md))

## Context

The link dialog of a rich text field took a URL and a "new tab" checkbox. Linking to a page of the site meant opening the page in another tab, copying its public URL and pasting it: the link breaks when the page's slug changes, and nothing says it points to that page.

`link` fields solved this in [0055](0055-links.md): a `page` link is a reference to an item of the field's `resource`, searched with the relation source of the fields context, and the backend resolves its URL. Rich text has no structure to hold a reference: its value is HTML.

## Decision

- **A `richtext` field takes a `resource`**, one resource or several, as a `link` field does: the resources whose items its links can point to. Without one, or without a relation source in the fields context, the dialog takes a URL as before.
- **The link dialog offers "Page" or "URL"**, as the type of a `link` field: "Page" searches the items of the resources with the picker of `page` links (`PagePicker` of `@panneau/fields/link`), and is first, unless the selection links to a URL already.
- **A link to an item is an `<a>` with the item in two attributes**: `<a href="/en/about" data-page-id="12" data-page-resource="pages">`. The attributes are the reference; `href` is only what a site renders.
    - A client writes `href="#"` for a new link to an item, and keeps the `href` it received while the link points to the same item.
    - A backend writes the URL of the item in `href` where it serializes the value, as it resolves `page` links (0055), and again when it saves it: it ignores the `href` a client sends for such a link. A site reads `href`, and only resolves the item itself when it wants to.
    - Turning the link into a URL drops the two attributes.
- **The text of a new link** inserted without a selection is the label of the item.
- **New tab:** with `links.newTab: external`, a link to an item stays in the tab, as `page` links of `link` fields do.

## Consequences

- `laravel-panneau` resolves the `href` of `a[data-page-id]` in rich text values, with the callback that resolves `page` links (`resolvePageUrlUsing()`).
- Until a backend does, a link to a new item renders `href="#"` on sites: the link is there, its target is not.
- Rich text written by CKEditor keeps its links to pages as URLs: nothing turns them into references.
