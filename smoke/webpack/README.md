# Smoke test: Panneau in a webpack app

A minimal app built with [`@folklore/cli`](https://github.com/folkloreinc/folklore-js/tree/develop/packages/cli) (`flklr`, webpack), like the projects that don't use Vite. `scripts/smoke-webpack.js` installs the packed `@panneau/*` tarballs into a copy of it, builds it, and renders it in Chromium, to check that the published packages work outside Vite: ESM output, CSS imports and peer dependencies.

```bash
npm run build
npm run test:smoke
```
