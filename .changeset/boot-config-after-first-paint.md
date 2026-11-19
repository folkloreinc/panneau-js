---
'@panneau/app': minor
'@panneau/data': patch
---

The boot config is validated after the first paint (decision 0095, #346): Zod and the schemas of the protocol load with `import()`, out of the JavaScript a page loads up front. A minimal app goes from 1551 KB to 1376 KB minified (488 KB to 445 KB gzip). `@panneau/app`: `createPanneauApp()` still throws when the page has no boot config, or when it isn't JSON; it shows the skeleton of the shell while it validates the boot config, and an error page when it is invalid, with the invalid paths in the console. **`PanneauApp.config` is now a promise** of the validated config, which rejects when it is invalid: `await app.config`. `readBootConfig()` doesn't change. `@panneau/data`: the REST adapter loads the schemas while it fetches the definition, and with the response of an action.
