---
'@panneau/ui': minor
'@panneau/protocol': patch
---

Tones: what each one means for a state is written once, in the protocol's docs (`neutral` not started, `info` in progress, `success` done, `warning` needs attention soon, `danger` a problem to fix now, `muted` over), and `accent` is never a state. A new built-in tone, `muted`, for what is over (Archived, Cancelled): no fill in its `subtle` appearance, only a grey outline and the muted text. Its semantic tokens (`--panneau-color-muted`, `-subtle`, `-border`, `-solid`, `-solid-hover`, `-solid-text`) are in the default theme for both schemes and in `bootstrapTheme`, and `checkTheme()` checks their contrast. Projects coming from Panneau 4 map Bootstrap's `dark` to `muted`. The `Tones` story shows each tone with its meaning and examples.
