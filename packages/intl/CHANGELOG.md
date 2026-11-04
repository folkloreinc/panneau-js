# @panneau/intl

## 5.0.0-alpha.16

### Minor Changes

- f41f26f: Addresses and links ([decisions 0054](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0054-addresses.md) and [0055](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0055-links.md)).
  
  - **`address`:** a new built-in type, the parts of a postal address, `{ street, unit, city, region, postalCode, country }`, with a `point` when `settings.point` is on. `AddressField` (`@panneau/fields/address`) shows the country first, which sets the labels (_Province_, _State_, _ZIP code_), the order and the regions of the other parts, normalizes the postal code of Canada and the United States when it loses focus (`H2X 1Y4`), fills every part with a place found by the address search of the `FieldsProvider`'s maps, and places the address on a map with `point`. Settings: `country`, `countries`, `preferred`, `required` (the parts a filled address must have, `street`, `city` and `country` by default) and `point`. Lists show the address on one line, with the flag of its country.
  - **`link`:** a new built-in type, `{ type, url, page, file, label, newTab }`, to a URL, a page (an item of the field's `resource`, searched in each of them), an email address (`mailto:`), a phone number (`tel:`), a media (with the media plugin), or a type that the site adds in `settings.types`, with a label per locale and a new tab chosen, set by the type (`newTab: external`) or never. `LinkField` is in `@panneau/fields/link`. Lists show the label, linked to the URL.
  - **The `postalCode` rule** is a new portable rule: a postal code of its country, given as a code or another field (`{ "field": "country" }`), for Canada and the United States. `normalizePostalCode()` and `isPostalCode()` are in `@panneau/protocol`, with `getLinkTypes()` and `resolveLinkNewTab()`.
  - `checkValues()` checks the parts of addresses and links, and keys their failures by the path of each part (`venue.postalCode`, `cta.url`); forms show them under the input of the part. The schemas `AddressValue`, `LinkValue`, `AddressSettings` and `LinkSettings` describe them, and `validateDefinition()` checks the settings.
  - The conformance kit checks that a backend refuses an invalid postal code or link at the path of the part (`update.parts`), on a resource with an `address` or a `link` field.
  - `GeocodingResult` has the parts of an `address`, which `createNominatimSource()` now asks for.
- 9278b2c: Several countries, the providers of an embed, and color palettes ([decision 0058](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0058-multiple-countries-embed-providers-color-palettes.md)).
  
  - **`country` with `multiple`:** the value is an array of distinct ISO codes, in the order they were chosen. `CountryField` takes `multiple`: the chosen countries show with their flags and names, each with a button that removes it, and the combo box adds one, leaving out those already chosen. `min` and `max` count the countries. Lists show the flags and the names.
  - **The `providers` rule:** a new portable rule, `{ "rule": "providers", "value": ["YouTube", "Vimeo"] }`, that checks the `provider` of an `embed` value without case (a value without one is left to the backend). `EmbedField` takes `providers`: it names them under its help, and refuses an embed of another provider as soon as its preview comes back. Forms name the providers in the rule's message, in English and French.
  - **`color` with a palette:** `settings.palette`, `[{ value, label, color }]`, the colors to pick from. `ColorField` takes `palette`: a select of its colors with their swatches, that can be emptied unless the field is required. `getColorPalette()` and `getSwatchColor()` of `@panneau/fields/color` read it. Lists show the swatch and the label of a palette's color.
  - No codemod is needed: v4 fields had none of these options. A project with a taxonomy of countries, its own embed rule or a `select` of color names migrates its data or its definitions by hand.
- 8281dc0: Date ranges and money ([decision 0053](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0053-date-ranges-and-money.md)).
  
  - **`daterange`:** a new built-in type, `{ start, end }`: days (`2026-11-04`, both inclusive), or date-times with `settings.time`, written in UTC. `settings.allDay` adds an "All day" switch, whose values have days as bounds and `allDay: true`; `settings.open` (`start`, `end` or `both`) lets a bound be `null`; `settings.timeZone` is the zone date-times are shown and typed in, and `settings.chooseTimeZone` keeps a zone the user picks in the value (`timeZone`). `DateRangeField` (`@panneau/fields/daterange`) edits both bounds in one control, with one calendar. Lists show the range in the locale's format (`Nov 4 – 6, 2026`, `From Nov 4, 2026`), sort it by its start, and the calendar layout shows an item on each day of its range.
  - **`money`:** a new built-in type, `{ amount, currency }`, the amount an integer in the minor unit of an ISO 4217 currency. `settings.currency` fixes the currency, `settings.currencies` lists those to pick from. `MoneyField` (`@panneau/fields/money`) types the amount in the currency format of the locale, without floating point errors. Lists show it in that format. `min` and `max` apply to the amount, and forms show them as amounts (`This amount must be at least $1.00.`).
  - `@panneau/protocol`: the `daterange` and `money` portable rules, implied by their types; `DateRangeValue`, `MoneyValue`, `DateRangeSettings` and `MoneySettings`, which `validateDefinition()` checks; `CURRENCY_CODES`, `getCurrencyDigits()`, `toMinorUnits()` and `fromMinorUnits()`. `matchesFilterRange()` and the mock backend keep the date ranges that overlap a `date-range` filter. `lintDefinition()` accepts a `daterange` as the field of a calendar. The conformance kit checks, with `writes`, that a backend refuses a reversed range and an amount in major units (`create.implied-rules`).
  - `@panneau/ui`: `DateRangePicker`, whose bounds can each stay empty.
- cd47332: `duration` values in a declared unit, with days ([decision 0056](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0056-duration-units.md)).
  
  - **`settings.unit`** is the unit of a `duration` value: `seconds` (the default, as before), `minutes`, `hours` or `days`. The value stays a whole number in that unit, and so do the `min` and `max` rules. A day is 24 hours.
  - **`settings.precision`** takes the four units, as the smallest part the input shows. It defaults to the unit, and a precision finer than the unit is raised to it.
  - **`settings.largestUnit`** is the largest part the input shows: `hours` by default (or the precision when it is larger), or `days`. The largest part has no upper bound; hours stop at 23 below days.
  - `DurationField` takes `unit`, `precision` and `largestUnit`. `formatDuration()` and `splitDuration()` take them as options (their former calls work as before), and `formatDuration()` takes the `labels` of the units. New helpers: `resolveDurationUnits()`, `getDurationUnits()`, `isDurationUnit()`.
  - Lists show the days, in the unit and to the precision of the field: `2 d 4 h` (`2 j 4 h` in French).
  - `@panneau/protocol`: `DURATION_UNITS` and the `DurationSettings` schema, which `validateDefinition()` checks.
  - `@panneau/intl`: the messages of days.
  - Definitions without these settings behave as before. No codemod or Rector rule is needed: v4 had no duration field, and sites that keep minutes in a `number` field switch its type to `duration` and set `unit: minutes`, without touching their data.
- 3522797: Phone extensions ([decision 0057](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0057-phone-extensions.md)).
  
  - **`tel` values can have an extension**, after `;ext=` as in a `tel:` URI: `+15145550199;ext=123`. A number without an extension doesn't change.
  - `@panneau/protocol`: the `tel` rule takes `extension: true`, which accepts 1 to 10 digits after `;ext=`; without it, a value with an extension fails. The `tel` type implies `{ rule: 'tel', extension: true }` when `settings.extension` is `true`.
  - `@panneau/fields`: `TelField` takes `extension` (`settings.extension`), an input for the digits of the extension after the number. An extension typed or pasted after the number (`ext. 123`, `x123`, `poste 123`) moves to that input when the field is left. `@panneau/fields/tel` exports `splitExtension()`, `joinExtension()`, `readExtension()` and `MAX_EXTENSION_LENGTH`.
  - `@panneau/lists`: the `tel` display shows the extension, `+1 514 555 0199, ext. 123`, linked with `tel:+15145550199;ext=123`, when the field allows one.
  - `@panneau/intl`: their messages, in English and French.
  - `@panneau/codemods`: `TelField` takes `extension`.
  - No codemod or Rector rule: a v4 `telephone` field had no extension, and an extension kept in a separate field is merged into the number by a data conversion (`panneau:convert-phones` of `laravel-panneau`), not by rewriting code.

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

## 5.0.0-alpha.14

No changes in this release.

## 5.0.0-alpha.13

### Minor Changes

- b07c7ab: Countries, regions and phone numbers ([decision 0047](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0047-countries-regions-and-phone-numbers.md)).
  
  - **`country`:** a new built-in type, an ISO 3166-1 alpha-2 code (`CA`). `CountryField` (`@panneau/fields/country`) picks it by name in the user's locale, with its flag; `settings.countries` limits the choices and `settings.preferred` puts some first. Lists show the flag and the name.
  - **`region`:** a new built-in type, a state, a province or a territory of the country in the field that `from` names, or of `settings.country`. `RegionField` (`@panneau/fields/region`) picks among the regions of Argentina, Australia, Brazil, Canada, China, India, Japan, Mexico and the United States, named in English or French, and gives the code without the country (`QC`); for other countries, it is a text. Lists show the name.
  - **`tel` values are now E.164** (`+15145550199`). **Breaking:** the new `tel` rule, implied by the type, refuses numbers kept as typed. `TelField` shows the country of the number, its flag and its calling code in a menu at the start of the input, formats the number as it is typed, follows a number typed with its calling code, and turns a number as typed into E.164 when the field is left. `settings.country` (`country`) is the country of a new number. Lists show the flag and the international format.
  - `@panneau/ui`: options of `Select` and items of `ComboBox` take a decorative `prefix`; `ComboBox` takes a `prefix` before its input; `Select` takes `renderValue` and `appearance="bare"`, to sit inside another control.
  - `@panneau/fields` depends on `libphonenumber-js`.
  - `@panneau/ui`: a `TextInput` with a prefix or a suffix, and a `ComboBox`, now look read-only when they are (`isReadOnly`); a read-only `ComboBox` has no button to show its options.

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

## 5.0.0-alpha.12

### Patch Changes

- 0a8447e: Localized fields show one locale at a time, as in Panneau 4, and forms use the width they have.
  
  - `@panneau/fields`: a localized field shows the input of one locale under its label, with a switch of the locales (`FR`, `EN`) at the end of the label's line. The switch marks a locale in error with a red dot, and an empty locale with an amber dot when the field is required, or with `+` when it isn't: a translation to add. The first locale shows first; every input stays mounted. `LocalizedField` takes `locale` and `onLocaleChange` to control the locale shown, and `invalidLocales`. The input of a locale has no visible label: `label` of `LocalizedInputProps` is meant for its `aria-label`. Field entries take `hideLabel` (also on `NestedField`), which `getFieldProps()` turns into an `aria-label`, and `invalidPaths`, the paths in error inside the field, which a binding gives to fields that show their nested fields. The fields of a group flow in columns of at least 14rem: short fields share a row, and wide ones take a row of their own. `isWideField()` tells them apart: text areas, groups, repeaters, localized fields, several values, radios and checkboxes, and the types of plugins are wide. `RevealContext`, `createRevealRegistry()` and `useRevealer()` let fields that hide some of their own show the path a form reveals.
  - `@panneau/forms`: the fields that a layout doesn't place, which is every field of a form without a layout, flow in columns of at least 16rem after the layout, and in the form's skeleton too. `Form` gives `FormView` its layout as given. When it focuses the field of an error, a form first shows its locale, as it opens its tab or section. The errors of a localized field are listed, and the first one focused, in the order of the form's locales, not alphabetically. Its reveal registry is the one of `@panneau/fields`.
  - `@panneau/ui`: `Fieldset` takes `legendEnd`, controls at the end of the legend's line. The group is then named by the legend through `aria-labelledby`.
  - `@panneau/app`: the form of an item takes the width of a list (80rem) when its layout has a sidebar.
  - `@panneau/intl`: messages of the locale switch, in English and French.
  
  The `panneau-localized-field-locales` class is removed: the locales of a localized field are in a `panneau-fieldset`.

## 5.0.0-alpha.11

No changes in this release.

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

## 5.0.0-alpha.9

### Minor Changes

- ca1aa46: Secret text fields, and options with a tone.
  
  - `text` fields with `"settings": { "secret": true }` hold a secret, such as an access key: the field types it in a password input, with a button that shows it, and keeps the browser from filling it in (`autocomplete="new-password"`). Lists and item details show it as dots. `TextField` takes `secret`.
  - The options of `select` fields take a `tone` (`{ "value": "failed", "label": "Failed", "tone": "danger" }`): a built-in tone or one of the theme. The `select` display of lists and item details shows each option as a badge in its tone.

## 5.0.0-alpha.8

### Minor Changes

- 477d974: The app has a login page in `panneau` auth mode, a login with a token, and a logout (decision 0037).
  
  - `@panneau/app`: in `panneau` mode, the app shows its login page when the API answers `401`, at the URL the user was on, then that page once logged in. It offers an email and a password, a token when the auth settings have `token`, and a link for each OAuth provider. The sidebar has a "Log out" button: in `panneau` mode it calls `adapter.logout()`, forgets what it loaded for the user and shows the login page; in `external` mode it goes to `auth.logoutUrl`, and isn't there without it.
  - `@panneau/protocol`: `auth.token` (`{ label?, help? }`), a login with a single secret sent as `{ "token" }` to `POST /auth/login`, whose body in `openapi.json` is now one of the two shapes. `auth.logoutUrl`, the site's logout in `external` mode. The boot config takes `auth`, for the login page before the definition is loaded.
  - `@panneau/data`: `LoginCredentials` is `PasswordCredentials | TokenCredentials`. Adapters that implement `login()` take either one: an adapter that read `credentials.email` checks which it got first.
  - `@panneau/intl`: the messages of the login page and of the logout, in English and French.

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.

## 5.0.0-alpha.7

### Minor Changes

- 060e0de: Add `@panneau/editor` (#128, decision 0007): the `richtext` field, on TipTap 3, which stores HTML. `editorPlugin` provides the field type; `createEditorPlugin({ extensions, buttons })` adds the TipTap extensions of a project (an inline logo) and the toolbar buttons that insert them.
  
  - The definition sets the toolbar, the heading levels, block styles (a named class on an element: `<p class="big">`) and which links open in a new tab, in `settings`. `@panneau/protocol` describes them with `RichTextSettings` and `RichTextStyle`, and `validateDefinition()` checks them.
  - HTML written by CKEditor 4 and 5 loads as it was written, and the field gives nothing back until the text is edited. Once edited, it renders the same: the field keeps every heading level, the attributes and classes of blocks and marks, `<b>` and `<i>`, bare list items, and the HTML it doesn't edit (media embeds, iframes, tables, social posts), shown in the editor without rendering it.
  - Nothing that would run a script reaches the admin (decision 0035): HTML the field doesn't edit is shown inert, and the elements it renders lose their event handlers and `javascript:` URLs.
  - Pasted content brings its text, structure, links and marks, not the styles and wrappers of its page (Google Docs, web pages); only content copied from a rich text field of the same page pastes in full.
  - `normalizeRichText()` gives the HTML the field would save for existing content, to check it before a migration.
  - `@panneau/intl` has the messages of the editor, in English and French (`editorMessages`).
- fb534de: Skeletons instead of spinners while content loads (#121, decision 0034), drawn by the components themselves, so a product that uses them without the app gets them too:
  
  - `ListView`: while `items` is `undefined`, rows of its columns in its layout, as many as the page size, up to 10.
  - `ItemDetails`: `item` can be `undefined` while it loads, for the labels with a skeleton of each value.
  - `Form` and `FormView`: `isLoading` draws the layout of the form, and for each field its label and a block of its height, from its type. The app's edit page uses it while the item loads.
  - The media picker draws its cards with `Skeleton`, and its own skeleton CSS is gone.
  - The app: the item panel draws its title, actions and details, the preview a block in its frame, and the boot the shell with its sidebar and a page header, instead of a centered spinner.
  - New messages, in English and French: `lists.loading`, `lists.loadingItem`, `forms.loading`, `app.previewLoading`.

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
- 48676ff: A media says why its processing failed (#84): the `media` block of a library item gets an optional `error`, `{ code, message }`, when its `status` is `failed`. The `media` and `image` fields show the message under "Processing failed", and the media picker gives it as the reason a media can't be picked (`statusFailedBecause`, in English and French).
- 75a6496: Five more field types ([decision 0033](../docs/decisions/0033-more-field-types.md)):
  
  - **`tel`:** a phone number, as typed, with the phone keyboard. Lists link it with `tel:`.
  - **`range`:** a number on a slider, between the `min` and `max` rules (0 and 100 without them), with `step`, `decimals` and `suffix`. It is `null` until the slider is moved.
  - **`duration`:** a number of seconds, typed in hours, minutes and seconds; `settings.precision` hides the seconds. Lists show it with its units: `1 h 5 min 30 s`.
  - **`json`:** an object or an array, edited as JSON text. Text that doesn't parse stays a string, which the new `json` portable rule refuses: the `json` type implies it, so a form can't be saved with it.
  - **`tags`:** a list of strings, typed or among `options`. `settings.allowCustom: false` allows only the options. Lists show them as badges.
  
  And:
  
  - **`@panneau/protocol`:** the five types in `BUILT_IN_FIELD_TYPES`, and the `json` rule in `PORTABLE_RULES` and `checkRules()`.
  - **`@panneau/ui`:** `Slider`, and `TagsInput`, whose tags are added with Enter, a comma or a paste, and removed with Backspace or their button.
  - **`@panneau/fields`:** `TelField`, `RangeField`, `DurationField` (with `formatDuration()`), `JsonField` (with `parseJson()`) and `TagsField`, at `@panneau/fields/tel`, `/range`, `/duration`, `/json` and `/tags`.
  - **`@panneau/lists`:** `TelDisplay`, `DurationDisplay`, `JsonDisplay` and `TagsDisplay`; `range` shows as a number.
  - **`@panneau/core`:** the message of the `json` rule.
  - **`@panneau/intl`:** the messages of the new fields and rule, in English and French.

## 5.0.0-alpha.5

### Minor Changes

- bdb1173: A first app shell replaces the placeholder of `@panneau/app`, to try the Phase 2 shell on the v5 components:
  
  - **Layout:** a sidebar on the window's background and the page on a raised panel, like the vertical tabs of recent browsers. The sidebar collapses to a rail of icons (its button, or Ctrl+\ / ⌘+\), and the browser remembers it. Below the `lg` width of the root, a bar opens it as a drawer.
  - **Navigation:** the `main` menu of the definition (`resources`, `resource`, `page`, `link`, `separator`, `group`), or every resource and page without one, with the Lucide icons the definition names. Resources the user can't list are left out.
  - **Pages:** a home page with a card per resource, resource lists (`ListView`, with the query in the URL and actions run by `@panneau/actions`), create and edit forms (`Form`, with server errors, version conflicts and the unsaved changes guard), plugin pages, and a not found page.
  - **Theming:** the frame reads the `--panneau-shell-*` and `--panneau-sidebar-*` component tokens (exported as `shellTokens`, `sidebarTokens` and `appComponentTokens`), which `defineTheme()` accepts once `@panneau/app` is imported: the inset panel of the default, or a flat frame with the sidebar on a surface.
  - **Theme:** the app renders in `PanneauRoot`, with the theme of the definition and its plugins, and a light, dark or system color scheme the user picks in the sidebar.
  - `Panneau` and `createPanneauApp()` take an `iconLoader`, every Lucide icon by default.
  - `@panneau/intl` has the messages of the app (`appMessages`), in English and French.
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
- eadfc08: `@panneau/media/editor`: the image editor (decision 0031). It edits a transform of an image, with the image as it will be rendered. `ImageEditor` fits in a page or a panel, and lays itself out for its own width. `ImageEditorDialog` opens it in a large dialog, and a full-screen sheet on phones.
  
  - **Tools:** crop (a frame with handles and thirds, ratios, and numbers), rotate (with flips) and focal point (with the automatic crops it gives), from `useImageEditorTools()`. A product adds its own, with a panel, an overlay and a `validate()`.
  - **The keyboard** moves and resizes the crop frame, and moves the focal point.
  - **The field's rules:** offered or enforced `ratios`, and a required crop, which the editor proposes around the focal point.
  - **The base of a transform for one use:** over the media's own transform by default, with `base` and `baseTransform`, or from the original file. When the media's transform changed, the crop is moved inside the new version, and the editor says so.
  
  The entry point loads neither `@panneau/data` nor `@panneau/core`. Its messages are in `@panneau/intl`, in English and French.
- f2c79b5: The `image` field (decision 0031). `ImageField` is a `media` field for images, with the image editor:
  
  - **Preview:** each image shows as it is rendered for this use, computed in the browser.
  - **Edit** opens the editor on its transform.
  - **Badges** say whether it is cropped, needs a crop, or was cropped over a version of the library that changed.
  - **Options:** `ratios` (offered or enforced), `cropRequired`, `rotate`, `focalPoint` and `transformBase`, shown next to the description.
  - **After a pick:** when a crop is required, the editor is the step right after the pick of one image.
  
  `mediaPlugin` now gives the `image` type too, and `MediaFieldEntry` reads its options and its `crop` rule (`getImageOptions()`). `MediaField` takes them as `image`. The image editor and the field share how an image is drawn. The mockups of the editor and the field are deleted.
- 81ec6b2: The protocol of the image editor and the `image` field (decision 0031):
  
  - **`image` fields**, a built-in type: `media` fields for images, with the editor's options `ratios` (suggested), `rotate`, `focalPoint` and `transformBase` (`media`, `original` or `choose`). `lintDefinition()` checks their libraries as for `media`, and the mock backend references their images.
  - **The `crop` portable rule:** `{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }`. It requires a crop for each image, and one of the ratios once rendered, within one pixel. `checkRules()` and `checkValues()` check it, and `@panneau/forms` words it ("Crop the image to 16:9 or 1:1.") in English and French.
  - **`MediaTransform`** says its `base`: from the original file (the default), or over the media's own transform (`"media"`), with `baseTransform`, the media's transform it was made on. It keeps the keys that editor tools add.
  - **`MediaInfo.transform`:** the media's own transform. The mock backend gives it from the library's `transform` field.
  - **`parseRatio()`, `matchesRatio()` and `renderedCropSize()`** in `@panneau/protocol/runtime`.
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
- 199a687: The `media` field opens the media picker: "Choose media" ("Add media" with `multiple`) browses the libraries given as `sources`, and the media picked replaces the field's media, or is added to its list. `MediaFieldEntry` gives the sources of every library the field allows, through the adapter of `DataAdapterProvider`. With the picker, the upload button reads "Upload a file" ("Upload files"). A media is now removed by its library and id, so that two libraries can have media with the same id. New messages in `@panneau/intl`: `chooseMedia`, `addMedia`, `uploadFile` and `uploadFiles`.
- fb33783: New `@panneau/media/picker` entry point (decision 0027): `MediaPicker`, a dialog to browse media libraries, upload to them and pick one media, or several with `multiple`, on `MediaSource`s that Panneau or a product implements. It has search, a type filter, sorts, the filters of the sources and of the opener (the opener's `filter` is locked), infinite scroll that keeps its place (across openings with `stateKey`), a selection across libraries, `accept` and `maxSize` that grey out what doesn't match, details that edit the fields of a media with `update()` and ask before losing changes, an Upload tab whose files become media of the library shown and are selected (`confirmOnUpload` confirms a single one at once), and follows media being processed. It returns references with their library. The entry point loads neither `@panneau/data` nor `@panneau/core`. `createResourceMediaSource(adapter, library)`, in `@panneau/media`, gives the source of a library resource. `@panneau/intl` gets the picker's messages, in English and French.
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

## 5.0.0-alpha.4

### Minor Changes

- 3974fb5: Messages of the upload fields, in English and French: those of the file field and the upload list in `fieldsMessages` (`panneau.fields.*`), and those of the media field in a new `mediaMessages` (`panneau.media.*`).

## 5.0.0-alpha.3

### Minor Changes

- 5a2ae0c: Dry runs of actions, so that a list can say how many items of a query selection ("Select all N items") an action will skip before the user confirms it. In the protocol, an action declares `dryRun`, and a request with `"dryRun": true` answers an action result without running anything; the mock backend answers them, and the conformance kit checks them (`action.dry-run`). `@panneau/actions` adds `useActionPreview()` and `previewAction()`, and `ListView` takes a `previewAction`: its confirmation shows that it is checking, then the backend's count, and runs at once when nothing is skipped and the action asks no confirmation.

## 5.0.0-alpha.2

No changes in this release.

## 5.0.0-alpha.1

### Major Changes

- 8d1313a: Add `@panneau/intl`: the messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` in one place. `withPanneauMessages(locale, messages)` merges the messages of every package for a locale with an app's (`fr-CA` falls back to `fr`), `getPanneauMessages(locale)` returns them, and `en`, `fr` and `panneauMessages` are the catalogs. It also exports the message descriptors (`uiMessages`, `fieldsMessages`, `formsMessages`), typed with the values each message takes. A test checks that every message has a French translation with the same arguments.

### Minor Changes

- 712dfcb: Add `@panneau/actions`: it runs the actions that lists and forms hand over. `ActionRunnerProvider` asks for the parameters of an action in a dialog (with the forms of `@panneau/forms`, client validation and the `422` errors of the action endpoint), runs it through an adapter (`runAction()`, `getActionRun()`, `cancelActionRun()` of a `DataAdapter`), shows its result (a toast with its message and counts, and the items that didn't succeed), calls `onResult` to refresh, opens downloads, follows redirects, and follows queued runs until they end. `useActionRunner(resource)` is the `onAction` of a list; `ActionRuns` lists the runs with their progress. `link` actions go through `onNavigate`, and `client` actions render the handler that a plugin registers. `@panneau/intl` has its messages, in English and French. In `@panneau/lists`, an `onAction` that gives `false` keeps the selection (the action didn't run), and resource actions show in the toolbar of a list that has no search, filters, sorting or layouts.
- Add the messages of `@panneau/lists` (`listsMessages`), in English and French, to the catalogs.

### Patch Changes

- 9c844ee: Relation fields show the labels of values that are only ids (`"12"`), and can create items from the picker. `RelationSource` has two optional methods: `resolve(resource, ids)`, which gives the references of ids (fields that show the same ids share one request), and `create(resource, text)`, with `canCreate(resource)`, which the picker offers as "Create “…”". `createRelationSource()` resolves ids with the adapter's `get()`, and creates items with its `create()` when given `create: true` (the text becomes the `itemTitle`, in every locale when it is localized) or a function that gives the values. `RelationField` takes `onCreate`, which can open a dialog and resolves with the new reference. `useRelationReferences()` resolves references for other components. In `@panneau/lists`, relation filters resolve the labels of ids that come from the URL, for their chips and picker. `@panneau/intl` has the new messages, in English and French.
