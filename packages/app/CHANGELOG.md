# @panneau/app

## 5.0.0-alpha.18

### Minor Changes

- b200640: The widgets of the dashboard (decision 0064):
  
  - `@panneau/protocol`: the built-in widget types are `stat`, `series` and `list`, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the shapes of their data at `GET /dashboard/widgets/{widget}`, in the schemas and the OpenAPI document (with a `500` for data in the wrong shape). A `stat` or a `list` with `settings.resource` and `settings.query` reads the list of a resource instead. `validateDefinition()` checks the widgets: unique ids, a resource that exists, filters of its list, no `stat` on a list paged with cursors. `checkWidgetData()`, `getWidgetResource()` and the widget constants are in `@panneau/protocol/runtime`. The mock backend answers the widgets with its `widgets` option, and the conformance kit checks the endpoint (`dashboard.widgets`, `dashboard.widgets.resource`, `dashboard.widgets.unknown`).
  - `@panneau/ui`: `Stat`, a number in large type with its label, its help, a tone and a link, and `LineChart`, a line on the chart colors of the theme with its values in a table for assistive technologies. Both draw a skeleton while they load.
  - `@panneau/data`: `useWidgetData()`, `widgetDataQueryOptions()` and `queryKeys.widget()`.
  - `@panneau/core`: `WidgetProps`, the props of the widgets of plugins.
  - `@panneau/intl`: the messages of the widgets, in English and French.
  - `@panneau/app`: the built-in `dashboard` page draws the widgets of `definition.dashboard` in a grid of 12 columns, one column on a phone. Each widget draws a skeleton of its type while it loads, its error with "Try again" when it fails, and nothing on a `403` or on a resource the user can't list, without touching the others. Without widgets, the home page still shows the cards of the resources.
- 19d0892: The image of items in the table, and in media libraries (decision 0061):
  
  - `@panneau/protocol`: the `itemImage` of a resource of kind `media` defaults to the `media` of its items. `getItemImageField(resource)` gives it, or the resource's `itemImage`.
  - `@panneau/lists`: with `itemImage`, the table starts each title with a square thumbnail of the image of its item, loaded lazily, or a placeholder for an item without one, and its skeleton draws their placeholders. `getImageUrl()` gives the URL of a media only when it is an image or has a thumbnail, and the URL of a file only when it is an image that browsers show: a PDF or a HEIC original has no image. `file` values have a display (`FileDisplay`: the name of each file linked to its URL, after the thumbnail of an image or an icon), `image` values are shown as `media` ones, and `MediaDisplay` reads media references (the thumbnail of their `media`, their `label`).
  - `@panneau/app`: a media library offers its gallery and shows its thumbnails without declaring `itemImage`, and so do its items in "Go to…". The panel of a media shows its image over its details.
- 11bcf36: Toasts (decision 0062):
  
  - `@panneau/ui`: toasts show at the bottom, centered, above what sticks to the bottom of the page (`useToastOffset(ref)`), and take the whole width on a phone. `PanneauRoot` takes a `toastPlacement` (`bottom`, `bottom-end`, `top-end`). `show()` takes a `key`: a toast with the key of one already shown replaces it. At most three show at once, the older ones folded behind the newest until the region is hovered or focused. Timeouts follow what a toast holds (`getToastTimeout()`): about 5 seconds, longer for a longer text, about 10 seconds with an action (instead of never), none for an error. A success keeps the neutral look; only warnings and errors color the edge. They appear from below, without motion when the system asks for less.
  - `@panneau/forms`: a form says "Saved" in its footer, next to its button, until its values change, instead of in a toast, and a failed save says so there too, without a toast. `saved` keeps "Saved" when the form starts over from the item it just saved. `showSavedToast` only applies to a form without a footer. The footer raises the toasts above it.
  - `@panneau/actions`: toasts name what an action was done to (the item by its title, or the count of items), one per action and target. No toast when a queued run starts: the runs button shows it, and the toast comes when it ends (not at all when the open list of runs shows it and the result says nothing more).
  - `@panneau/app`: creating an item says what was created in a toast, since the page changes; saving it again says "Saved" in the footer of its form.
- d46a16d: "Undo" instead of a confirmation (decision 0063):
  
  - `@panneau/protocol`: an action declares `undoable: true`, and its result carries `undo`: `{ action, items, params }`, an action of the same resource that undoes the run, the items it changed, and its parameters. `UNDO_LIMIT` (100): above it, the client confirms, and the result has no `undo`. The built-in `restore` undoes the `delete` of a resource with a trash. In the JSON Schema, the OpenAPI spec and `docs/protocol.md`. The mock backend keeps a trash for a resource whose `delete` is undoable, answers its `undo`, and runs `restore`; the conformance kit runs the undo of a result and checks that the item is back (`action.undo`).
  - `@panneau/core`: `asksConfirmation(action, count)`: an undoable action asks first only above the limit, or when it is queued, unless it sets `confirm`. A declared `delete` that is undoable doesn't take the built-in confirmation.
  - `@panneau/actions`: the toast of a result with an `undo` has "Undo", which runs it, refreshes, and says it was undone.
  - `@panneau/lists`: undoable actions run without a confirmation up to the limit; a value changed in place says so in a toast whose "Undo" saves the previous value the same way.
  - `@panneau/app`: the item header runs undoable actions without a confirmation.

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [93223bd]
- Updated dependencies [19d0892]
- Updated dependencies [11bcf36]
- Updated dependencies [aae4bf7]
- Updated dependencies [d46a16d]
  - @panneau/protocol@5.0.0-alpha.18
  - @panneau/ui@5.0.0-alpha.18
  - @panneau/data@5.0.0-alpha.18
  - @panneau/core@5.0.0-alpha.18
  - @panneau/intl@5.0.0-alpha.18
  - @panneau/forms@5.0.0-alpha.18
  - @panneau/lists@5.0.0-alpha.18
  - @panneau/actions@5.0.0-alpha.18
  - @panneau/fields@5.0.0-alpha.18

## 5.0.0-alpha.17

### Minor Changes

- 0cf20b0: Row actions are icons in their colors, as in Panneau 4, the same in every list (decision 0060): `show` blue (`info`), `edit` in the main color, `delete` red, with their labels as names and tooltips. The main action, the one the title opens, keeps its label while the row has room (`primaryAction` of `ListView`; the app sets it from `open`). `duplicate`, `delete` and the actions placed in `menu` are icons too: the `•••` menu only takes the last actions when the icons don't fit (many actions, a narrow list, a phone), and never a single one. The list measures the room it has, chooses the same layout for every row, and keeps the place of the actions a row doesn't have, so they line up. `delete` keeps its confirmation.

### Patch Changes

- Updated dependencies [2a1f32d]
- Updated dependencies [0cf20b0]
  - @panneau/fields@5.0.0-alpha.17
  - @panneau/lists@5.0.0-alpha.17
  - @panneau/forms@5.0.0-alpha.17
  - @panneau/actions@5.0.0-alpha.17
  - @panneau/core@5.0.0-alpha.17
  - @panneau/data@5.0.0-alpha.17
  - @panneau/intl@5.0.0-alpha.17
  - @panneau/protocol@5.0.0-alpha.17
  - @panneau/ui@5.0.0-alpha.17

## 5.0.0-alpha.16

### Patch Changes

- Updated dependencies [f41f26f]
- Updated dependencies [9278b2c]
- Updated dependencies [8281dc0]
- Updated dependencies [cd47332]
- Updated dependencies [3522797]
- Updated dependencies [f41f26f]
  - @panneau/protocol@5.0.0-alpha.16
  - @panneau/fields@5.0.0-alpha.16
  - @panneau/lists@5.0.0-alpha.16
  - @panneau/forms@5.0.0-alpha.16
  - @panneau/intl@5.0.0-alpha.16
  - @panneau/core@5.0.0-alpha.16
  - @panneau/ui@5.0.0-alpha.16
  - @panneau/actions@5.0.0-alpha.16
  - @panneau/data@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- 658b3d3: The account page (decision 0050).
  
  - `@panneau/protocol`: `auth.account`, `PATCH /account` with the name and the email, `PUT /account/password` with the current password; the account of the mock backend (a new email is verified again with `auth.emailVerification`), and the `account` conformance check.
  - `@panneau/data`: optional `getAccount()`, `updateAccount()` and `updatePassword()`, and the `account` and `twoFactor` query keys.
  - `@panneau/app`: with `auth.account`, the user's name in the sidebar links to `{basePath}/account`, a page with their name and email, their password, and their two-factor authentication (set up, new recovery codes, turned off unless it is required).
  - `@panneau/intl`: its messages, in English and French.
- 97456b6: OAuth providers on the login page (decision 0052).
  
  - `@panneau/protocol`: `AUTH_ERROR_PARAM` and `AUTH_ERROR_CODES`, the `next` of `GET /auth/providers/{provider}/redirect`, the providers of the mock backend (`providerUsers`: a provider logs in at once), and the `auth.providers` conformance check, which doesn't follow the redirection.
  - `@panneau/app`: the link of a provider adds `next`, the page to come back to; the login page says why a login with a provider failed (`authError`), and the address loses it.
  - `@panneau/intl`: their messages, in English and French.
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
  - @panneau/data@5.0.0-alpha.15
  - @panneau/intl@5.0.0-alpha.15
  - @panneau/actions@5.0.0-alpha.15
  - @panneau/core@5.0.0-alpha.15
  - @panneau/fields@5.0.0-alpha.15
  - @panneau/forms@5.0.0-alpha.15
  - @panneau/lists@5.0.0-alpha.15
  - @panneau/ui@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- Updated dependencies [4f141f9]
- Updated dependencies [4f141f9]
  - @panneau/ui@5.0.0-alpha.14
  - @panneau/actions@5.0.0-alpha.14
  - @panneau/fields@5.0.0-alpha.14
  - @panneau/forms@5.0.0-alpha.14
  - @panneau/lists@5.0.0-alpha.14
  - @panneau/core@5.0.0-alpha.14
  - @panneau/data@5.0.0-alpha.14
  - @panneau/intl@5.0.0-alpha.14
  - @panneau/protocol@5.0.0-alpha.14

## 5.0.0-alpha.13

### Patch Changes

- f3036ed: The rest of the UI follows the abilities of the current user (decision 0046): pages and fields have abilities, menus leave out what the user can't reach, and a route reached without the ability shows a forbidden state.
  
  - `@panneau/protocol`: `abilities` on a page (`{ "view": false }`) and on a field (`{ "view": false }`, `{ "update": false }`), where only `false` restricts. The JSON Schema and the OpenAPI document follow. The mock backend reads the abilities of resources (`403` on lists without `viewAny`, on creates without `create`), of items (`403` without `view`, `update` or `delete`), and of fields (items leave out the values of hidden fields, writes ignore those of fields the user can't see or update); an item of `items` can give its own `abilities`. The conformance kit checks that resources without `viewAny` answer `403` on their list, that items leave out hidden fields, that a dry run of `delete` skips an item without `delete` and, with `writes`, that an empty create of a resource without `create` and an empty update of an item without `update` answer `403`.
  - `@panneau/core`: `canViewField()`, `canUpdateField()`, `getVisibleFields()` and `canViewPage()`. `resolveFields()` and `resolveForm()` leave out the fields the user can't see, and make those they can't edit read-only. `resolveList()` leaves the fields the user can't see out of columns and sorts, and those they can't edit out of `inlineEdit`.
  - `@panneau/fields`: a field with `abilities.update: false` is read-only.
  - `@panneau/intl`: the message of an item the user can't view (`itemForbidden`).
  - `@panneau/app`: the forbidden error page (`ErrorPage` with `kind="forbidden"`) also shows on the create route of a resource without `create`, and on a page with `view: false`. The item panel says when the user can't view the item, without "Retry". The edit route of an item without `update: true` goes to its panel. `pages.home` with `view: false` shows the built-in home. Menus leave out the pages the user can't open, and the separators left at their start, at their end or next to another one. Lists, panels and forms leave out the fields the user can't see.
- 7a5a38e: A current context, picked in the app and sent with every request (#182, [decision 0045](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0045-current-context.md)).
  
  - `@panneau/protocol`: the definition's `context.params` (`ContextParam`, `ContextOption`, `DefinitionContext`): a name, a label, `required`, `fixed` (a value the backend sets from the request, such as the client of its domain), `allLabel`, inline `options`, and the `value` and `valueLabel` it was built for. The `Panneau-Context` header (`CONTEXT_HEADER`, `formatContextHeader()`, `parseContextHeader()`, `contextBefore()`), the `403` problem of type `urn:panneau:problem:context` with its `param` (`CONTEXT_PROBLEM_TYPE`), `GET /context/{param}/options` (`ContextOptionsResponse`) and `RESERVED_ROUTE_SEGMENTS`, in the schemas and the OpenAPI document, where every operation takes the header and can answer the `403`. The mock backend takes `context` (the choices of each param, and the items of each resource in the context), and the conformance kit checks a backend with a context, with `context` to send values with every request.
  - `@panneau/data`: `DataAdapter.withContext(values)`, an adapter that sends `Panneau-Context`, and `getContextOptions(name, { q })`, both optional. The REST and Laravel adapters have them.
  - `@panneau/app`: the values of the context are a prefix of the routes (`{basePath}/client/4/contest/12/…`) and every request sends them. The sidebar has a field per param (a button with a popover in the rail of icons), with its choices inline or searched; picking other values loads the app for them. While a required param has no value, every route asks for it. A fixed param shows its value without a field, and stays out of the path and of the header. Values the backend chose go to the path, and a value the user can't use takes the app to the path without it. New classes: `panneau-context-picker-*` and `panneau-context-page-*`.
  - `@panneau/intl`: the messages of the picker and of the page that asks for a value, in English and in French.
- 1e19478: Gallery and calendar layouts for lists ([decision 0044](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0044-gallery-and-calendar.md)).
  
  - `@panneau/protocol`: a list has `calendar` (`ListCalendar`: `field`, `filter`, `perPage`), in the JSON Schema and its types. `lintDefinition()` checks that its field is a `date` or a `datetime`, and that the list has its `date-range` filter.
  - `@panneau/core`: `resolveList()` resolves `calendar` (`ResolvedCalendar`, or `null`; `DEFAULT_CALENDAR_PER_PAGE`). In the `calendar` layout of a list with a calendar, the list state's `query` is the month's: the list's query with its `date-range` filter set to the days around the month, `perPage` from the calendar, and no page or cursor. The view has `month`, in the URL (`month=2026-11`) when it isn't the current month, with `setMonth()`, and it isn't remembered. `ListDefaults` takes `calendar`. `currentMonth()`, `shiftMonth()`, `isMonth()` and `getCalendarRange()` are exported.
  - `@panneau/lists`: `GalleryLayout` (the image of each item, its title, checkbox and actions) and `CalendarLayout` (the weeks of a month from the first day of the week of the locale, with the previous, next and current month; on narrow lists, the days that have items) are built in and exported. `ListView` takes `itemImage` and `calendar`, and leaves out the gallery without the first and the calendar without the second. In the calendar, the list's filter of the calendar is hidden, there is no pagination, and a notice says when the month has more items than the list got. `ListLayoutProps` has `getItemImage` and `calendar` (`ListCalendarProps`). `getImageUrl()` reads the URL of a media reference, a file or a URL. `List` takes the calendar too.
  - `@panneau/intl`: messages of the gallery and the calendar, in English and French.
  - `@panneau/app`: a list offers the layouts its definition declares, or the table and the cards when it declares none, with the image of the resource's items and its calendar.
- 24c4fa6: Lists edit fields in place, one field at a time ([decision 0043](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0043-inline-editing.md)).
  
  - `@panneau/protocol`: a partial update reads the conditions (`visibleWhen`) and the rules that name other fields with the item's values for the fields it doesn't send: `checkValues()` takes `item`, and the mock backend passes it. A field shown when `status` is `published`, sent alone, is checked on a published item. The conformance kit checks, with `writes`, that a `PATCH` with a single field and `If-Match` changes that field alone (`update.single-field`).
  - `@panneau/lists`: a column whose field is in `inlineEdit` edits it in place in the table, for `text`, `number`, `select`, `boolean` and `date` fields, on items whose abilities allow `update`. A boolean is a checkbox; the others show a button that turns the cell into the field's control: Enter or leaving the cell saves, Escape cancels, a select or a date saves when picked. The value is checked by the field's portable rules, then saved through `onInlineEdit` (`ListInlineEditHandler`, `ListInlineEditEvent`), which resolves with the updated item. A `422` shows its messages on the cell, and a `412` shows the value someone else saved, with "Keep theirs" and "Save mine". `formatError` gives the messages of the rules. `ListLayoutProps` has `renderCell(item, column, content)`, which the table uses for its cells.
  - `@panneau/data`: `useUpdateItem()` puts the updated item in the cached lists of its resource that show it, before refetching them.
  - `@panneau/intl`: messages of inline editing, in English and French.
  - `@panneau/app`: the list of a resource edits its `inlineEdit` fields in place, and saves them with the item's version.
- 47b7556: Users choose the columns of a list, and lists remember their view ([decision 0042](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0042-list-view-columns-and-remembered-view.md)).
  
  - `@panneau/protocol`: a column has `hidden` (not shown until the user shows it) and `hideable` (`false`: always shown), in the JSON Schema and its types.
  - `@panneau/core`: `resolveList()` resolves `hidden` and `hideable` on each column. The list state has a `view`, the layout and the ids of the columns shown, with `setLayout()`, `setColumns()` and `resetColumns()`, kept in the URL (`layout`, `columns`) when it isn't the default, and never sent to the backend. With `remember: { key, store? }`, `createList()` and `useList()` remember the filters, sort, page size, layout and columns the user changes, and restore them when the URL has no parameter of the list: they then write them to the URL, in place of its entry. A URL with any parameter of the list opens as it is, and isn't remembered until the user changes something. `createStorageViewStore()` keeps views in `localStorage` (the default store); `ListViewStore`, `ListViewState` and `RememberedView` are exported. `ListDefaults` takes `layout` and `columns`.
  - `@panneau/lists`: a "Columns" menu in the toolbar shows, hides and orders the columns, with buttons to move them and "Reset columns". Columns with `hidden` are left out until the user shows them; those with `hideable: false` can't be hidden. `ListView` reads its layout and its columns from the view of the list state: `columns` is every column of the list, and `columnChoice={false}` leaves the menu out. Its `layout` prop still controls the layout.
  - `@panneau/intl`: messages of the column menu, in English and French.
  - `@panneau/app`: each list of a resource remembers its view for the user, in the browser.
- 5002faa: The shell has a notification area for queued action runs (#180).
  
  - `@panneau/app`: while the action runner follows runs, the sidebar has an "Actions" button, with the count of the runs in progress (an icon with a badge in the rail of icons and in the top bar of small screens). It opens a popover with their status and progress (`ActionRuns`), on every page, so runs stay in sight after the user leaves the list that started them. The list of runs at the top of the page is gone. New classes: `panneau-action-runs-button-*`. `panneau-app-layout-top-bar-search` is replaced by `panneau-app-layout-top-bar-end`, around the buttons at the end of the top bar.
  - `@panneau/intl`: `appMessages.actionRuns` and `appMessages.actionRunsLabel`, in English and in French.
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
- Updated dependencies [5002faa]
- Updated dependencies [bdd0a17]
  - @panneau/protocol@5.0.0-alpha.13
  - @panneau/core@5.0.0-alpha.13
  - @panneau/fields@5.0.0-alpha.13
  - @panneau/intl@5.0.0-alpha.13
  - @panneau/lists@5.0.0-alpha.13
  - @panneau/ui@5.0.0-alpha.13
  - @panneau/data@5.0.0-alpha.13
  - @panneau/actions@5.0.0-alpha.13
  - @panneau/forms@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- b600b94: The panel of an item shows the values of its groups ([decision 0041](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0041-groups-in-item-details.md)).
  
  - `@panneau/lists`: `ItemDetails` takes groups: a column with `columns` (`ItemDetailsColumn`, exported) lists the values of its fields under its label, indented, read in the value of the column. While the item loads, each of them has its skeleton. New classes: `panneau-item-details-group` and `panneau-item-details-nested`.
  - `@panneau/app`: the panel of an item shows its `group` fields, with their nested fields, instead of leaving them out. Repeaters stay in the form only.
- 0a8447e: Localized fields show one locale at a time, as in Panneau 4, and forms use the width they have.
  
  - `@panneau/fields`: a localized field shows the input of one locale under its label, with a switch of the locales (`FR`, `EN`) at the end of the label's line. The switch marks a locale in error with a red dot, and an empty locale with an amber dot when the field is required, or with `+` when it isn't: a translation to add. The first locale shows first; every input stays mounted. `LocalizedField` takes `locale` and `onLocaleChange` to control the locale shown, and `invalidLocales`. The input of a locale has no visible label: `label` of `LocalizedInputProps` is meant for its `aria-label`. Field entries take `hideLabel` (also on `NestedField`), which `getFieldProps()` turns into an `aria-label`, and `invalidPaths`, the paths in error inside the field, which a binding gives to fields that show their nested fields. The fields of a group flow in columns of at least 14rem: short fields share a row, and wide ones take a row of their own. `isWideField()` tells them apart: text areas, groups, repeaters, localized fields, several values, radios and checkboxes, and the types of plugins are wide. `RevealContext`, `createRevealRegistry()` and `useRevealer()` let fields that hide some of their own show the path a form reveals.
  - `@panneau/forms`: the fields that a layout doesn't place, which is every field of a form without a layout, flow in columns of at least 16rem after the layout, and in the form's skeleton too. `Form` gives `FormView` its layout as given. When it focuses the field of an error, a form first shows its locale, as it opens its tab or section. The errors of a localized field are listed, and the first one focused, in the order of the form's locales, not alphabetically. Its reveal registry is the one of `@panneau/fields`.
  - `@panneau/ui`: `Fieldset` takes `legendEnd`, controls at the end of the legend's line. The group is then named by the legend through `aria-labelledby`.
  - `@panneau/app`: the form of an item takes the width of a list (80rem) when its layout has a sidebar.
  - `@panneau/intl`: messages of the locale switch, in English and French.
  
  The `panneau-localized-field-locales` class is removed: the locales of a localized field are in a `panneau-fieldset`.
- Updated dependencies [b600b94]
- Updated dependencies [0a8447e]
  - @panneau/lists@5.0.0-alpha.12
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/fields@5.0.0-alpha.12
  - @panneau/forms@5.0.0-alpha.12
  - @panneau/actions@5.0.0-alpha.12
  - @panneau/core@5.0.0-alpha.12
  - @panneau/data@5.0.0-alpha.12
  - @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- 84bab2b: The links of an item's actions look like the buttons beside them, in rows and in the header of the item's panel and form, with room between them.
  
  - `@panneau/ui`: `LinkButton` is a link with the look of a `Button`: the same tones, appearances, sizes, hover and pressed backgrounds and focus ring. It goes through React Aria, so an app's router handles it. With `external`, it opens in a new tab, without access to the admin. `ButtonStyleProps` are the props of that look (tone, appearance, variant, size, icons, full width), shared by both.
  - `@panneau/lists`: the links of a row (`show`, `edit`, and other `link` actions) are `LinkButton`s, ghost and small like the other actions of the row, so their hover background is the one of the `…` menu button, on the same box. A destructive link is `danger`, like a destructive button. A link that leaves the admin (`http://`, `https://`) opens in a new tab. The actions of a row are `--panneau-space-2` apart, up from `--panneau-space-1`, and wrap on several lines in a narrow list or a card rather than overflow it; in a wide table they stay on one line. A link of the toolbar is outlined like the buttons beside it.
  - `@panneau/app`: the links in the header of an item's panel and form are `LinkButton`s, outlined like the buttons beside them, and `danger` when destructive. The `LinkButton` of `@panneau/app` renders the primary `LinkButton` of `@panneau/ui`, and is deprecated: use that one with `variant="primary"`, as the create link of lists, the link home of the not found page and the sign-in providers now do.
  
  Four public classes are removed, as these links have the classes of a button (`panneau-button`): `panneau-actions-link`, `panneau-actions-link-md`, `panneau-pages-action-link` and `panneau-pages-link-button`.
- Updated dependencies [84bab2b]
  - @panneau/ui@5.0.0-alpha.11
  - @panneau/lists@5.0.0-alpha.11
  - @panneau/actions@5.0.0-alpha.11
  - @panneau/fields@5.0.0-alpha.11
  - @panneau/forms@5.0.0-alpha.11
  - @panneau/core@5.0.0-alpha.11
  - @panneau/data@5.0.0-alpha.11
  - @panneau/intl@5.0.0-alpha.11
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
  - @panneau/core@5.0.0-alpha.10
  - @panneau/fields@5.0.0-alpha.10
  - @panneau/forms@5.0.0-alpha.10
  - @panneau/intl@5.0.0-alpha.10
  - @panneau/lists@5.0.0-alpha.10
  - @panneau/data@5.0.0-alpha.10
  - @panneau/actions@5.0.0-alpha.10
  - @panneau/ui@5.0.0-alpha.10

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
