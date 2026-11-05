# 0068: Collapsed repeater items, permalink slugs, and controls shown when needed

- Status: proposed
- Date: 2026-11-05
- Changes: the items of a `repeater` ([0065](0065-compound-fields.md) titles them), the slug's URL ([0032](0032-field-checks-and-slugs.md)), the checkboxes and sort arrows of the table, and the selection of the gallery and the media picker

## Context

People who edit a real site in Panneau 5 found its forms and lists heavier than they need to be:

- **Blocks take the whole page.** A page's blocks are a `repeater` with typed blocks. Every block shows all its fields, so a page of ten blocks is several screens long, and moving a block means scrolling past the others.
- **The slug's URL is a line of text.** The backend's check gives the start of the URL and the URL itself ([0032](0032-field-checks-and-slugs.md)): the start showed as plain text inside the input, and the URL as a link under it. Modern editors show a permalink: the address of the site in front of the slug, and a button that opens the page.
- **Every row of a table repeats its checkbox, and every sortable column its arrows**, even when nobody selects or sorts.
- **Selection is drawn over images.** The gallery of a list and the media picker put their checkbox on the corner of each image, where it hides part of it.

## Decision

**Items of a `repeater` collapse under their title.**

- Each item's header is a button (`aria-expanded`, `aria-controls`) with its number, its title (the summary of [0065](0065-compound-fields.md), or the label of its type) and, while collapsed and without a summary, its first text: the first `text`, `textarea`, `richtext`, `email` or `url` value, without tags, in the first locale that has one.
- **The items the list had when it showed start collapsed; an item that is added starts expanded.** The state of each item follows it as items move, and stays while the list shows. With two items or more, "Expand all" or "Collapse all" opens or closes every item.
- **An item with an error expands by itself**, when it gets the error, and its header says it has errors. The form's binding already gives the paths in error inside a field (`invalidPaths`): the repeater reads the item from them.
- A collapsed item hides its fields; it doesn't remove them, so that they keep their own state (an editor's history). A read-only list still expands and collapses; a disabled one shows its items.
- `settings.collapsible: false` (or `collapsible={false}`) keeps every item expanded, as before. Compound fields collapse like any repeater: their summary makes a good title.

**A slug is a permalink.** The start of its URL (`check.prefix`, or the `prefix` setting) is an addon in front of the input: on the sunken color, without the URL's scheme, cut at its start when it is long (`…/fr/vacances/`), and whole in a tooltip. It stays while the slug is typed, until the next check answers. The URL of the page is an icon link after the input, which opens it in a new window, named "Open the page in a new window". A slug that doesn't apply (the home page) says "This address can't be changed." under its read-only input.

**The table shows its controls when they are needed.**

- The arrow of a sortable column shows on hover and focus of its header, and always on the sorted column. The header stays a button, announced by `aria-sort`.
- The checkbox of a row shows on hover and focus of the row, and on every row once one is selected (`data-selecting` on the table). The header's checkbox shows on hover of the table. Hidden checkboxes keep their place and can be tabbed to.
- On touch screens (`@media (hover: none)`), arrows and checkboxes always show.
- Headers have no background of their own, rows a background on hover, and an item without an image an empty square, without an icon on each row.

**Selection is drawn next to the image, not over it.** In the gallery of a list, the checkbox of an item is in its caption, before its title, and a selected item has an accent outline. In the media picker, a selected card has an accent ring around its image and a checked box before its name; the card itself stays the option that is announced as selected.

## Consequences

- `@panneau/fields`: `RepeaterField` takes `collapsible` and `invalidPaths`. The `repeater` entry reads `settings.collapsible`, and passes the form's `invalidPaths`, as compound fields do.
- `@panneau/intl`: messages for "Expand all", "Collapse all", "Has errors", "Open the page in a new window" and "This address can't be changed.", in English and French.
- `@panneau/lists`: the table's arrows and checkboxes, and the gallery's checkbox, move as above. Tests that read the fields of a repeater expand its items first.
- `@panneau/media`: the picker's checkbox moves to the caption.
- Backends have nothing to send: a list remembers its items' state on the client only, and loses it when the form closes.
