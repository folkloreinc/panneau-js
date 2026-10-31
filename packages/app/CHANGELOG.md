# @panneau/app

## 5.0.0-alpha.9

### Minor Changes

- d172551: Plugin pages can look like the pages of resources, and the edit page shows the actions of its item.
  
  - `@panneau/app` exports the building blocks of its pages: `PageLayout` (the column of a page, `default` or `narrow`), `PageHeader` (the title, a link to the parent page, the actions) and `LinkButton`.
  - The edit page of an item shows, in its header, the actions of its resource placed in `form`, which is where actions of the `item` scope go by default, for the item's abilities. They run through the action runner, after a confirmation when they ask for one; a `link` action with a URL is a link. Until now, an action placed in `form` was never shown. An action that removes the item, such as `delete`, goes back to the list, in place of the item's page in the history, unless its result has a `redirect`.
- a49284e: Panneau runs under a Content Security Policy without `'unsafe-inline'` for styles. `PanneauRoot`, `<Panneau>` and `createPanneauApp()` take a `nonce`, which the `<style>` and `<link>` elements of themes and fonts get. Without it, they read the nonce where React Aria does: `<meta property="csp-nonce">`, then `__webpack_nonce__`. The README of `@panneau/ui` explains what a strict policy needs.
- 2a6cf2a: Pages of the definition can take params (decision 0038). A page with `"params": ["id"]` is at `{basePath}/pages/{page}/{id}`, and its component gets `params` (`{ id: "4f2a" }`), next to its `props` and the definition. Route references can name a page (`{ "route": "job", "params": { "id": … } }`) when `routes` has no route of that name, so a `link` action with `"route": "job"` opens the page of its item. Menus leave pages with params out.

### Patch Changes

- 30f227f: Lists can be paged with cursors, for lists too large to count (decision 0039).
  
  - `@panneau/protocol`: a list's definition takes `"pagination": "cursor"`. Its pages take `cursor` in the query (`ListQuery.cursor`, `?cursor=…`), and answer `meta: { perPage, nextCursor, previousCursor?, total? }` (`CursorPagination`) instead of page numbers. `meta` of `ListResponse` is now either kind: code that read `meta.total` or `meta.lastPage` checks which with `isCursorPage()` of `@panneau/protocol/runtime`. The mock backend pages such lists with cursors, and the conformance kit accepts them.
  - `@panneau/core`: the list state of a list paged with cursors has no `page`. `nextPage(cursor)` and `previousPage(previousCursor?)` move through its pages, back through the cursors it followed when the backend gives no `previousCursor`. Another sort, filter, search or page size starts over.
  - `@panneau/lists`: `ListView` takes `cursors` (`{ next, previous? }`) and shows the previous and next pages without page numbers (`CursorPagination`). `getPagingProps(meta)` gives a `ListView` its `total` or its `cursors` from the `meta` of a page.
  - `@panneau/media` and `@panneau/app` follow the cursors of the lists and media libraries paged with them.
- Updated dependencies [a49284e]
- Updated dependencies [30f227f]
- Updated dependencies [33a2779]
- Updated dependencies [2a6cf2a]
- Updated dependencies [ca1aa46]
  - @panneau/ui@5.0.0-alpha.9
  - @panneau/protocol@5.0.0-alpha.9
  - @panneau/core@5.0.0-alpha.9
  - @panneau/lists@5.0.0-alpha.9
  - @panneau/fields@5.0.0-alpha.9
  - @panneau/intl@5.0.0-alpha.9
  - @panneau/actions@5.0.0-alpha.9
  - @panneau/forms@5.0.0-alpha.9
  - @panneau/data@5.0.0-alpha.9

## 5.0.0-alpha.8

### Minor Changes

- 82f3c8a: Apps that render `<Panneau>` with their own `iconLoader` no longer bundle every Lucide icon (about 1,900 chunks). `<Panneau>` has no default `iconLoader` anymore: without one, named icons render an empty space, as with `PanneauRoot`. Pass `lucideIconLoader` of `@panneau/ui/named-icons` for every Lucide icon, as before. `createPanneauApp()` keeps it as its default, so entries written by `panneau:install` don't change (decision 0036).
- 477d974: The app has a login page in `panneau` auth mode, a login with a token, and a logout (decision 0037).
  
  - `@panneau/app`: in `panneau` mode, the app shows its login page when the API answers `401`, at the URL the user was on, then that page once logged in. It offers an email and a password, a token when the auth settings have `token`, and a link for each OAuth provider. The sidebar has a "Log out" button: in `panneau` mode it calls `adapter.logout()`, forgets what it loaded for the user and shows the login page; in `external` mode it goes to `auth.logoutUrl`, and isn't there without it.
  - `@panneau/protocol`: `auth.token` (`{ label?, help? }`), a login with a single secret sent as `{ "token" }` to `POST /auth/login`, whose body in `openapi.json` is now one of the two shapes. `auth.logoutUrl`, the site's logout in `external` mode. The boot config takes `auth`, for the login page before the definition is loaded.
  - `@panneau/data`: `LoginCredentials` is `PasswordCredentials | TokenCredentials`. Adapters that implement `login()` take either one: an adapter that read `credentials.email` checks which it got first.
  - `@panneau/intl`: the messages of the login page and of the logout, in English and French.

### Patch Changes

- 6e76c06: The app loads the messages of its plugins, and its home route follows the definition.
  
  - `<Panneau>` and `createPanneauApp()` load the messages that plugins provide (`locales`) in the locale of the definition, over Panneau's, before they render the shell. A plugin's pages no longer need an `IntlProvider` of their own. Messages that fail to load are left out, with an error in the console.
  - The home route renders `pages.home` of the definition when it has one, as decision 0019 says: the page of a plugin, with its `props`, or the built-in `dashboard` (the cards of the resources until the dashboard has widgets). Without it, the home is the cards of the resources, as before.
  - `PanneauRoot` takes `messages`, added to Panneau's in the `IntlProvider` it provides when there is none above it.
- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/actions@5.0.0-alpha.8
  - @panneau/core@5.0.0-alpha.8
  - @panneau/data@5.0.0-alpha.8
  - @panneau/fields@5.0.0-alpha.8
  - @panneau/forms@5.0.0-alpha.8
  - @panneau/intl@5.0.0-alpha.8
  - @panneau/lists@5.0.0-alpha.8
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Minor Changes

- fb534de: Skeletons instead of spinners while content loads (#121, decision 0034), drawn by the components themselves, so a product that uses them without the app gets them too:
  
  - `ListView`: while `items` is `undefined`, rows of its columns in its layout, as many as the page size, up to 10.
  - `ItemDetails`: `item` can be `undefined` while it loads, for the labels with a skeleton of each value.
  - `Form` and `FormView`: `isLoading` draws the layout of the form, and for each field its label and a block of its height, from its type. The app's edit page uses it while the item loads.
  - The media picker draws its cards with `Skeleton`, and its own skeleton CSS is gone.
  - The app: the item panel draws its title, actions and details, the preview a block in its frame, and the boot the shell with its sidebar and a page header, instead of a centered spinner.
  - New messages, in English and French: `lists.loading`, `lists.loadingItem`, `forms.loading`, `app.previewLoading`.

### Patch Changes

- 9c6c087: Every component is memoized by the React Compiler again. The packages were built with Babel 8, on which React Compiler 1.0 skips any component with a default value in its props (`Fieldset`, `Text`, `TextInput` and most others), so they shipped without memoization. The build is back on Babel 7, and the components the compiler still skipped (`Panneau`, `FormView`, `ListView`, `Select`, the file, location, embed, slug and relation fields, `MediaField`, `MediaPicker` and `ImageEditor`) are rewritten so that it compiles them. Nothing changes in their behavior.
- Updated dependencies [9c6c087]
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
- Updated dependencies [fb534de]
  - @panneau/fields@5.0.0-alpha.7
  - @panneau/forms@5.0.0-alpha.7
  - @panneau/lists@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
  - @panneau/actions@5.0.0-alpha.7
  - @panneau/core@5.0.0-alpha.7
  - @panneau/data@5.0.0-alpha.7

## 5.0.0-alpha.6

### Minor Changes

- 75a6496: Two more field types ([decision 0033](../docs/decisions/0033-more-field-types.md)):
  
  - **`embed`:** the URL of a video, a sound or a post. The backend resolves it with the provider's oEmbed (`GET /embeds?url=`), and the field shows its title and thumbnail. Without the endpoint, the value is `{ url }`.
  - **`location`:** a point and its address, `{ lat, lng, address }`, placed on a Leaflet map loaded on demand, typed, or found by address through a pluggable geocoding source.
  
  And:
  
  - **`@panneau/protocol`:** `EmbedValue`, `EmbedResponse` and `LocationValue`, `GET /embeds` in the OpenAPI document, the two types in `BUILT_IN_FIELD_TYPES`, and `/embeds` in the mock backend.
  - **`@panneau/data`:** `resolveEmbed()`, optional in `DataAdapter`, implemented by the REST adapter.
  - **`@panneau/fields`:** `EmbedField` and `LocationField` at `@panneau/fields/embed` and `/location`; `createEmbedSource()`; the `embedSource` and `maps` of `FieldsProvider`; `GeocodingSource` and `createNominatimSource()`.
  - **`@panneau/lists`:** `EmbedDisplay` and `LocationDisplay`.
  - **`@panneau/app`:** the `maps` option, and the embed source of the adapter.
  - **`@panneau/intl`:** the messages of the new fields, in English and French.

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/data@5.0.0-alpha.6
  - @panneau/fields@5.0.0-alpha.6
  - @panneau/lists@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6
  - @panneau/actions@5.0.0-alpha.6
  - @panneau/forms@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 3830b4f: Navigating the app shell no longer loses unsaved changes, and announces each page:
  
  - **`@panneau/core`:** `createLeaveGuards()`, `LeaveGuardsProvider` and `useLeaveGuard()` let a router ask the forms below it before leaving a page.
  - **`@panneau/forms`:** under a `LeaveGuardsProvider`, a form with unsaved changes (`guardUnsavedChanges`, on by default) asks in a dialog before the router leaves its page, not only before the page closes or reloads.
  - **`@panneau/app`:**
      - links, "Go to…" and actions ask before leaving a form with unsaved changes, and so do the browser's back and forward buttons;
      - the tab is named after the page (`Ten walks for the fall · Articles · Northwind Journal`);
      - when the route changes, focus moves to the title of the new page and the page scrolls to the top. Opening the panel of an item focuses the panel, and closing it gives focus back to the item's link.
- bdb1173: A first app shell replaces the placeholder of `@panneau/app`, to try the Phase 2 shell on the v5 components:
  
  - **Layout:** a sidebar on the window's background and the page on a raised panel, like the vertical tabs of recent browsers. The sidebar collapses to a rail of icons (its button, or Ctrl+\ / ⌘+\), and the browser remembers it. Below the `lg` width of the root, a bar opens it as a drawer.
  - **Navigation:** the `main` menu of the definition (`resources`, `resource`, `page`, `link`, `separator`, `group`), or every resource and page without one, with the Lucide icons the definition names. Resources the user can't list are left out.
  - **Pages:** a home page with a card per resource, resource lists (`ListView`, with the query in the URL and actions run by `@panneau/actions`), create and edit forms (`Form`, with server errors, version conflicts and the unsaved changes guard), plugin pages, and a not found page.
  - **Theming:** the frame reads the `--panneau-shell-*` and `--panneau-sidebar-*` component tokens (exported as `shellTokens`, `sidebarTokens` and `appComponentTokens`), which `defineTheme()` accepts once `@panneau/app` is imported: the inset panel of the default, or a flat frame with the sidebar on a surface.
  - **Theme:** the app renders in `PanneauRoot`, with the theme of the definition and its plugins, and a light, dark or system color scheme the user picks in the sidebar.
  - `Panneau` and `createPanneauApp()` take an `iconLoader`, every Lucide icon by default.
  - `@panneau/intl` has the messages of the app (`appMessages`), in English and French.
- b86f35e: A "Go to…" command palette ([decision 0029](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0029-go-to-palette.md)), which products can also use without the app:
  
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
- 6d1f1d8: The show route of an item opens its details in a panel next to its list ([decision 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)), instead of the edit form:
  
  - `@panneau/app`: titles in a list link to the show route, with the list's query. The panel shows the item's values, a link to edit it, and the `link` actions of the resource that apply to it, such as its page on the site. Its button or Escape closes it, back to the list with its query. It sits beside the list from the `xl` width of the root, and over it below. Its tokens are `--panneau-item-panel-*` (`itemPanelTokens`).
  - `@panneau/lists`: `ItemDetails` shows the values of one item with the displays of the lists. `ListView` takes `currentItemId`, which marks the row of the item shown and makes the link of its title the current page. Layouts get `isCurrent`. A table keeps its title column readable in a narrow list, and scrolls instead.
  - `@panneau/intl`: the messages of the panel, in English and French.
- 6d1f1d8: Previews of items, in the panel of the show route ([decisions 0009 and 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)):
  
  - `@panneau/core`: plugins register preview components by name in `previews`, for resources whose `features.preview` is `{ "mode": "component", "component": "<name>" }`. They get `PreviewProps`: the item, its resource and the locale, to render the page as the site shows it, blocks, partials or charts.
  - `@panneau/data`: `previewItem()`, optional on adapters and implemented by the REST adapter, posts values to `POST /resources/{resource}/{id}/preview` and returns the short-lived URL of the item's page. `useItemPreview()`, `itemPreviewQueryOptions()` and `queryKeys.itemPreview()` fetch it.
  - `@panneau/protocol`: the mock backend answers the preview route, with a `data:` page of the item's values, or the URL of its `previewUrl` option.
  - `@panneau/app`: the panel of an item opens on a Preview tab, before its Details, when its resource has a preview, and remembers the tab. A button widens the panel, for previews (`--panneau-item-panel-width-wide`, half of the page by default).
  - `@panneau/intl`: the messages of previews, in English and French.
- 5779047: The global search reads `limit` and `resources`, and can be narrowed to one resource ([decision 0030](../docs/decisions/0030-search-parameters-and-scope.md)):
  
  - **`@panneau/protocol`:**
      - `GET /search` takes `limit` (1 to 20, 5 by default) and `resources` (comma-separated searchable resources). An invalid parameter is a `422` problem keyed by parameter, and a backend may answer `429` with `Retry-After`.
      - `readSearchQuery()`, `toSearchQueryParams()`, `isSearchableResource()` and the `SEARCH_*` limits are in `@panneau/protocol/runtime`. The mock backend uses them, and `openapi.json` documents them.
      - `runConformance()` checks the search: `search`, `search.scope` and `search.invalid`.
  - **`@panneau/data`:** `adapter.search(q, { limit, resources })`, `useSearch(q, { limit, resources })` and `searchQueryOptions(adapter, q, { limit, resources })`. Search keys are now `['panneau', 'search', q, options]`. A `429` is a `RateLimitedError`, with `retryAfter` from `Retry-After` (`readRetryAfter()`).
  - **`@panneau/ui`:** `CommandPalette` takes a `scope`, shown as a chip before the field, and `onScopeRemove`, called by Backspace in the empty field or the chip's button. Items with `keepsOpen` don't close it. Without results, its list shows its `status`.
  - **`@panneau/core`:** `isSearchable()` uses the protocol's `isSearchableResource()`.
  - **`@panneau/app`:** "Search in" narrows "Go to…" to one resource, with 20 results. "See all N results" opens the list of a resource, searched, when it has more results than shown. Too many searches are said in the palette.
  - **`@panneau/intl`:** the messages of the scope, in English and French.
- 5b2f3ce: Small fixes to the interface, and a link to the user's profile:
  
  - **`@panneau/ui`:**
      - a text before or after the value of a `TextInput` (`prefix`, `suffix`) reads with it, without a gap: `/episodes/ete-a-montreal`, as in the slug field. Icons and other elements keep their space;
      - `DatePicker` with a time (`granularity` `hour`, `minute` or `second`): the calendar has a field for the time, and stays open after a day is picked (`shouldCloseOnSelect` defaults to `false`). The calendar is as wide as its content, its month buttons lose the divider of the field's button, and the space of `10/15/2026, 9:30 AM` is back;
      - the description of an option (`Select`, `ComboBox`, `Menu`) is smaller, under its label, and an option with one has more room (`--panneau-list-box-item-padding-y-described`).
  - **`@panneau/app`:**
      - on a small screen too, the page is on a panel inset from the edges, with rounded corners, as on a large one. The shell's `inset`, `panel-border`, `panel-radius` and `panel-shadow` tokens apply at every width;
      - the user in the sidebar links to their profile: their item in the resource of users, when the definition has it.
  - **`@panneau/protocol`:** `user.resource` names the resource of users. Without it, clients look for a resource `users`.
  - **`@panneau/intl`:** the labels of the profile link and of the calendar's time, in English and French.

### Patch Changes

- Updated dependencies [282e968]
- Updated dependencies [3830b4f]
- Updated dependencies [bdb1173]
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [eadfc08]
- Updated dependencies [f2c79b5]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [6d1f1d8]
- Updated dependencies [bdb1173]
- Updated dependencies [8372b27]
- Updated dependencies [199a687]
- Updated dependencies [fb33783]
- Updated dependencies [5779047]
- Updated dependencies [5b9aa44]
- Updated dependencies [5b2f3ce]
  - @panneau/actions@5.0.0-alpha.5
  - @panneau/core@5.0.0-alpha.5
  - @panneau/forms@5.0.0-alpha.5
  - @panneau/intl@5.0.0-alpha.5
  - @panneau/protocol@5.0.0-alpha.5
  - @panneau/data@5.0.0-alpha.5
  - @panneau/fields@5.0.0-alpha.5
  - @panneau/ui@5.0.0-alpha.5
  - @panneau/lists@5.0.0-alpha.5

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/data@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [3c68628]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/data@5.0.0-alpha.3
  - @panneau/core@5.0.0-alpha.3

## 5.0.0-alpha.2

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2
  - @panneau/core@5.0.0-alpha.2
  - @panneau/data@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 345e06c: Add `@panneau/app` with the app entry: `createPanneauApp({ element, plugins, adapter, config })` reads the boot config of the page, creates the Laravel adapter by default, uses the inlined definition or fetches it, and renders a placeholder shell that follows the client routes under `basePath` in history mode. When the API answers `401` (or `419` from Laravel), it sends the browser to the login URL, or calls `onUnauthorized`. Also exports `<Panneau>` and `readBootConfig()`.

### Patch Changes

- Updated dependencies [b1d02aa]
- Updated dependencies [de03e3d]
- Updated dependencies [3e4f251]
- Updated dependencies [dfb0b1f]
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/core@5.0.0-alpha.1
  - @panneau/data@5.0.0-alpha.1
  - @panneau/protocol@5.0.0-alpha.1
