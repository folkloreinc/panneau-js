---
'@panneau/ui': minor
'@panneau/app': patch
'@panneau/lists': patch
'@panneau/media': minor
'@panneau/forms': patch
'@panneau/editor': patch
---

Primitives and tokens used everywhere (#353). `@panneau/ui`: `--panneau-focus-offset`, the gap between an element and its focus ring, which every ring reads; rings outside inputs are outlines, which stay visible in forced colors. `--panneau-frame-bottom` is a semantic token (`0px`), which the dock and the region of toasts set, in place of `--panneau-bottom-offset`: a project that set `--panneau-bottom-offset` sets `--panneau-frame-bottom`. `SegmentedControl` takes `hideLabels`, `Disclosure` takes `headerEnd`, and `prefersReducedMotion()` reads the system's preference. Chevrons that show and hide content point to the end and turn down once it is shown, also in the panels of `Aside`. `@panneau/media`: the empty states of the picker are `EmptyState`s, and the cards of the picker and the stage of the image editor have component tokens (`mediaPickerTokens`, `imageEditorTokens`). `@panneau/lists`: the switch of layouts is a `SegmentedControl`. `@panneau/app`: the runs of `ActionRunsButton` show a `Spinner` and a `Badge`, the summary above a list is a `Disclosure`, and the groups of the sidebar follow the chevrons of `Disclosure`. `@panneau/editor`: paragraphs of the rich text field have the gap of `Prose`.
