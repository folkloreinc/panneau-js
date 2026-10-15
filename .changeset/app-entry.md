---
'@panneau/app': major
---

Add `@panneau/app` with the app entry: `createPanneauApp({ element, plugins, adapter, config })` reads the boot config of the page, creates the Laravel adapter by default, uses the inlined definition or fetches it, and renders a placeholder shell that follows the client routes under `basePath` in history mode. When the API answers `401` (or `419` from Laravel), it sends the browser to the login URL, or calls `onUnauthorized`. Also exports `<Panneau>` and `readBootConfig()`.
