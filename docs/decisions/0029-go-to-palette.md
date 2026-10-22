# 0029: A "Go to…" command palette that products can use without the app

- Status: accepted
- Date: 2026-10-22
- Issue: [#97](https://github.com/folkloreinc/panneau-js/issues/97)
- Specifies: [0015](0015-dashboards-and-search.md), the global search

## Context

[0015](0015-dashboards-and-search.md) decided on a command palette (`⌘K`) that searches every resource that enables search through `GET /search`, with results grouped by resource. It left open what the palette shows besides the results of the server, what a result opens, and where its parts live.

The palette is for finding something and acting on it quickly. Products that use the pieces of Panneau without its app (Niche) need it too, with their own groups and their own search.

The palette of Urbania's internal tools served as a reference: a dialog with a search field over grouped results, local matching that ignores case and accents, results of the server added after the local ones without blocking them, short limits, and a shortcut that defers to editors that use it.

## Decision

### What it shows

- **Its name is "Go to…"**, in the trigger and the field.
- **Local groups, first**, matched as the user types:
    - **recent items**, the last 8 items the user opened (their edit form or their panel), kept in the browser for each app and user;
    - **navigation**: the home page, then the links of the `main` menu;
    - **create**: "New {resource}" for each resource the user can create;
    - **commands of plugins** (`commands` of `PanneauPlugin`), so projects add theirs from the first step;
    - **actions** of the app: collapse or expand the sidebar, change the appearance.
- **Results of the server, after them**, grouped by resource, as `GET /search` returns them, without matching them again. They are fetched 300 ms after the user stops typing, from 2 characters, and the previous results stay while the next ones load. A line says when they load or fail; the local groups stay.
- **An item opens its edit form**, to act on it right away.
- **Items show their subtitle and image** when their resource declares them: `itemSubtitle` and `itemImage`, two new properties of resources, next to `itemTitle`, for cards and pickers too.
- **Limits:** 5 results per resource, 20 in all, and 2 characters before searching the server.

### Matching

Case and accents are ignored, and every word typed must match the label, the description or the keywords of an item. Items are ranked: labels that start with the query, then labels with a word that starts with it, then labels that contain it, then the rest.

### Searchable resources

A resource is searchable when its `features.search` is `true`, or, without it, when its list has a search (`list.search`): one setting for the list's `q` and the global search, as 0015 wants. `features.search: false` takes a resource with a list search out of the global search.

### Where the parts live

- **`@panneau/ui`:** `CommandPalette`, generic: groups of items (label, description, keywords, icon, image, link or action), its matching (`matchCommands()`), the keyboard and the dialog, through React Aria's `Autocomplete`, `SearchField` and `Menu`. It knows no definition, router or data. `useCommandShortcut()` opens it with `⌘K` or `Ctrl+K`, unless an editor already handled the key (TipTap uses `Mod-K`), or the key repeats.
- **`@panneau/core`:** `commands` of plugins (`Command`: an id, a label, a group, keywords, a Lucide icon name, a link or a function), and `isSearchable()`.
- **`@panneau/data`:** `useSearch()` and `searchQueryOptions()`.
- **`@panneau/app`:** the palette of the shell. It builds the groups, keeps the recent items, and shows its triggers: a field-like button in the sidebar (an icon when collapsed), and an icon in the phone's top bar.

A product builds its own groups and passes them to `CommandPalette`, with `useSearch()` or its own search.

## Consequences

- The palette works without a search backend: step 1 needs no change to the protocol besides `itemSubtitle` and `itemImage`.
- The mock backend answers `GET /search`, so the app and products can try it before `laravel-panneau` has it.
- The `limit` and `resources` parameters of `GET /search`, its `422` and `429` problems, conformance checks, `laravel-panneau`'s endpoint on Scout, and recent items kept on the server come in later steps of #97.
