---
'@panneau/ui': patch
---

Document how Vite apps keep `getNamedIcon()` from splitting `lucide-react` into one chunk per icon in development: exclude `lucide-react/dynamicIconImports.mjs` from `optimizeDeps`. Panneau's Storybook does it, and named icon stories wait longer for their first icon.
