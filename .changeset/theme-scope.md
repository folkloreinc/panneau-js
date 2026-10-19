---
'@panneau/ui': minor
---

`ThemeScope` (decision 0024, step 7) applies a theme, a color scheme or a density to a subtree, without a new root: a dark sidebar in a light app, a compact list, a preview in another brand's colors. What it doesn't set comes from around it, and overlays opened inside it render in its own container, so that they keep its tokens.
