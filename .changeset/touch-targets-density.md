---
'@panneau/ui': patch
'@panneau/lists': patch
'@panneau/app': patch
'@panneau/editor': patch
---

Touch targets follow the density (decision 0072). A new density token, `--panneau-target-size` (1.5rem, and 2.75rem in the touch density), sets the smallest size of what a pointer or a finger hits: rows of checkboxes, radios and switches, the slider, the remove button of tags, the sidebar's links, sortable table headers and the "back" link of pages. Checkboxes, radios and switches read it instead of their `pointer: coarse` rules, so the `touch` density makes them larger on any device, and touch screens see no change. The rich text toolbar wraps by groups, never leaving one button alone on a line.
