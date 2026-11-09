# 0072: Touch targets follow the density

- Status: proposed
- Date: 2026-11-09
- Amends: [0024](0024-theme-model.md), section 5 (Density)

## Context

The touch density ([0024](0024-theme-model.md)) makes controls 44px tall, with 16px text in inputs. What isn't a control kept its size: checkboxes, radios and switches, the slider, the remove button of tags, the links of the sidebar, sortable table headers, the "back" link of pages.

Checkboxes, radios and switches had their own `@media (pointer: coarse)` rule for a 44px row. So on a touch screen they grew whatever the density, and with the `touch` density set by a definition (`theme.density`) on a laptop they didn't. Two ways to say "touch" disagreed, and a theme couldn't change either.

## Decision

- **A sixth density token, `--panneau-target-size`**: the smallest size of what a pointer or a finger hits that isn't a control. It is 1.5rem (24px, the minimum of WCAG 2.5.8) in the compact and comfortable densities, and 2.75rem (44px) in the touch density, so also in `auto` on coarse pointers. A theme redefines it in `densities`, like the other density tokens.
- **Sizes follow the density, not the pointer.** Components read the token instead of their own `pointer: coarse` rules:
    - rows of checkboxes, radios and switches are at least one target tall, the box on the first line of the label;
    - the track of the slider is at least one target tall, its thumb half of one;
    - the remove button of a tag is half a target, so that the tag stays inside the control;
    - links of the sidebar and its "Go to" button are at least one target tall.
- **Where a taller box would move the layout, the hit area grows instead**, with a pseudo-element: the whole header cell hits a sortable header, and the "back" link of a page is hit over one target's height without moving the title under it.
- **What depends on the device still follows the pointer.** The steppers of number inputs stay hidden on coarse pointers, where the keyboard of the device has numbers. With a mouse, in the touch density, they stay.

## Consequences

- `@panneau/ui`: `--panneau-target-size` is in `SEMANTIC_TOKENS` and in each density of `PanneauRoot`. `Checkbox`, `RadioGroup`, `Switch`, `Slider` and `TagsInput` read it, and the first three lose their `pointer: coarse` rules.
- `@panneau/lists` and `@panneau/app`: sortable headers, the "back" link and the sidebar read it.
- On touch screens nothing changes: `auto` there is the touch density, and its target is the 44px of the old rules.
