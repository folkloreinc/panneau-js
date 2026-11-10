---
'@panneau/ui': minor
---

The stroke of `Icon` scales with the icon at every size (#274). Icons under 16px (`xs` and `sm`) had a fixed 2px stroke, which made them look bolder than the `md` icons next to them, such as the icon of a small icon-only button beside a menu. The new `--panneau-icon-stroke-width` component token sets the stroke in units of Lucide's 24-unit grid (`2` by default, about 1.33px at 16px), so a theme can choose a lighter or a bolder icon set. A project that set `.panneau-icon { stroke-width: 2; }` as a workaround can remove it.
