---
'@panneau/ui': minor
---

Add open tones and appearances (decision 0024, step 2).

- **Tones:** `Button`, `Badge`, `Alert` and toasts take any tone: the built-in ones (`neutral`, `accent`, `success`, `warning`, `danger`, `info`) or one added by a theme (`theme.tones`). A theme tone is one color, from which Panneau derives a readable text color, the hover, the subtle background and the border, or every value. Declare added tones in `PanneauTones` so that `tone="signal"` type-checks.
- **Appearances:** `Button` takes `appearance` (`solid`, `outline`, `subtle`, `ghost`), and `Badge` and `Alert` take `solid`, `outline` and `subtle`. The `variant` values of `Button` are deprecated aliases: `primary` is accent solid, `secondary` neutral outline, `ghost` neutral ghost, `danger` danger solid.
- **Named variants:** `theme.components.<component>.variants` registers token overrides, applied with `variant` on `Button`, `Badge` and `Alert`. Declare them in `ButtonVariants`, `BadgeVariants` and `AlertVariants`.
- **Contrast report:** `checkTheme()` reports the colors of a theme that miss their contrast ratio.
- **New semantic tokens:** `--panneau-color-success-solid`, `-warning-solid` and `-info-solid`, with their `-hover` and `-text` tokens. `bootstrapTheme` maps them.
- **Breaking:**
  - a badge with the `accent` tone is now subtle by default; use `appearance="solid"` for the previous look;
  - the icon of a neutral alert takes the text color;
  - `AlertTone`, `BadgeTone` and `ToastTone` are deprecated aliases of `Tone`.
