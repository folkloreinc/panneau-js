---
'@panneau/ui': minor
---

Add component tokens and `data-panneau` hooks (decision 0024).

- **Tokens:** every component reads its own `--panneau-<component>-<token>` variables (`--panneau-button-radius`, `--panneau-badge-radius`, `--panneau-card-padding-x`…), which default to the semantic tokens. They can be set by a theme, on the root, or on any element around the components, to restyle one component without touching the others. `componentTokens` lists them with their defaults, and `defineComponentTokens()` declares the tokens of a component.
- **Hooks:** the root element of every component carries `data-panneau="<component>"`, a public hook for a project's CSS.
- **Switch:** the thumb follows the track's size.
