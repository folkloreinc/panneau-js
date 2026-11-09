# 0073: Selections apart from the accent, focus rings, and outlined filled buttons

- Status: proposed
- Date: 2026-11-09
- Amends: [0024](0024-theme-model.md)

## Context

A trial ported the fields of an existing Bootstrap admin to a Panneau theme, with tokens only. Its look is common: a bright yellow main action with black text, black checked boxes, radios and switches, a black border and a soft grey ring around a focused field, filled buttons outlined in black that sink a little when pressed. Tokens covered most of it: fonts, sizes, corners, colors, tones, densities. What they couldn't express:

- **The accent has two jobs.** It fills the main action, and it marks what is selected, checked or current: checked boxes, the selected day, the current tab, the slider, selected rows, cards and media. Bootstrap keeps them apart (`$primary` and `$component-active-bg`). With a yellow accent, a selected card had a yellow border on white, 1.4:1.
- **The focus of inputs** was a 1px ring of `--panneau-color-focus`, written in the stylesheet.
- **Filled buttons** had a transparent border, with no token, and no token made them sink when pressed.
- **The mark of required fields** had the color of errors, with no token.
- **The track of a switch** could only be filled: an empty, outlined track, as Bootstrap draws it, was impossible.
- **A hovered segment** of `SegmentedControl` took the text color of the selected one: with white text on a black selected segment, a hovered segment was white on white.
- **`checkTheme()`** read `rgb(0 0 0 / 0.45)` as black (21:1, for about 3.4:1), and left explicit tone values that refer to the palette unchecked. It didn't check selections at all.

The trial also found that the selected button of the rich text toolbar was white on a near-white background in the default theme.

## Decision

### Selections: `--panneau-selected-*`

A shared part of component tokens, like `input` and `field`: `--panneau-selected-bg`, `--panneau-selected-text` and `--panneau-selected-subtle`. They default to the accent (`accent`, `accent-text`, `accent-subtle`), so nothing changes for themes that don't set them.

- They are component tokens rather than semantic tokens on purpose. A semantic token is declared on the root, so `--panneau-selected-bg: var(--panneau-color-accent)` would be computed there: a `ThemeScope` that changes the accent would keep the root's selections. Read with the accent as fallback and never declared, they follow the accent wherever it changes, unless a theme sets them.
- Every component that shows a selection reads them: `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Tabs`, the calendars and date segments of `DatePicker` and `DateRangePicker`, the selected rows, cards and gallery items of `@panneau/lists`, today in the calendar layout, `MediaPicker`, the ratios of `ImageEditor`, the drop zone of `FilePicker`, the selection bar of `ListView` and the formats of the rich text toolbar. Their own component tokens (`--panneau-checkbox-checked-bg`…) now default to them.
- The accent keeps the main action, the skip link, progress bars, highlights and the logo.

### Focus, outlines and presses

- `input`: `border-color-focus`, `focus-ring` and `focus-ring-invalid`. The rings are `box-shadow` values, so a theme can make them wider, softer, or `none`. The rich text field reads them too.
- `button`: `solid-border-color` (transparent by default) outlines the solid appearance, and `pressed-scale` (`1`) makes buttons sink, never with reduced motion.
- `field`: `required-color`.
- `switch`: `track-border-color`, drawn inside the track when it is off.
- `segmented-control`: `segment-color-hover` and `segment-bg-hover`, apart from the selected segment.

### `checkTheme()`

- Translucent colors are checked as they show over what is under them: the surface for a background, the background for a foreground. A translucent color over a color it can't read is unchecked.
- Explicit tone values that refer to the palette or to tokens are checked as what they refer to, like tokens.
- Two pairs are added: the selected text on the selection (4.5:1), and the selection on the surface (3:1). A theme that doesn't set the selection is checked with its accent, so a light accent is reported.

## Consequences

- A theme can give its main action a color that would make poor selections, as Bootstrap themes do.
- The default theme and the themes that only set the accent look the same as before. The rich text toolbar shows its active formats filled with the selection.
- The reference theme sets every new token, so the stories and their axe checks run with selections apart from the accent, wide focus rings and outlined buttons.
- What stays out of tokens, such as dividers between the segments of `SegmentedControl`, is styled by a project through the stable classes of [0024](0024-theme-model.md).
