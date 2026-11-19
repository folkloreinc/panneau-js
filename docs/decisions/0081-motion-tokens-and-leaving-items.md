# 0081: Motion tokens, and items that fade out of a list

- Status: accepted
- Date: 2026-11-17
- Changes: the toasts of [0062](0062-toasts.md), the motion token of [0020](0020-default-theme-and-icons.md), and the highlight of lists ([0066](0066-a-create-goes-back-to-the-list.md))

## Context

Themes had one motion token, `--panneau-duration` (150 ms). Components each picked their easing (`ease-out`, `ease-in`, or the browser's `ease`), and the shell wrote its panel's 200 ms by hand, so a theme couldn't change how the app moves, and the reduced motion of the root didn't reach the panel.

In a list, an item that appeared was highlighted (0066), but an item that left, deleted or taken out of the filters by a change, vanished at once: the rows below jumped into its place, and nothing showed which one went.

## Decision

### Motion tokens

- **`--panneau-duration-slow`** (200 ms): panels that move across the page, such as the item panel and the sidebar. `--panneau-duration` (150 ms) stays for controls and overlays.
- **`--panneau-ease-out`** for what appears, which decelerates into place, and **`--panneau-ease-in`** for what leaves, which accelerates away.
- **Reduced motion sets both durations to `0ms`**, as it did for `--panneau-duration`.
- Components use the tokens: no duration or easing written by hand, except for loops (spinners, skeletons) and the highlight, which last as long as they need.

### Items that leave a list

- **An item that leaves the list fades out** (`--panneau-duration-slow`, `--panneau-ease-in`), at its place, then goes. In the table, the cards and the gallery, its element has the `leaving` class of the highlight and `data-leaving`, and is `inert`: it can't be clicked or focused while it fades.
- **Only while the query stays the same**: after a new page, search, sort or filter, the first items that come replace the others at once. A change of query isn't the departure of an item.
- **Leaving items don't count**: the total, the selection and the actions only know the items the list was given.
- With reduced motion, the item goes at once.

### The status of a form, and toasts that close

- **The status of a form's footer** ("Unsaved changes", "Saved", the failure of a save) fades in and rises a little each time it changes (`--panneau-duration-slow`), as a toast does.
- **A toast that closes fades out** and drops a little, and the others move into its place, in a view transition of the document (typed `panneau-toast`), where the browser has them. Only the toasts are captured: the page doesn't cross-fade, and stays as it is. Without view transitions, or with reduced motion, the toast goes at once, as before. The durations of the transition are written in the stylesheet of the toasts: its pseudo-elements belong to the document, outside the root and its tokens.

## Consequences

- `@panneau/ui`: the tokens in `PanneauRoot` and `SEMANTIC_TOKENS`.
- `@panneau/lists`: `isLeaving` in the props of a layout. A layout of a plugin that ignores it shows a leaving item until it goes, without the fade.
- The calendar doesn't fade its items out.
