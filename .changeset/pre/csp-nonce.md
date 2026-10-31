---
'@panneau/ui': minor
'@panneau/app': minor
---

Panneau runs under a Content Security Policy without `'unsafe-inline'` for styles. `PanneauRoot`, `<Panneau>` and `createPanneauApp()` take a `nonce`, which the `<style>` and `<link>` elements of themes and fonts get. Without it, they read the nonce where React Aria does: `<meta property="csp-nonce">`, then `__webpack_nonce__`. The README of `@panneau/ui` explains what a strict policy needs.
