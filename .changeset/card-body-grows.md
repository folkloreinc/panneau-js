---
'@panneau/ui': patch
---

The body of `Card` grows to fill the card, so the footer sits at the bottom of the card. Cards side by side in a `Grid` stretch to the same height, but their footer stayed right under the content, so the footers of cards with less content didn't line up with the others. A project that passed a `bodyClassName` with `flex-grow: 1` as a workaround can remove it.
