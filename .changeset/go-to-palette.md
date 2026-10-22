---
'@panneau/ui': minor
'@panneau/core': minor
'@panneau/data': minor
'@panneau/protocol': minor
'@panneau/app': minor
'@panneau/intl': minor
---

A "Go to…" command palette ([decision 0029](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0029-go-to-palette.md)), which products can also use without the app:

- `@panneau/ui`:
    - `CommandPalette`: a search field over groups of items to go to or run, in a dialog near the top of the screen (the whole screen on a phone).
    - It matches items without case or accents, needs every word to match, and ranks the best matches first (`matchCommands()`, `normalizeSearch()`). Groups that are already `matched`, such as results of a server, are shown as they are, after the others.
    - `useCommandShortcut()` opens it with ⌘K or Ctrl+K, unless something already handled the key.
    - Tokens: `--panneau-command-palette-*`.
- `@panneau/core`: plugins add `commands` (`Command`, `getCommands()`). `isSearchable()` and `getSearchableResources()` tell which resources the global search covers: `features.search`, which defaults to `list.search`.
- `@panneau/data`: `useSearch()`, `searchQueryOptions()` and `queryKeys.search()`.
- `@panneau/protocol`:
    - resources get `itemSubtitle` and `itemImage`, next to `itemTitle`;
    - `features.search` defaults to `list.search`;
    - the mock backend answers `GET /search`: 5 items per resource, 20 in all, from 2 characters.
- `@panneau/app`: "Go to…" in the sidebar (an icon when collapsed), in the phone's top bar, and on ⌘K or Ctrl+K.
    - It lists recent items, kept in the browser, then the navigation, "New {resource}", the commands of plugins and the app's actions.
    - The server's search results follow, grouped by resource, with their subtitle and image.
    - An item opens its edit form.
- `@panneau/intl`: the messages of the palette, in English and French.
