---
'@panneau/ui': minor
---

Rich choices, to pick one item among a few rich ones, such as a connected account:

- **`MenuSection`**, a group of menu items with a `title`: a small muted eyebrow that labels the group.
- **`Menu`** takes a `footer`: a short note under the items, after a line, that describes the menu and can't be focused.
- **`MenuItem`** takes a leading `media` (an avatar or an image) instead of an `icon`, and, in a menu with a `selectionMode`, shows a check at the end of the selected items, on a sunken background.
- **`PillTrigger`**, a compact rounded button that shows the current value, with an optional leading media and a chevron, for a `MenuTrigger` or a `PopoverTrigger`.
- **`RadioGroup`** takes `appearance="cards"`: bordered cards in a grid of `columns` (2 by default) that becomes one column in a narrow container, the selected card with a stronger border. Its options (`RadioGroupOption`) take a leading `media`, in both appearances.

New component tokens: `--panneau-menu-*`, `--panneau-pill-trigger-*`, and `--panneau-radio-media-*` and `--panneau-radio-card-*`.
