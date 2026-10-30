---
'@panneau/actions': patch
'@panneau/app': patch
'@panneau/codemods': patch
'@panneau/core': patch
'@panneau/data': patch
'@panneau/editor': patch
'@panneau/fields': patch
'@panneau/forms': patch
'@panneau/intl': patch
'@panneau/lists': patch
'@panneau/media': patch
'@panneau/protocol': patch
'@panneau/ui': patch
---

The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
