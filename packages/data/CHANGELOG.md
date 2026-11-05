# @panneau/data

## 5.0.0-alpha.24

### Patch Changes

- @panneau/protocol@5.0.0-alpha.24

## 5.0.0-alpha.23

### Patch Changes

- @panneau/protocol@5.0.0-alpha.23

## 5.0.0-alpha.22

### Patch Changes

- Updated dependencies [d8a77d0]
- Updated dependencies [d8a77d0]
  - @panneau/protocol@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- @panneau/protocol@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- @panneau/protocol@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- Updated dependencies [b547a0a]
- Updated dependencies [f07ce4c]
  - @panneau/protocol@5.0.0-alpha.19

## 5.0.0-alpha.18

### Minor Changes

- b200640: The widgets of the dashboard (decision 0064):
  
  - `@panneau/protocol`: the built-in widget types are `stat`, `series` and `list`, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the shapes of their data at `GET /dashboard/widgets/{widget}`, in the schemas and the OpenAPI document (with a `500` for data in the wrong shape). A `stat` or a `list` with `settings.resource` and `settings.query` reads the list of a resource instead. `validateDefinition()` checks the widgets: unique ids, a resource that exists, filters of its list, no `stat` on a list paged with cursors. `checkWidgetData()`, `getWidgetResource()` and the widget constants are in `@panneau/protocol/runtime`. The mock backend answers the widgets with its `widgets` option, and the conformance kit checks the endpoint (`dashboard.widgets`, `dashboard.widgets.resource`, `dashboard.widgets.unknown`).
  - `@panneau/ui`: `Stat`, a number in large type with its label, its help, a tone and a link, and `LineChart`, a line on the chart colors of the theme with its values in a table for assistive technologies. Both draw a skeleton while they load.
  - `@panneau/data`: `useWidgetData()`, `widgetDataQueryOptions()` and `queryKeys.widget()`.
  - `@panneau/core`: `WidgetProps`, the props of the widgets of plugins.
  - `@panneau/intl`: the messages of the widgets, in English and French.
  - `@panneau/app`: the built-in `dashboard` page draws the widgets of `definition.dashboard` in a grid of 12 columns, one column on a phone. Each widget draws a skeleton of its type while it loads, its error with "Try again" when it fails, and nothing on a `403` or on a resource the user can't list, without touching the others. Without widgets, the home page still shows the cards of the resources.

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [19d0892]
- Updated dependencies [aae4bf7]
- Updated dependencies [d46a16d]
  - @panneau/protocol@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- @panneau/protocol@5.0.0-alpha.17

## 5.0.0-alpha.16

### Patch Changes

- Updated dependencies [f41f26f]
- Updated dependencies [9278b2c]
- Updated dependencies [8281dc0]
- Updated dependencies [cd47332]
- Updated dependencies [3522797]
  - @panneau/protocol@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- 658b3d3: The account page (decision 0050).
  
  - `@panneau/protocol`: `auth.account`, `PATCH /account` with the name and the email, `PUT /account/password` with the current password; the account of the mock backend (a new email is verified again with `auth.emailVerification`), and the `account` conformance check.
  - `@panneau/data`: optional `getAccount()`, `updateAccount()` and `updatePassword()`, and the `account` and `twoFactor` query keys.
  - `@panneau/app`: with `auth.account`, the user's name in the sidebar links to `{basePath}/account`, a page with their name and email, their password, and their two-factor authentication (set up, new recovery codes, turned off unless it is required).
  - `@panneau/intl`: its messages, in English and French.
- d85d11a: Passkeys (decision 0051).
  
  - `@panneau/protocol`: the login options and the login (`/auth/passkeys/options`, `/auth/passkeys/login`), the passkeys of the account (`/account/passkeys`, its options, adding and removing one), the `WebAuthnOptions` and `Passkey` schemas, and `auth.passkeys`. The mock backend registers and logs in with the browser's passkeys, without checking signatures. The `auth.passkeys` and `account.passkeys` conformance checks change nothing.
  - `@panneau/data`: optional `passkeyLoginOptions()`, `passkeyLogin()`, `listPasskeys()`, `passkeyRegistrationOptions()`, `addPasskey()` and `deletePasskey()`, and the `passkeys` query key.
  - `@panneau/app`: a "Log in with a passkey" button on the login page, and the passkeys on the account page. The WebAuthn ceremonies use the browser's JSON conversions, with a fallback of their own.
  - `@panneau/intl`: their messages, in English and French.
- b05ef33: Password reset and email verification in the `panneau` auth mode (decision 0048).
  
  - `@panneau/protocol`: `POST /auth/email/verification` and `POST /auth/email/verify` in `openapi.json`, `429` answers of the password reset, the `EMAIL_UNVERIFIED_PROBLEM_TYPE` and `AUTH_PAGE_PATHS` constants, the `auth` option of the mock backend (users, a session and the emails it "sends"), and conformance checks of the reset and of the verification when the definition enables them.
  - `@panneau/data`: the optional `forgotPassword()`, `resetPassword()`, `sendEmailVerification()` and `verifyEmail()` of `DataAdapter`, implemented by `createRestAdapter()`.
  - `@panneau/app`: with `auth.passwordReset`, a "Forgot your password?" link on the login page and the page that the reset link opens (`{basePath}/auth/reset-password`); with `auth.emailVerification`, a page that sends a new link when the API refuses an unverified address, and the page that the link opens (`{basePath}/auth/verify-email`).
  - `@panneau/intl`: their messages, in English and French.
- acdc6e2: Two-factor authentication in the `panneau` auth mode (decision 0049).
  
  - `@panneau/protocol`: `POST /auth/two-factor/challenge` with a code or a recovery code, `POST /auth/password/confirm`, the `/account/two-factor` endpoints (status, setup, confirmation, recovery codes, off), the `TwoFactorChallenge`, `TwoFactorStatus`, `TwoFactorSetup` and `RecoveryCodes` schemas, `423` answers, `TWO_FACTOR_REQUIRED_PROBLEM_TYPE` and `PASSWORD_CONFIRMATION_PROBLEM_TYPE`; two-factor users, a fixed code and required two-factor in the mock backend; conformance checks of the status and of a challenge without a pending login.
  - `@panneau/data`: `login()` resolves with `{ twoFactor: true }` when the login waits for a second factor (`LoginResult`: a breaking change of the type for custom adapters); optional `twoFactorChallenge()`, `confirmPassword()`, `getTwoFactor()`, `enableTwoFactor()`, `confirmTwoFactor()`, `disableTwoFactor()` and `regenerateRecoveryCodes()`; `PasswordConfirmationError` for `423`.
  - `@panneau/app`: the login page asks for the second factor; a user who must have two-factor authentication gets a page that sets it up (QR code, key, confirmation, recovery codes); operations that need the password ask for it in a dialog.
  - `@panneau/intl`: their messages, in English and French.
- Updated dependencies [658b3d3]
- Updated dependencies [97456b6]
- Updated dependencies [d85d11a]
- Updated dependencies [b05ef33]
- Updated dependencies [acdc6e2]
  - @panneau/protocol@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- @panneau/protocol@5.0.0-alpha.14

## 5.0.0-alpha.13

### Patch Changes

- 7a5a38e: A current context, picked in the app and sent with every request (#182, [decision 0045](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0045-current-context.md)).
  
  - `@panneau/protocol`: the definition's `context.params` (`ContextParam`, `ContextOption`, `DefinitionContext`): a name, a label, `required`, `fixed` (a value the backend sets from the request, such as the client of its domain), `allLabel`, inline `options`, and the `value` and `valueLabel` it was built for. The `Panneau-Context` header (`CONTEXT_HEADER`, `formatContextHeader()`, `parseContextHeader()`, `contextBefore()`), the `403` problem of type `urn:panneau:problem:context` with its `param` (`CONTEXT_PROBLEM_TYPE`), `GET /context/{param}/options` (`ContextOptionsResponse`) and `RESERVED_ROUTE_SEGMENTS`, in the schemas and the OpenAPI document, where every operation takes the header and can answer the `403`. The mock backend takes `context` (the choices of each param, and the items of each resource in the context), and the conformance kit checks a backend with a context, with `context` to send values with every request.
  - `@panneau/data`: `DataAdapter.withContext(values)`, an adapter that sends `Panneau-Context`, and `getContextOptions(name, { q })`, both optional. The REST and Laravel adapters have them.
  - `@panneau/app`: the values of the context are a prefix of the routes (`{basePath}/client/4/contest/12/…`) and every request sends them. The sidebar has a field per param (a button with a popover in the rail of icons), with its choices inline or searched; picking other values loads the app for them. While a required param has no value, every route asks for it. A fixed param shows its value without a field, and stays out of the path and of the header. Values the backend chose go to the path, and a value the user can't use takes the app to the path without it. New classes: `panneau-context-picker-*` and `panneau-context-page-*`.
  - `@panneau/intl`: the messages of the picker and of the page that asks for a value, in English and in French.
- 24c4fa6: Lists edit fields in place, one field at a time ([decision 0043](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0043-inline-editing.md)).
  
  - `@panneau/protocol`: a partial update reads the conditions (`visibleWhen`) and the rules that name other fields with the item's values for the fields it doesn't send: `checkValues()` takes `item`, and the mock backend passes it. A field shown when `status` is `published`, sent alone, is checked on a published item. The conformance kit checks, with `writes`, that a `PATCH` with a single field and `If-Match` changes that field alone (`update.single-field`).
  - `@panneau/lists`: a column whose field is in `inlineEdit` edits it in place in the table, for `text`, `number`, `select`, `boolean` and `date` fields, on items whose abilities allow `update`. A boolean is a checkbox; the others show a button that turns the cell into the field's control: Enter or leaving the cell saves, Escape cancels, a select or a date saves when picked. The value is checked by the field's portable rules, then saved through `onInlineEdit` (`ListInlineEditHandler`, `ListInlineEditEvent`), which resolves with the updated item. A `422` shows its messages on the cell, and a `412` shows the value someone else saved, with "Keep theirs" and "Save mine". `formatError` gives the messages of the rules. `ListLayoutProps` has `renderCell(item, column, content)`, which the table uses for its cells.
  - `@panneau/data`: `useUpdateItem()` puts the updated item in the cached lists of its resource that show it, before refetching them.
  - `@panneau/intl`: messages of inline editing, in English and French.
  - `@panneau/app`: the list of a resource edits its `inlineEdit` fields in place, and saves them with the item's version.
- bdd0a17: The shell has error pages for forbidden content, server errors and an unreachable server (#181).
  
  - `@panneau/data`: a request that gets no answer (offline, or the server can't be reached) rejects with a `NetworkError`, whose `cause` is the error of `fetch`. An aborted request still rejects with its `AbortError`.
  - `@panneau/app`: `ErrorPage` (exported, with `getErrorPageKind()` and the `ErrorPageKind` type) shows, in the look of the not found page, what went wrong and what to do: `not-found`, `forbidden`, `server-error`, `offline` (offline, or the server unreachable: it tries again once the browser is back online) and `error`. The shell uses it:
      - a resource the user can't list shows "Access denied" instead of "Page not found";
      - an item or a list that fails to load shows the page of its error (`403`, `404`, `5xx`, no answer) with a retry, in place of an alert;
      - a page that throws while it renders shows an error page with the sidebar still there, and renders again with "Try again" or on another path;
      - at boot, a definition that fails to load shows the error page on a panel in the frame of the shell: "Access denied" when the user isn't allowed in.
  
      New classes: `panneau-error-page-*`, and `panneau-panneau-frame` and `panneau-panneau-panel` for the frame at boot.
  - `@panneau/intl`: the messages of these pages, in English and in French.
- Updated dependencies [f3036ed]
- Updated dependencies [b07c7ab]
- Updated dependencies [7a5a38e]
- Updated dependencies [1e19478]
- Updated dependencies [24c4fa6]
- Updated dependencies [47b7556]
  - @panneau/protocol@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Minor Changes

- 68f5322: Lists have the `show`, `edit` and `delete` buttons of v4 again, and `duplicate`: every resource has these four item actions without declaring them, shown on the items whose abilities allow them. A resource can also open its items in their form instead of the panel (decision 0040).
  
  - `@panneau/protocol`:
      - The built-in item actions `show`, `edit`, `duplicate` and `delete` need their ability on an item: `view`, `update`, `duplicate`, `delete`. A missing or false ability hides them. A resource picks some of them, in its order, with `itemActions` (`["edit", "delete"]`, `[]` for none). A declared action with one of these ids replaces the built-in one, takes its `placement`, `confirm`, `destructive` and `dryRun` when it doesn't set them, and its `label` is optional. The id set to `false` hides the action too (`"edit": false`). An item without abilities shows none of the four.
      - The ids `show` and `edit` are reserved for `link` actions; every other action needs a `label`. The generated JSON Schema and OpenAPI document check both with `if`/`then`, and also that a `link` has a `url` or a `route` and a `client` action a `component`, as the Zod schemas do.
      - `POST /resources/{resource}/{id}/duplicate` copies an item, and answers `201` with the copy, or a `409` problem when the copy conflicts with another item (a unique value).
      - A resource takes `open`: `panel` (the default) or `edit`, where an item's title goes.
      - `BUILT_IN_ITEM_ACTIONS`, `ITEM_ACTION_ABILITIES`, `isBuiltInItemAction()`, `BUILT_IN_LINK_ACTIONS` and `isBuiltInLink()` are in the runtime entry point.
      - The mock backend allows the four on its items, duplicates items, and answers dry runs of the built-in `delete`. It reads abilities as clients do: a missing ability doesn't allow an action, in dry runs, in `delete` (skipped items are reported, and the only item of an item action is a `403`) and in `duplicate` (`403`). Its example definition shows `itemActions` and `open`.
      - The conformance kit checks that the built-in `delete` answers a dry run without being declared (`action.delete`) and, with `writes`, the duplication of an item that allows it, with the `ETag` of the copy (`duplicate`).
  - `@panneau/core`: `getItemActions(resource, item, surface)` decides the actions of an item on each surface, `row`, `menu`, `panel` and `form`, each with its link or to run: the built-in item actions (from `itemActions`, replaced by declared ones with their ids), then the declared actions, by their placement and the item's abilities, without the one that leads to the surface (no `show` in the panel, no `edit` in the form). `form` is the header of the item, in its panel and its form, so an item shows the same actions in its row, its panel and its form. `selectItemActions()` does the same with actions already placed, and `fillActionUrl()` fills a URL template. `getResourceActions()` gives the actions of a resource with its built-in item actions (and without `show` when items open in their form): `show` and `edit` in rows and headers, `duplicate` and `delete` in the menu of rows and headers, `delete` on selections too, so lists are selectable. `isActionAllowedOn()` checks the abilities of the built-in item actions, also on an item without abilities, which shows none of them: a declared `show` or `edit` is now hidden on an item without `view: true` or `update: true`. `getOpenMode()` reads `open`.
  - `@panneau/intl`: `getActionLabel()` labels an action, and the built-in item actions in the locale: "View", "Edit", "Duplicate", "Delete" ("Voir", "Modifier", "Dupliquer", "Supprimer").
  - `@panneau/lists`: rows and their menu show the actions of `selectItemActions()`. `ListView` takes `getLinkHref`, which resolves the built-in links and the links with a `route`, and leaves out the built-in links it can't resolve. `isAllowedOn()` follows the abilities of the built-in item actions.
  - `@panneau/data`: `duplicate()` on the data adapter (optional), in the REST adapter, and `useDuplicateItem()`.
  - `@panneau/actions`: results and runs label actions with `getActionLabel()`.
  - `@panneau/app`: rows, their menu, the panel and the edit form show the actions of `getItemActions()`, and the panel and the form with the same component: "Edit", "Duplicate", "Delete" and the declared links in the panel, "View", "Duplicate", "Delete" and the declared links in the form. The panel now shows only the actions placed in `form`, as the form does; links with a `route` are links in rows too, and links outside the admin open in a new tab. `duplicate` asks first when a form has unsaved changes, then copies the item and opens the copy in its form; it is left out with an adapter that can't duplicate. Deleting from the panel closes it. The links of the panel's header have the class of the edit page's (`.panneau-pages-action-link`): `.panneau-item-panel-action` is gone. With `"open": "edit"`, titles open the form, and the show route redirects there with its hash, after the `viewAny` check of the list; an item that can't be updated still opens in the panel. While the item loads, the show route shows nothing rather than the list for an instant.

### Patch Changes

- Updated dependencies [810fc90]
- Updated dependencies [2fcd438]
- Updated dependencies [68f5322]
  - @panneau/protocol@5.0.0-alpha.10

## 5.0.0-alpha.9

### Patch Changes

- Updated dependencies [30f227f]
- Updated dependencies [2a6cf2a]
- Updated dependencies [ca1aa46]
  - @panneau/protocol@5.0.0-alpha.9

## 5.0.0-alpha.8

### Minor Changes

- 477d974: The app has a login page in `panneau` auth mode, a login with a token, and a logout (decision 0037).
  
  - `@panneau/app`: in `panneau` mode, the app shows its login page when the API answers `401`, at the URL the user was on, then that page once logged in. It offers an email and a password, a token when the auth settings have `token`, and a link for each OAuth provider. The sidebar has a "Log out" button: in `panneau` mode it calls `adapter.logout()`, forgets what it loaded for the user and shows the login page; in `external` mode it goes to `auth.logoutUrl`, and isn't there without it.
  - `@panneau/protocol`: `auth.token` (`{ label?, help? }`), a login with a single secret sent as `{ "token" }` to `POST /auth/login`, whose body in `openapi.json` is now one of the two shapes. `auth.logoutUrl`, the site's logout in `external` mode. The boot config takes `auth`, for the login page before the definition is loaded.
  - `@panneau/data`: `LoginCredentials` is `PasswordCredentials | TokenCredentials`. Adapters that implement `login()` take either one: an adapter that read `credentials.email` checks which it got first.
  - `@panneau/intl`: the messages of the login page and of the logout, in English and French.

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Patch Changes

- Updated dependencies [060e0de]
  - @panneau/protocol@5.0.0-alpha.7

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
  - @panneau/protocol@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 88a3d09: Fields check their value with the backend, and the slug field does what sites' `PageSlug` did (decision 0032). A field with `check: true` sends `POST /resources/{resource}/fields/{field}/check` as it is typed (`FieldCheckRequest`), and the backend answers whether the value is available, a free suggestion, the URL's `prefix` and `url`, and `disabled` for an item the field doesn't apply to (`FieldCheckResponse`). The mock backend answers it, and the conformance kit checks it (`fields.check`). `DataAdapter.checkField?()` sends it; `createFieldCheckSource(adapter, resource, id)` gives the fields context its `checkSource`, which `FormView` takes too. The `slug` field follows its source in its own locale, or in the default one, shows the backend's URL, and offers the suggestion when the slug is taken. Field entries get the `locale` of the value they edit.
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

### Patch Changes

- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [8372b27]
- Updated dependencies [5779047]
- Updated dependencies [5b2f3ce]
  - @panneau/protocol@5.0.0-alpha.5

## 5.0.0-alpha.4

### Minor Changes

- b9852a0: Media libraries are resources (decision 0026). A resource of kind `media` (`Resource.kind`) has a `file` field and gives each item a read-only `media` (`MediaInfo`: type, mime, size, URLs, renditions, dimensions, duration, status). Every media operation is a resource operation: `POST /resources/{library}` with `{ file: { upload } }` makes a media, and the `/media` endpoints are removed, with the `Media`, `MediaResponse` and `MediaListResponse` schemas and the media methods of `DataAdapter` (`listMedia`, `getMedia`, `uploadMedia`, `updateMedia`, `deleteMedia`). A `media` field references media of a library (its `resource`, optional with a single library): its value is a `MediaReference` (`{ id, label, media, transform }`), and requests send ids or `{ id, transform }`. `lintDefinition()` checks both. The mock backend serves libraries. `MediaField` takes a `resource` and makes media with `create()` and reads them with `get()`; `isMedia()` and `toMedia()` become `toMediaReference()` and `toMediaReferences()`, with `getLibrary()`.
- db1f253: Direct uploads to storage, separate from media (decision 0025). The protocol specifies the `presigned` upload mode: `POST /uploads/sign` signs each request of Uppy 6's S3 client, and `POST /uploads/{upload}/complete` gives an upload (`Upload`), which values reference as `{ "upload": "upl_…" }` (`UploadReference`): a file field, an import, or `POST /media` in JSON to make it a media. `POST /media` in `multipart/form-data` keeps working. A new `file` field type holds files that belong to an item: items give a stored file (`StoredFile`: `name`, `url`, `mime`, `size`), and requests send `{ upload }` to replace it, the stored file to keep it, or `null` to remove it. Media have an optional `status` (`pending`, `processing`, `ready`, `failed`). The mock backend answers the upload routes and stores the uploads that `file` values reference, and the conformance kit checks them (`uploads.sign`). `@panneau/data/uploads` adds `createPresignedUploads()`, without importing Uppy, and `uploadMedia()` takes `{ upload }` as well as a file.
- 3974fb5: `DataAdapter.presignedUploads({ endpoint })` (optional) gives the direct uploads of an adapter: the REST adapter makes them with `createPresignedUploads()`, with its base URL, headers, credentials and errors. The main entry point exports the types of direct uploads (`PresignedUploads`, `PresignedResponse`, `PresignableRequest`). `useOptionalDataAdapter()` of `@panneau/data/query` gives the adapter of `DataAdapterProvider`, or `null` without one.

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
  - @panneau/protocol@5.0.0-alpha.4

## 5.0.0-alpha.3

### Minor Changes

- 3c68628: The pieces of the adapters are exported for an app's own endpoints: `readProblem()` reads the problem of a failed response (`application/problem+json`, Laravel's `{ message, errors }`, or the status), and `@panneau/data/laravel` adds `getLaravelHeaders()` (`X-Requested-With` and the CSRF token from Laravel's cookie) and `createLaravelError()` (`419` as `UnauthorizedError`). The Laravel adapter uses them.

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
  - @panneau/protocol@5.0.0-alpha.3

## 5.0.0-alpha.2

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 3e4f251: Add `@panneau/data`: the `DataAdapter` interface, `createRestAdapter()` with typed errors (`ValidationError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`), `If-Match` from item versions and protocol list queries, the Laravel preset (`@panneau/data/laravel`), and TanStack Query hooks with cache invalidation (`@panneau/data/query`).

### Patch Changes

- de03e3d: Add an example test of a full flow with `@panneau/core`: load the definition, list, edit with validation errors, save and get a version conflict.
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/protocol@5.0.0-alpha.1
