---
'@panneau/ui': minor
---

Add component tokens (decision 0024): every component reads its own `--panneau-<component>-<token>` variables (`--panneau-button-radius`, `--panneau-badge-radius`, `--panneau-card-padding-x`…), which default to the semantic tokens. They can be set by a theme, on the root, or on any element around the components, to restyle one component without touching the others. `componentTokens` lists them with their defaults, and `defineComponentTokens()` declares the tokens of a component. The root of every component also has a `panneau-<component>` class, and the switch's thumb follows the size of its track.
