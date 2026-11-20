---
'@panneau/ui': patch
---

A pending `Button` keeps its accessible name: its label, under the spinner, is hidden with `opacity` instead of `visibility: hidden`, which took it out of the accessibility tree. Screen readers announce which button is busy, and `getByRole('button', { name })` finds it.
