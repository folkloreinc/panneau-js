# 0054: Links

- Status: proposed
- Date: 2026-11-04
- Issue: [#202](https://github.com/folkloreinc/panneau-js/issues/202)

## Context

Sites with editorial blocks have buttons, cards and menu items that link somewhere. Each project rebuilds the same group: a localized label, a URL, and a toggle to open it in a new tab. The group exists in many shapes:

- "a page or a URL" is two fields, or a type and two fields;
- `mailto:` links fail the `url` rule, so projects wrote their own URL field that accepts it, or one that checks nothing;
- the label and the URL are localized in some projects, not in others.

## Decision

### `link`

- **Value:** `{ "type", "url", "page", "file", "label", "newTab" }`, or `null`.
    - `type`: the kind of link, one of the field's types (below).
    - `url`: the `href` of the link, which a site renders as it is. For `url` links, an `https://` or `http://` URL; for `email` links, `mailto:` and the address; for `tel` links, `tel:` and the number in E.164. For `page` and `file` links, the URL the backend resolved, in items only (below).
    - `page`: for `page` links, a reference to an item of the site, `{ "id", "resource", "label" }`.
    - `file`: for `file` links, a reference to a media (`MediaReference`).
    - `label`: the words of the link, optional. A string per locale, `{ "fr": "…", "en": "…" }`, as a `localized` text. In a `localized` link field, where every part is per locale already, a string.
    - `newTab`: whether the link opens in a new tab, `true` or `false`.
- **Built-in types:**
    - `url`: a URL of another site;
    - `page`: an item of a resource of the site, among those of the field's `resource`;
    - `email`: an email address;
    - `tel`: a phone number, typed as in a `tel` field;
    - `file`: a media of the libraries in `settings.libraries`, or of every library (0027). It needs the media plugin, like `media` fields.
- **Settings:**
    - `types`: the types the field offers, in order. Defaults to `url`, `email` and `tel`, with `page` first when the field has a `resource`. `file` is offered only when listed.
    - `newTab`: `choose` (the default, a checkbox), `external` (set by the type: `true` for `url` and `file` links, `false` for the others) or `never`, as `links.newTab` of `richtext`.
    - `label`: `optional` (the default), `required` or `none`, which hides it when the site writes the words.
    - `libraries`: the media libraries of `file` links.
- **A site adds a type** in `types`, with an object instead of a name: `{ "id": "anchor", "label": "Anchor", "pattern": "^#[\\w-]+$", "placeholder": "#program" }`. Its `url` is the text typed, checked against `pattern` when it has one. That covers anchors, paths of the site and the links of an app. A link to an item of another resource is a `page` link: the field's `resource` lists every resource whose items have a URL (`["pages", "events"]`).
- **Field:** the type as a segmented control, then the input of the type (a URL, a relation picker, an email address, a phone number, the media picker), the label per locale, and the new tab checkbox.
- **Lists** show the label in the user's locale, or the URL or the page without one, with the icon of the type, linked when the link has a URL.

### Checks

The type implies the checks of its parts, keyed by their path as those of a group:

- `type` must be one of the field's types: `in` on `link.type`;
- `url` links need an `http://` or `https://` URL (`url`), `email` links `mailto:` and an email address (`email`), `tel` links `tel:` and a number in E.164 (`tel`), the types of a site their `pattern` (`pattern`): on `link.url`, with `required` when it is empty;
- `page` links need a `page`, and `file` links a `file`: `required` on `link.page` or `link.file`;
- with `"label": "required"`, `required` on `link.label`.

This replaces the URL fields that accepted `mailto:` and the ones that checked nothing.

### What the API returns

- **In items,** a `page` link has its reference (`{ "id", "resource", "label" }`) and, when the backend knows it, the URL of the page in `url`. A backend resolves the links at the top of a resource, and those inside groups and blocks where it serializes their references, as for `relation` and `media` values. A `file` link has its `MediaReference` and the URL of the file in `url`. A site reads `url` for every type, and only resolves a page itself when the backend left `url` out.
- **In requests,** the client sends the `page` as an id, or `{ "id", "resource" }` when the field has several resources, and the `file` as media references are sent (0027). A backend ignores the `url` of `page` and `file` links, and resolves it again.
- **`newTab`** with `external` is set by the backend too, so that values are right whoever wrote them.

### `laravel-folklore`

Its `Page` field is a relation to its pages. It could become a `link` with the `page` type alone over its pages resource, whose URLs its routes resolve. That is for `laravel-folklore` to decide: this decision doesn't change it.

## Consequences

- `link` is a built-in type. Its checks reuse the portable rules `in`, `url`, `email`, `tel`, `pattern` and `required`, on the paths of its parts.
- `@panneau/fields` gets the `link` field. Its `file` links render the `media` entry of the fields context: without the media plugin, they can't be picked.
- `@panneau/lists` gets the display of links.
- `laravel-panneau` gets the `Link` field, which resolves the URL of pages with a callback (`resolvePageUrlUsing()`), and the upgrade from 1.x points the URL fields that accepted `mailto:`, and the groups of a label, a URL and a new tab toggle, to it.
