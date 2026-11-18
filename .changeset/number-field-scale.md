---
'@panneau/ui': minor
'@panneau/fields': minor
---

Scales. `RadioGroup` takes `appearance="scale"`: its options as joined buttons of the same width in one row, the selected one filled, with `startLabel` and `endLabel` under the first and the last option ("Not at all", "Very"), which assistive technologies read with these options. `NumberField` takes `widget="scale"` (setting `widget` of the `number` type): every number from `min` to `max` (1 to 5 by default, by `step`) as such a scale, with `minLabel` and `maxLabel` (settings too), for a rating; a value is `null` until a button is picked. Beyond 11 buttons, it stays a field to type the number in. New tokens: `radio-scale-bg`, `radio-scale-border-color`, `radio-scale-selected-bg` and `radio-scale-selected-text`.
