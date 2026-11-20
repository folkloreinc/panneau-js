# 0099: The item panel goes over its list

- Status: accepted
- Date: 2026-11-20
- Amends: [0074](0074-asides-next-to-lists-and-forms.md) (where the item panel goes from 56rem of the layout)
- Issue: [#366](https://github.com/folkloreinc/panneau-js/issues/366)

## Context

[0074](0074-asides-next-to-lists-and-forms.md) puts the item panel beside its list from 56rem of the layout, and over it below that. Beside it, the list loses the width of the panel and its gap (22rem and more), and reflows. Under 40rem of list, `TableLayout` switches to its narrow mode, each row a block with the label of each value, meant for phones. With the navigation of the shell expanded, that is what happens on most laptop screens: at 1280px, the list goes from about 960px to 590px, and opening an item turns the table into blocks, which closing it turns back. At 1440px it stays a table, but every column moves.

## Decision

- **On list pages, the item panel goes over the list at every width**, on its right, as it already did on narrow layouts: the whole height of the screen, the whole width on a phone, with the shadow of overlays. The list keeps its layout and its columns when an item opens or closes, and its page keeps its width.
- **The panel is not modal.** The list stays usable around it: its current row stays highlighted, and clicking another visible row swaps the panel. Escape and the close button close it, and focus moves to it when it opens, as before.
- **`AsideLayout` takes `placement`**: `beside` (the default, 0074) or `overlay`, over the content at every width. With `overlay`, `narrow` changes nothing, the button that widens the aside shows from 40rem, and panels shown beside the content only (`isBesideOnly`) stay hidden.
- **The aside of forms doesn't change**: beside the form from 56rem and in view as it scrolls, below it otherwise. A form is read with its sidebar, which holds its state and its actions, and nothing reflows when it opens: it is always there.

## Trade-off

Beside the list, the whole row stayed readable while its panel was open. Over it, the panel hides the right columns of the list, 22rem of them, or half of the screen widened. A middle ground was to put the panel beside the list only when the list keeps at least 40rem, and over it otherwise. Any docking still reflows the columns, though, and the rule would depend on the width of the screen, of the navigation and of the panel: overlay everywhere is the simpler rule, and the list never moves. If the hidden columns matter on very wide screens, that middle ground can come back as its own record.

## Consequences

- `@panneau/ui`: `AsideLayout` has a `placement` prop.
- `@panneau/app`: the list page uses `placement="overlay"`, and its page no longer drops its maximum width while an item is open.
- The narrow mode of `TableLayout` only comes from the width of the screen or of its container, never from an open panel.
