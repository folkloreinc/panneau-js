---
'@panneau/ui': minor
---

Layout primitives and breakpoints (decision 0024, step 5): `Stack`, `Inline`, `Grid` and `GridItem`, `Container` and `Divider`, with their component tokens. `gap`, `align`, `justify`, `columns` and `span` are responsive (`columns={{ base: 1, md: 2 }}`), at the breakpoints of `BREAKPOINTS` (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem), which are widths of the nearest size container. `PanneauRoot` is now a size container: in a flex row or a float, give it a width.
