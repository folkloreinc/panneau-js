---
'@panneau/actions': patch
'@panneau/app': patch
'@panneau/editor': patch
'@panneau/fields': patch
'@panneau/forms': patch
'@panneau/intl': patch
'@panneau/lists': patch
'@panneau/media': patch
'@panneau/ui': patch
---

The packages accept `react-intl` 10 as well as 12 (`^10.0.0 || ^12.0.0`), so sites on Panneau 4 and their dependencies that require react-intl 10 (`@micromag/*` 0.4, `@folklore/utils`) install them without a conflict. CI runs the tests of every package with both. The types of Panneau's messages still come from react-intl 12: a TypeScript project on 10 sets `skipLibCheck` (see `docs/migration.md`).
