---
'@panneau/intl': minor
'@panneau/ui': minor
'@panneau/app': patch
'@panneau/fields': minor
'@panneau/lists': minor
'@panneau/media': patch
---

Panneau's messages load on first use, in the language the app shows (#346): a minimal app goes from 1600 KB to 1544 KB minified (499 KB to 485 KB gzip). `@panneau/intl`: `loadPanneauMessages(locale)` loads the messages of every package for a locale with an `import()` the first time, and `getLoadedPanneauMessages(locale)` returns them once loaded. `@panneau/ui`: `PanneauRoot` loads them, and renders in English until then, without the English catalog. `@panneau/app`: the app waits for them with the messages of the plugins. `@panneau/fields` and `@panneau/lists`: `locales.fr` of `fieldsPlugin` and `listsPlugin` is a loader. The thumbnails of the embed display, the embed field and the media field load when scrolled to (`loading="lazy"`).
