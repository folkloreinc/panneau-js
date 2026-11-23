---
'@panneau/ui': patch
'@panneau/app': patch
---

A token for the accent as text, for theme authors: `--panneau-color-accent-strong`. The outline, subtle and ghost appearances of the accent tone (the Edit action of each row), the icon of a context page, and links that fall back to the accent now write it instead of the accent itself, which stays the fill of the main action with `--panneau-color-accent-text` on it. A theme that sets `panneau-color-accent` gets a value derived from it: the accent, darkened or lightened until it reaches 4.5:1 on the theme's background, surface and accent subtle background, in each scheme. So a light accent, such as a yellow main action, keeps its accent-toned text readable with tokens only. A theme can set the token itself, and a project that overrides the accent with its own class sets it too. `checkTheme()` checks it on the background, the surface and the accent subtle background, and `bootstrapTheme` maps it to `--bs-primary-text-emphasis`. The default theme is unchanged.
