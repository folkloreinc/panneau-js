# 0095: The boot config is validated after the first paint

- Status: accepted
- Date: 2026-11-19
- Issue: [#346](https://github.com/folkloreinc/panneau-js/issues/346)
- Changes: `createPanneauApp()` in [0019](0019-app-entry.md): it throws only when the boot config is missing or isn't JSON, and `PanneauApp.config` is a promise

## Context

`createPanneauApp()` validated the boot config before it rendered anything ([0019](0019-app-entry.md)): it threw, with the invalid paths, and returned the validated config. The validation is `validateBootConfig()` of `@panneau/protocol`, with Zod and the protocol's schemas, the definition's included, since a boot config can inline one. That is about 170 KB of minified JavaScript that a page loaded and ran before it showed anything, the biggest part of the initial JavaScript left after the other steps of #346.

The REST adapter validates the definition from `GET /definition` with the same schemas, so a validation that loads later costs nothing more: the app needs the schemas before it shows the definition anyway.

The options were:

- **A.** Validate the boot config asynchronously, with Zod loaded by `import()`.
- **B.** Validate with Zod in development only, with a lighter check in production.
- **C.** Keep the synchronous validation, and its 170 KB.

B removes the bytes from production, but invalid data from a server would no longer give a clear error there, only whatever breaks later, and development and production would behave differently.

## Decision

A: **the boot config is validated after the first paint.**

- **What stays synchronous:** `createPanneauApp()` reads the boot config of the page, and throws when it is missing or isn't JSON. These are mistakes in the page, which the entry can't recover from.
- **What loads later:** `createPanneauApp()` loads the schemas with `import()` and validates the boot config while it shows the skeleton of the shell ([0034](0034-skeletons-while-content-loads.md)). An invalid boot config shows an error page, with the invalid paths in the console.
- **`PanneauApp.config` is a promise** of the validated config, which rejects with the invalid paths when the boot config is invalid.
- **The REST adapter** loads the schemas the same way, while its request for the definition runs, and with the response of an action.
- `readBootConfig()` and `validateBootConfig()` don't change, synchronous, for apps that render `<Panneau>` themselves: `<Panneau>` takes a validated config, as before.

## Consequences

- A minimal app loads about 175 KB less JavaScript before its first paint (1551 KB to 1376 KB minified, 488 KB to 445 KB gzip). Zod is in the chunks it loads next, with the definition.
- An entry that read `app.config` awaits it. The entry that `panneau:install` of `laravel-panneau` writes doesn't read it.
- The definition's request starts once the boot config is validated: the schemas load first, in one chunk. Starting it in parallel would need the adapter before the boot config is known valid.
- An invalid boot config no longer stops the entry's code after `createPanneauApp()`: it shows an error page in place of the app.
