---
'@panneau/ui': minor
---

Theme tooling (decision 0024).

- **New entry point:** `@panneau/ui/theme` exports the theme functions without components or CSS, for Node.
- **New command:** `panneau-check-theme` runs `checkTheme()` on a JSON theme or on a module export, and exits with 1 when a check fails.
- **Bootstrap:**
    - `bootstrapTone()` turns a Bootstrap theme color into a tone;
    - `bootstrapTheme` now maps Bootstrap's theme colors to tones (`accent` reads `--bs-primary-text-emphasis` on subtle backgrounds, which fixes its contrast) and its root variables to component tokens.
- **Tones derived from one color** are readable on the theme's own surfaces.
- **Prose:** code no longer takes the color of a site's global `code` rule.
