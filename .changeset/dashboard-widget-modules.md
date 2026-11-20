---
'@panneau/app': patch
---

Each built-in widget of the dashboard (`stat`, `series`, `breakdown`, `metric`, `table`, `list`) has its own module, with the formats they share in another, and the registry of the built-in widgets (decision 0097) in `dashboard/widgets`. Nothing changes for users.
