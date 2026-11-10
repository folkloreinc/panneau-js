# Roadmap

Tracking issue: [#6](https://github.com/folkloreinc/panneau-js/issues/6). Laravel side: [folkloreinc/laravel-panneau#35](https://github.com/folkloreinc/laravel-panneau/issues/35).

Each item becomes a sub-issue of #6 (or of laravel-panneau#35) when work on it starts. Work happens on the `v5.x` branch of both repositories, through pull requests. Pre-releases are tagged `5.0.0-alpha.N` and then `5.0.0-beta.N`.

## Where we are

Updated on 2026-11-03. The latest pre-releases are `@panneau/*` 5.0.0-alpha.14 and `laravel-panneau` v5.0.0-alpha.9.

- **Phases 0 and 1:** done.
- **Phase 2:** in progress, still in alphas. Done: loading states, the app shell, auth, actions, permissions, lists, rich text, the new field types, media, the Folklore plugin and resource types. Started: migration. Left before the beta: the migration of the contests platform's admin, and freezing the protocol and the public API.
- **5.x:** image editing and the "Go to…" palette were done early, in phase 2.

Each item below says where it is: **done**, **started** (with what is left) or **to do**.

## Phase 0: Foundations (done)

Goal: a branch where every change is tested and released properly, plus a written contract.

**`panneau-js`** ([#9](https://github.com/folkloreinc/panneau-js/issues/9), [#10](https://github.com/folkloreinc/panneau-js/issues/10))

- GitHub Actions CI: build, type check, lint, unit tests, Storybook tests.
- TypeScript `strict`, a working ESLint config, Vitest and Testing Library.
- Changesets: real semver, generated CHANGELOG, publishing from CI only, from `v5.x` only.
- Package consolidation (about a dozen packages, subpath exports) and API reports to catch breaking changes in review.
- Remove dead code and dependencies (Google Maps, fonts, tracking, event emitter, duplicate date and icon libraries).

**`@panneau/protocol`** ([#8](https://github.com/folkloreinc/panneau-js/issues/8))

- Definition JSON Schema and TypeScript types.
- OpenAPI spec of the API.
- Conformance kit.

**`laravel-panneau`** ([folkloreinc/laravel-panneau#45](https://github.com/folkloreinc/laravel-panneau/issues/45))

- GitHub Actions CI with a PHP × Laravel matrix, Pint, Larastan, PHPUnit and Testbench.
- Supported PHP and Laravel versions.

## Phase 1: Core (5.0 alphas, done)

Goal: the pieces work on their own, and Niche can start using them.

- **Design tokens, themes** (light, dark, Bootstrap-compatible) and **accessible primitives** ([#22](https://github.com/folkloreinc/panneau-js/issues/22)), then a theme model as extensible as Bootstrap's ([#56](https://github.com/folkloreinc/panneau-js/issues/56), [decisions/0024](decisions/0024-theme-model.md)).
- **Fields as controlled components** ([#24](https://github.com/folkloreinc/panneau-js/issues/24)). All the v4 field types are kept, reworked onto the new types listed in [protocol.md](protocol.md).
- **Engine** ([#16](https://github.com/folkloreinc/panneau-js/issues/16)):
    - plugin registry;
    - definition to form and list;
    - form state behind a store interface.
- **Forms** ([#25](https://github.com/folkloreinc/panneau-js/issues/25)):
    - **Layout:** rows, columns, sections, tabs, sidebar, conditional visibility.
    - **Validation and errors:** client validation with the portable rules; server errors mapped to fields, an error summary, a scroll to the first error, error badges on tabs.
    - **Unsaved changes:** guards on navigation.
    - **Error boundaries** and toasts.
- **Concurrency:** item versions, `If-Match`, a conflict dialog.
- **Data** ([#14](https://github.com/folkloreinc/panneau-js/issues/14)): `DataAdapter` interface, REST adapter with a Laravel preset, query hooks.
- **Laravel** ([folkloreinc/laravel-panneau#61](https://github.com/folkloreinc/laravel-panneau/issues/61) to [#71](https://github.com/folkloreinc/laravel-panneau/issues/71)):
    - definition builders and the definition endpoint;
    - generic resource API, with Policies and abilities;
    - problem+json errors and contract tests;
    - `panneau:install`.
- **Niche pilot.** Niche's first screens (members, media, content metadata) are built with the 5.0 alphas. What doesn't fit becomes an issue here. Niche runs on 5.0.0-alpha.7 without working around Panneau.

## Phase 2: App and content (5.0 betas, in progress)

Goal: a complete admin panel, ready for client projects.

**Pilot: the contests platform.** Folklore's contest platform (multi-tenant, with internal, agency and client users) moves its whole admin to the 5.0 betas, one item at a time, starting with the app shell. Niche keeps pulling what its product needs from this phase. What doesn't fit becomes an issue here, labelled `contests`. The first sites to migrate (Eclair, urbania.media) also pull from this phase, with the `eclair` and `migration` labels.

**The interface is worked on in parallel.** The look and the interactions of the app (shell, sidebar, pages) are designed on the playground (`npm run playground`), at the same time as the contests platform migrates, instead of waiting for each of its slices.

- **Loading states (done):** skeletons of the content's shape instead of spinners, in lists, forms, the item panel, the preview, the media picker and the boot of the app ([#121](https://github.com/folkloreinc/panneau-js/issues/121), [decisions/0034](decisions/0034-skeletons-while-content-loads.md)).
- **App shell (done):** routing, layout, menus, replaceable pages, error pages, a current context.
    - First version (done): a sidebar from the `main` menu, collapsible to a rail of icons, with the page on a raised panel as in recent browsers, a drawer on small screens, and themable through the `shell` and `sidebar` component tokens. Home, list, create, edit, plugin and not found pages. Plugin pages use the header and layout of resource pages and take params ([#145](https://github.com/folkloreinc/panneau-js/issues/145), [#151](https://github.com/folkloreinc/panneau-js/issues/151), [decisions/0038](decisions/0038-pages-with-params.md)), and the home route renders `pages.home` ([#139](https://github.com/folkloreinc/panneau-js/issues/139)).
    - **Show page (done):** the show route opens the item's details in a panel next to its list: its values, a link to edit it, and its `link` actions, such as its page on the site ([decisions/0028](decisions/0028-item-panel.md)). It shows the item's preview when its resource has one: a plugin component, or its page on the site in an iframe.
    - **Notification area (done):** a button in the sidebar for the queued action runs, with the count of those in progress, that opens their progress in a popover ([#180](https://github.com/folkloreinc/panneau-js/issues/180)).
    - **A dock (in progress):** the navigation in a dock at the bottom of the window instead of the sidebar, when the definition's theme sets `navigation: "dock"`, and a bar of tabs on phones ([decisions/0076](decisions/0076-a-dock-in-place-of-the-sidebar.md)).
    - **Error pages (done):** not found, forbidden, server error, offline or server unreachable, and a page that failed while it rendered, in the look of the shell and at boot ([#181](https://github.com/folkloreinc/panneau-js/issues/181)).
    - **Pages and menus from `laravel-panneau` (done):** `config/panneau.php`, or `Panneau::pages()` and `Panneau::menu()` with builders, and closures that get the user, so menus can depend on the role ([folkloreinc/laravel-panneau#33](https://github.com/folkloreinc/laravel-panneau/issues/33)).
    - **Current context (done):** the definition declares the params of a context that the user picks in the sidebar, or that the backend fixes from the request (for the contests platform: the client of the domain, then the contest). Their values are a prefix of the routes, every request sends them in `Panneau-Context`, the definition and its menus are built for them, and each resource applies them in its scope ([#182](https://github.com/folkloreinc/panneau-js/issues/182), [folkloreinc/laravel-panneau#147](https://github.com/folkloreinc/laravel-panneau/issues/147), [decisions/0045](decisions/0045-current-context.md)).
- **Auth (done):**
    - password login, password reset, 2FA, passkeys, email verification. Done: the login page in `panneau` mode, a login with a token for backends without an email and a password, and a logout ([#136](https://github.com/folkloreinc/panneau-js/issues/136), [#137](https://github.com/folkloreinc/panneau-js/issues/137), [decisions/0037](decisions/0037-login-page-token-and-logout.md)); password reset and email verification, through pages of the app that the links of the emails open ([#196](https://github.com/folkloreinc/panneau-js/issues/196), [decisions/0048](decisions/0048-password-reset-and-email-verification.md)); two-factor authentication with recovery codes, a password confirmation for the changes, and a backend that requires it for some users ([#203](https://github.com/folkloreinc/panneau-js/issues/203), [decisions/0049](decisions/0049-two-factor-authentication.md)); passkeys, on the login page and the account page ([#206](https://github.com/folkloreinc/panneau-js/issues/206), [decisions/0051](decisions/0051-passkeys.md));
    - OAuth providers (done): a button per provider on the login page, which comes back to the page with `next`, and says why a login failed ([#5](https://github.com/folkloreinc/panneau-js/issues/5), [folkloreinc/laravel-panneau#34](https://github.com/folkloreinc/laravel-panneau/issues/34), [decisions/0052](decisions/0052-oauth-providers.md));
    - the `external` mode for sites with their own auth: done, with a logout URL ([folkloreinc/laravel-panneau#132](https://github.com/folkloreinc/laravel-panneau/issues/132));
    - account page (done): the name and email, the password and two-factor authentication of the user, from their name in the sidebar ([#204](https://github.com/folkloreinc/panneau-js/issues/204), [decisions/0050](decisions/0050-account-page.md)). It has the passkeys too.
- **Permissions (done):** abilities in the UI; an optional roles module on the Laravel side.
    - The built-in item actions (`show`, `edit`, `duplicate`, `delete`) follow the item's abilities ([decisions/0040](decisions/0040-row-links-and-open-mode.md)).
    - The rest of the UI follows them too ([#183](https://github.com/folkloreinc/panneau-js/issues/183), [decisions/0046](decisions/0046-abilities-in-the-ui.md)): pages and fields have abilities, menus leave out what the user can't reach, a route reached without the ability shows a forbidden page, fields are hidden or read-only by ability, and a resource hides its bulk delete with `abilities.run: false`. The conformance kit checks that the API agrees.
    - `laravel-panneau` sends the abilities of fields, hides the bulk delete by the policy's `deleteAny()`, answers every action through `runAction()` ([folkloreinc/laravel-panneau#148](https://github.com/folkloreinc/laravel-panneau/issues/148)), and has an optional roles module: roles in config, grants per user, a base policy and ownership on every route ([folkloreinc/laravel-panneau#149](https://github.com/folkloreinc/laravel-panneau/issues/149), its decision 0014), and `Page::can()` for its pages.
- **Lists (done):**
    - sorting, filters (with active filter chips), column choice: done. Sorting, filters and their chips ([#32](https://github.com/folkloreinc/panneau-js/issues/32)), cursor pagination ([#150](https://github.com/folkloreinc/panneau-js/issues/150), [decisions/0039](decisions/0039-cursor-pagination.md)), and columns the user shows, hides and orders, with those the definition hides by default or keeps ([#176](https://github.com/folkloreinc/panneau-js/issues/176), [decisions/0042](decisions/0042-list-view-columns-and-remembered-view.md));
    - inline editing (done): a column edits its field in place, for the simple types (text, number, select, boolean, date). Each change saves the one field (`PATCH` with a single field and `If-Match`), checked by its portable rules, and an error or a conflict shows on the cell ([#177](https://github.com/folkloreinc/panneau-js/issues/177), [decisions/0043](decisions/0043-inline-editing.md));
    - layouts (table, cards, gallery, calendar), bulk actions: done. The gallery on the `itemImage` of the resource, and the calendar on a date field of the definition, which asks for the days around a month through its `date-range` filter instead of pages ([#178](https://github.com/folkloreinc/panneau-js/issues/178), [decisions/0044](decisions/0044-gallery-and-calendar.md));
    - remembered view per user (done): the filters, sort, page size, layout and columns of each list, in the browser, restored when the URL has no query of its own ([#179](https://github.com/folkloreinc/panneau-js/issues/179), [decisions/0042](decisions/0042-list-view-columns-and-remembered-view.md));
    - row actions (done): colored icons, the main action with its label, the same in every list, and a menu only when the icons don't fit, never for a single action; lined up across rows ([decisions/0060](decisions/0060-row-actions-colored-icons.md)).
- **Actions (done):**
    - built-in and custom actions, with parameters and confirmation: done ([#35](https://github.com/folkloreinc/panneau-js/issues/35));
    - selection by query (every matching item): done, with a dry run that counts the items an action will skip ([#44](https://github.com/folkloreinc/panneau-js/issues/44));
    - per-item results: done;
    - queued runs with progress and a notification area: done. The shell's sidebar has a button for the runs it follows, with a badge, that opens their progress in a popover ([#180](https://github.com/folkloreinc/panneau-js/issues/180)).
- **Conventions of the interface (started):** the same in every admin, so that a user learns them once.
    - Tones (done): what each one means for a state, written once in the protocol, and a `muted` tone for what is over ([#226](https://github.com/folkloreinc/panneau-js/issues/226)).
    - Toasts (done): at the bottom, one per thing, at most three, naming what was done to what, with timeouts that match what they hold, and only when the page doesn't already say it: a form says "Saved" in its footer, and a run that starts shows in the runs button ([#229](https://github.com/folkloreinc/panneau-js/issues/229), [decisions/0062](decisions/0062-toasts.md)). "Show" in the toast of a run opens the list filtered on the items it changed, with `filter[ids]`, a filter of every list ([decisions/0069](decisions/0069-show-the-items-an-action-changed.md)). Left: `laravel-panneau` reads `filter[ids]`.
    - After a create, the list (done): the app goes back to the list, which highlights the new item, without a toast ([decisions/0066](decisions/0066-a-create-goes-back-to-the-list.md)). Relation fields show their items as cards, with their image, their description and a link ([decisions/0067](decisions/0067-relation-cards.md)). Repeater items fold to one line, slugs show as permalinks, and controls show when needed ([decisions/0068](decisions/0068-collapsed-items-and-lighter-controls.md)).
    - Undo (done): what can be undone runs without a confirmation, with "Undo" in its toast for about 10 seconds: a change in place, the `delete` of a resource with a trash (`restore`), and the pairs of actions that projects declare (`undoable`, and `undo` in the result). Above 100 items, and for queued runs, the confirmation comes back ([#230](https://github.com/folkloreinc/panneau-js/issues/230), [folkloreinc/laravel-panneau#179](https://github.com/folkloreinc/laravel-panneau/issues/179), [decisions/0063](decisions/0063-undo-instead-of-a-confirmation.md)).
- **Rich text (done):** TipTap 3 field in `@panneau/editor` ([#128](https://github.com/folkloreinc/panneau-js/issues/128)): HTML storage, the toolbar, heading levels and block styles set from the definition, and TipTap extensions from plugins. HTML written by CKEditor 4 and 5 loads and saves unchanged until it is edited ([decisions/0035](decisions/0035-rich-text-kept-html.md)). ProseMirror JSON storage as an option comes later.
- **More field types (done):** `tel`, `range`, `duration`, `json`, `tags`, `embed` (resolved by the backend with its provider's oEmbed) and `location` (a Leaflet map with a pluggable address search) ([#111](https://github.com/folkloreinc/panneau-js/issues/111), [decisions/0033](decisions/0033-more-field-types.md), [folkloreinc/laravel-panneau#100](https://github.com/folkloreinc/laravel-panneau/issues/100)). Choices as radios or checkboxes are `select` widgets. Also done: slugs and values checked by the backend ([#109](https://github.com/folkloreinc/panneau-js/issues/109), [decisions/0032](decisions/0032-field-checks-and-slugs.md)), secret text fields ([#143](https://github.com/folkloreinc/panneau-js/issues/143)), and the `country` and `region` types with phone numbers in E.164 ([decisions/0047](decisions/0047-countries-regions-and-phone-numbers.md)). Then the types that the audit of the sites moving to Panneau 5 asked for: `daterange`, a start and an end checked together, with open ends, all-day ranges, time zones, and a repeater of sessions ([#198](https://github.com/folkloreinc/panneau-js/issues/198)), and `money`, an amount in minor units with its currency ([#200](https://github.com/folkloreinc/panneau-js/issues/200)) ([decisions/0053](decisions/0053-date-ranges-and-money.md)). Also from the audit: `address`, with postal codes normalized and checked by country (the `postalCode` rule) and the address search of `location` ([#199](https://github.com/folkloreinc/panneau-js/issues/199), [decisions/0054](decisions/0054-addresses.md)), and `link`, to a URL, a page, an email address, a phone number, a file or a type of the site ([#202](https://github.com/folkloreinc/panneau-js/issues/202), [decisions/0055](decisions/0055-links.md)).
- **Media (done):** media fields and a basic library on the protocol's media API; `laravel-mediatheque` adapter. Done with direct uploads to storage on Uppy 6 ([#79](https://github.com/folkloreinc/panneau-js/issues/79), [decisions/0025](decisions/0025-presigned-uploads.md)), media libraries as resources ([decisions/0026](decisions/0026-media-libraries.md)), the media picker ([#91](https://github.com/folkloreinc/panneau-js/issues/91), [decisions/0027](decisions/0027-media-picker.md)) and `MediathequeResource` in `laravel-panneau`.
- **Long forms (done):** ⌘ Enter (Ctrl Enter elsewhere) saves from any field of a form, the rich text editor included, and the submit button gives the shortcut. After a failed save, every collapsed section that holds an error opens, not only the one of the first error ([#227](https://github.com/folkloreinc/panneau-js/issues/227)).
- **Folklore plugin (done):** Pages, Blocks and PageSlug fields, shipped by `laravel-folklore` 2.0.0-alpha.6. They are written in PHP on the built-in types (`relation`, `repeater`, `slug`), with no JS of their own ([its decision 0018](https://github.com/folkloreinc/laravel-folklore/blob/v2.x/docs/decisions/0018-panneau-plugin-php-only.md)), next to the adapter of its repositories on the typed query ([folkloreinc/laravel-folklore#121](https://github.com/folkloreinc/laravel-folklore/issues/121), [#122](https://github.com/folkloreinc/laravel-folklore/issues/122)). Left: `laravel-panneau` serializes the relations and media inside groups and repeaters as references, and `Blocks` drops its own conversion ([folkloreinc/laravel-panneau#117](https://github.com/folkloreinc/laravel-panneau/issues/117)).
- **Resource types (done):** the items of a resource with a type of their own and its fields, as the `$types` of 1.x: creating asks for the type, a type can forbid creation, and forms and details show the fields of the item's type ([#277](https://github.com/folkloreinc/panneau-js/issues/277), [decisions/0077](decisions/0077-resource-types.md)). In the protocol, the mock backend and the app, and in `laravel-panneau` with `types()`, where `panneau:install --upgrade` ports the `$types` of 1.x ([folkloreinc/laravel-panneau#138](https://github.com/folkloreinc/laravel-panneau/issues/138)).
- **Migration (started):** guide, codemods for JS (`@panneau/codemods`, [#129](https://github.com/folkloreinc/panneau-js/issues/129)), Rector rules for PHP, tried on the contests platform's admin (custom fields, pages and controllers) before 5.0. Done: the guide ([migration.md](migration.md)), the codemods, and `panneau:install --upgrade` with its `--check` audit and Rector rules ([folkloreinc/laravel-panneau#114](https://github.com/folkloreinc/laravel-panneau/issues/114), [#115](https://github.com/folkloreinc/laravel-panneau/issues/115)). They are being tried on urbania.media. Left: the contests platform's admin.

## 5.0.0 (to do)

- Both repositories release 5.0.0 on the same day.
- The `v5.x` branches become the default branches on GitHub.
- The first client projects migrate (see [migration.md](migration.md)).

## 5.x

Minor releases, each one additive:

- **Image editing (done in phase 2):** crop, rotate, flip and focal point. Edits are non-destructive and rendered through `laravel-image` ([#100](https://github.com/folkloreinc/panneau-js/issues/100), [decisions/0031](decisions/0031-image-editor-and-image-field.md)). Left: the crop of an image in a block is lost on save, because `laravel-folklore`'s blocks keep only the reference to the media.
- **Media library:** conversions, tags, search. Depends on the `laravel-mediatheque` roadmap. Also:
    - an alternative text on each media, optional, that image fields and the site use by default;
    - its usage: the list of the items that use a media (pages, blocks), on its details. Deleting a media in use already warns.
- **Home page:** dashboards with widgets, defined per project and per role. Done: the built-in `stat`, `series` and `list` and the shape of their data, `stat` and `list` on the list of a resource, widgets of plugins, their skeletons and errors, and a grid of 12 columns ([#228](https://github.com/folkloreinc/panneau-js/issues/228), [decisions/0064](decisions/0064-dashboard-widgets.md)), with `laravel-panneau`'s builders, endpoint and cache ([folkloreinc/laravel-panneau#178](https://github.com/folkloreinc/laravel-panneau/issues/178)). Later: users choosing and arranging their own widgets, with the preferences of saved views.
- **Global search (done in phase 2):** a "Go to…" command palette (⌘K) ([#97](https://github.com/folkloreinc/panneau-js/issues/97), [decisions/0029](decisions/0029-go-to-palette.md)): recent items, navigation, create, commands of plugins and results of `GET /search` grouped by resource. Then the `limit` and `resources` parameters, the `422` and `429` problems, conformance checks and a scope per resource ([decisions/0030](decisions/0030-search-parameters-and-scope.md)), and `laravel-panneau`'s endpoint, on Laravel Scout when the model is searchable ([folkloreinc/laravel-panneau#96](https://github.com/folkloreinc/laravel-panneau/issues/96)). Recent items on the server are set aside for now.
- **AI agents (MCP):** an MCP server that lets an AI assistant work in a Panneau, authenticated as its user.
    - Its tools come from the definition and the protocol: list, search, show, create and update the items of a resource, and run its actions, with a dry run first for those that change or delete items.
    - The agent signs in with OAuth as the user, as the MCP specification describes: it acts with the user's abilities and the backend's policies, and the user can revoke it.
    - It lives in `laravel-panneau`. The tools are built once from the definition, with Laravel's JSON Schema builder. `laravel/mcp` serves them to outside AI clients, signed in with OAuth 2.1 (Passport) or a Sanctum token. The Laravel AI SDK (`laravel/ai`) uses the same tools for an assistant inside Panneau, with its answers streamed to a panel of the app.
    - A decision record sets the tools, their names and their limits when the work starts.
- **Sidebars, a general principle:** any page can have a sidebar next to its main content, for what goes with it, placed where it helps: next to a list, or next to a form. The item panel of lists ([decisions/0028](decisions/0028-item-panel.md)) and the `sidebar` node of form layouts are its first two cases. They become one principle, with one component, its tokens, and the same behaviour everywhere: its width, a button that widens it, collapsed or below the content on small screens, and remembered by the browser.
    - **One aside (done):** `Aside`, `AsidePanel` and `AsideLayout` of `@panneau/ui`, with the `aside` tokens. The item panel and the `sidebar` nodes of form layouts use them: beside the content from 56rem of the layout and in view as it scrolls, below it or over it otherwise, panels with a title that the user collapses, and the width and the collapsed panels remembered by the browser ([decisions/0074](decisions/0074-asides-next-to-lists-and-forms.md)).
    - **Next to a list: the whole item, for simple resources.** The panel holds the item's form, not only its details, so a simple resource is managed without leaving its list. The resource chooses how: values changed in place, each one saved alone as in the inline editing of lists ([decisions/0043](decisions/0043-inline-editing.md)), or the whole form with its Save button. The panel also has the item's status and actions (renew, publish, delete), ↑ and ↓ to go to the previous and next item of the list, and a link to its full page. Example: the Micromag licenses tool of Machine.
    - **Panels of a form (done):** a `sidebar` node with a `panel` is a block of the app or of a plugin, chosen and ordered by the resource: `save`, `errors`, `publication` with Publish and Unpublish, and `actions`. Plugins register their own under `panels`, and `useFormPage()` gives them the item. The `pages` of the example use them ([decisions/0075](decisions/0075-panels-of-a-form-sidebar.md)).
    - **Next to a form: the item's state and what acts on it**, as in WordPress's editor: the publication (status, date, visibility), the Save draft, Save and Publish buttons, the important dates, a map of its location, the summary of the form's errors, its links (its page on the site) and its preview. It stays in view while the form scrolls. Resources with a publication (`Layout\Publication` of `laravel-panneau`) get a sensible default.
    - **Revisions:** the history of an item in the sidebar of its form: who changed what and when, a comparison with the current values, and restoring a version (see Revisions below).
    - **Media:** in the form of a media resource, a panel with the media itself (its image, its video with a thumbnail, its preview) and its metadata (type, size, dimensions, duration).
    - **Stats and charts:** the widgets of dashboards ([decisions/0064](decisions/0064-dashboard-widgets.md): `stat`, `series`, `list`) as panels: those of a resource next to its list (its items by status, those created over time), those of an item next to its form (its views, its sales).
    - **Other uses:** the activity of the item and who else has it open (presence); the items that use it, such as the usage of a media; the help of the resource or of the field in focus; the AI assistant inside Panneau; the filters of a list on large screens.
    - A sidebar is made of panels: blocks of the app (publication, actions, errors, preview, revisions), fields of the layout, and panels that plugins register for a resource or for all. Abilities hide them, and the user can collapse them. A decision record sets their place in the definition and the protocol when the work starts.
- **Preview:** component previews and iframe previews of the real site fed with unsaved values, live, next to the form. Left besides building it: wiring it on the sites.
- **Revisions:** the history of an item, per resource: who changed what and when, a comparison of two versions, and restoring one.
- **Drafts and no lost work:** drafts per resource. The form also keeps its unsaved values in the browser as they are typed, and offers them back after a crash or a closed tab. Leaving a changed form already warns (phase 1).
- **SEO and sharing:** a preset of compound field (decision 0065, as `sessions`) for the title and description for search engines and the share image, with a preview of the page in a search result and in a social card.
- **Page tree:** a tree layout of a list, where pages are moved by drag and drop to change their parent and their order. Menus of the sites are managed with it too.
- **Blocks:** duplicate a block, copy and paste blocks from one page to another, reusable blocks, and page templates.
- **Activity log:** who did what and when, on a widget of the home page, then per item.
- **Collaboration:**
    - presence ("Marie is editing this page"), after the activity log;
    - optional realtime collaboration with Yjs (`@panneau/collab`), first on rich text fields and then on whole forms.

## Open questions

Decided later, each in its own decision record:

- **Supported PHP and Laravel versions for 5.x.** Decided: PHP 8.3+ and Laravel 12+ (`laravel-panneau/docs/decisions/0006-supported-versions.md`).
- **Prebuilt bundle.** Should `laravel-panneau` ship a prebuilt `@panneau/app` bundle, so simple sites need no JS build? Custom fields would still need a project build.
- **Where the Folklore plugin's JS lives.** Decided: it has none. Its fields are PHP on the built-in types ([laravel-folklore's decision 0018](https://github.com/folkloreinc/laravel-folklore/blob/v2.x/docs/decisions/0018-panneau-plugin-php-only.md)).
- **A Node reference backend.** Not planned for 5.0. Node sites implement the protocol themselves and use the conformance kit.
- **Router.** Keep `wouter`, or support the host app's router through an adapter only.
