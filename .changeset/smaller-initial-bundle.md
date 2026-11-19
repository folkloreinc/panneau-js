---
'@panneau/app': minor
'@panneau/fields': minor
'@panneau/lists': patch
---

Less JavaScript to load before the first page (#346): a minimal app goes from 2082 KB to 1593 KB minified (609 KB to 496 KB gzip). `@panneau/app`: the auth pages and the account page load on first use, with the skeleton of their shape until then, and the README's setup adds `@react-aria/optimize-locales-plugin` to the Vite config, to keep React Aria's strings to the app's languages. `@panneau/fields`: the entries of `builtInFields` with heavy code (`tel` and the metadata of phone numbers, `location`, `address`, `link`, `embed`, `file`, `country`, `region`, `color`, `slug`, `json`, `daterange`, `duration`, `money`) load on first use, with the skeleton of the field until then; `lazyFieldEntry()` does the same for the types of plugins. `@panneau/lists`: the `tel` display loads with the first number shown, which shows as it is until then.
