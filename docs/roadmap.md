# Roadmap

Tracking issue: [#6](https://github.com/folkloreinc/panneau-js/issues/6). Laravel side: [folkloreinc/laravel-panneau#35](https://github.com/folkloreinc/laravel-panneau/issues/35).

Each item becomes a sub-issue of #6 (or of laravel-panneau#35) when work on it starts. Work happens on the `v5.x` branch of both repositories, through pull requests. Pre-releases are tagged `5.0.0-alpha.N` and then `5.0.0-beta.N`.

## Where we are

Updated on 2026-11-03. The latest pre-releases are `@panneau/*` 5.0.0-alpha.14 and `laravel-panneau` v5.0.0-alpha.9.

- **Phases 0 and 1:** done.
- **Phase 2:** in progress, still in alphas. Done: loading states, the app shell, actions, permissions, lists, rich text, the new field types, media and the Folklore plugin. Started: auth and migration. Left before the beta: the rest of auth, the migration of the contests platform's admin, and freezing the protocol and the public API.
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
    - **Error pages (done):** not found, forbidden, server error, offline or server unreachable, and a page that failed while it rendered, in the look of the shell and at boot ([#181](https://github.com/folkloreinc/panneau-js/issues/181)).
    - **Pages and menus from `laravel-panneau` (done):** `config/panneau.php`, or `Panneau::pages()` and `Panneau::menu()` with builders, and closures that get the user, so menus can depend on the role ([folkloreinc/laravel-panneau#33](https://github.com/folkloreinc/laravel-panneau/issues/33)).
    - **Current context (done):** the definition declares the params of a context that the user picks in the sidebar, or that the backend fixes from the request (for the contests platform: the client of the domain, then the contest). Their values are a prefix of the routes, every request sends them in `Panneau-Context`, the definition and its menus are built for them, and each resource applies them in its scope ([#182](https://github.com/folkloreinc/panneau-js/issues/182), [folkloreinc/laravel-panneau#147](https://github.com/folkloreinc/laravel-panneau/issues/147), [decisions/0045](decisions/0045-current-context.md)).
- **Auth (started):**
    - password login, password reset, 2FA, passkeys, email verification. Done: the login page in `panneau` mode, a login with a token for backends without an email and a password, and a logout ([#136](https://github.com/folkloreinc/panneau-js/issues/136), [#137](https://github.com/folkloreinc/panneau-js/issues/137), [decisions/0037](decisions/0037-login-page-token-and-logout.md)). Left: password reset, 2FA, passkeys and email verification;
    - OAuth providers (continues [#5](https://github.com/folkloreinc/panneau-js/issues/5) and laravel-panneau#34): to do;
    - the `external` mode for sites with their own auth: done, with a logout URL ([folkloreinc/laravel-panneau#132](https://github.com/folkloreinc/laravel-panneau/issues/132));
    - account page: to do. The shell links to the user's profile.
- **Permissions (done):** abilities in the UI; an optional roles module on the Laravel side.
    - The built-in item actions (`show`, `edit`, `duplicate`, `delete`) follow the item's abilities ([decisions/0040](decisions/0040-row-links-and-open-mode.md)).
    - The rest of the UI follows them too ([#183](https://github.com/folkloreinc/panneau-js/issues/183), [decisions/0046](decisions/0046-abilities-in-the-ui.md)): pages and fields have abilities, menus leave out what the user can't reach, a route reached without the ability shows a forbidden page, fields are hidden or read-only by ability, and a resource hides its bulk delete with `abilities.run: false`. The conformance kit checks that the API agrees.
    - `laravel-panneau` sends the abilities of fields, hides the bulk delete by the policy's `deleteAny()`, answers every action through `runAction()` ([folkloreinc/laravel-panneau#148](https://github.com/folkloreinc/laravel-panneau/issues/148)), and has an optional roles module: roles in config, grants per user, a base policy and ownership on every route ([folkloreinc/laravel-panneau#149](https://github.com/folkloreinc/laravel-panneau/issues/149), its decision 0014), and `Page::can()` for its pages.
- **Lists (done):**
    - sorting, filters (with active filter chips), column choice: done. Sorting, filters and their chips ([#32](https://github.com/folkloreinc/panneau-js/issues/32)), cursor pagination ([#150](https://github.com/folkloreinc/panneau-js/issues/150), [decisions/0039](decisions/0039-cursor-pagination.md)), and columns the user shows, hides and orders, with those the definition hides by default or keeps ([#176](https://github.com/folkloreinc/panneau-js/issues/176), [decisions/0042](decisions/0042-list-view-columns-and-remembered-view.md));
    - inline editing (done): a column edits its field in place, for the simple types (text, number, select, boolean, date). Each change saves the one field (`PATCH` with a single field and `If-Match`), checked by its portable rules, and an error or a conflict shows on the cell ([#177](https://github.com/folkloreinc/panneau-js/issues/177), [decisions/0043](decisions/0043-inline-editing.md));
    - layouts (table, cards, gallery, calendar), bulk actions: done. The gallery on the `itemImage` of the resource, and the calendar on a date field of the definition, which asks for the days around a month through its `date-range` filter instead of pages ([#178](https://github.com/folkloreinc/panneau-js/issues/178), [decisions/0044](decisions/0044-gallery-and-calendar.md));
    - remembered view per user (done): the filters, sort, page size, layout and columns of each list, in the browser, restored when the URL has no query of its own ([#179](https://github.com/folkloreinc/panneau-js/issues/179), [decisions/0042](decisions/0042-list-view-columns-and-remembered-view.md)).
- **Actions (done):**
    - built-in and custom actions, with parameters and confirmation: done ([#35](https://github.com/folkloreinc/panneau-js/issues/35));
    - selection by query (every matching item): done, with a dry run that counts the items an action will skip ([#44](https://github.com/folkloreinc/panneau-js/issues/44));
    - per-item results: done;
    - queued runs with progress and a notification area: done. The shell's sidebar has a button for the runs it follows, with a badge, that opens their progress in a popover ([#180](https://github.com/folkloreinc/panneau-js/issues/180)).
- **Rich text (done):** TipTap 3 field in `@panneau/editor` ([#128](https://github.com/folkloreinc/panneau-js/issues/128)): HTML storage, the toolbar, heading levels and block styles set from the definition, and TipTap extensions from plugins. HTML written by CKEditor 4 and 5 loads and saves unchanged until it is edited ([decisions/0035](decisions/0035-rich-text-kept-html.md)). ProseMirror JSON storage as an option comes later.
- **More field types (done):** `tel`, `range`, `duration`, `json`, `tags`, `embed` (resolved by the backend with its provider's oEmbed) and `location` (a Leaflet map with a pluggable address search) ([#111](https://github.com/folkloreinc/panneau-js/issues/111), [decisions/0033](decisions/0033-more-field-types.md), [folkloreinc/laravel-panneau#100](https://github.com/folkloreinc/laravel-panneau/issues/100)). Choices as radios or checkboxes are `select` widgets. Also done: slugs and values checked by the backend ([#109](https://github.com/folkloreinc/panneau-js/issues/109), [decisions/0032](decisions/0032-field-checks-and-slugs.md)), secret text fields ([#143](https://github.com/folkloreinc/panneau-js/issues/143)), and the `country` and `region` types with phone numbers in E.164 ([decisions/0047](decisions/0047-countries-regions-and-phone-numbers.md)).
- **Media (done):** media fields and a basic library on the protocol's media API; `laravel-mediatheque` adapter. Done with direct uploads to storage on Uppy 6 ([#79](https://github.com/folkloreinc/panneau-js/issues/79), [decisions/0025](decisions/0025-presigned-uploads.md)), media libraries as resources ([decisions/0026](decisions/0026-media-libraries.md)), the media picker ([#91](https://github.com/folkloreinc/panneau-js/issues/91), [decisions/0027](decisions/0027-media-picker.md)) and `MediathequeResource` in `laravel-panneau`.
- **Folklore plugin (done):** Pages, Blocks and PageSlug fields, shipped by `laravel-folklore` 2.0.0-alpha.6. They are written in PHP on the built-in types (`relation`, `repeater`, `slug`), with no JS of their own ([its decision 0018](https://github.com/folkloreinc/laravel-folklore/blob/v2.x/docs/decisions/0018-panneau-plugin-php-only.md)), next to the adapter of its repositories on the typed query ([folkloreinc/laravel-folklore#121](https://github.com/folkloreinc/laravel-folklore/issues/121), [#122](https://github.com/folkloreinc/laravel-folklore/issues/122)). Left: `laravel-panneau` serializes the relations and media inside groups and repeaters as references, and `Blocks` drops its own conversion ([folkloreinc/laravel-panneau#117](https://github.com/folkloreinc/laravel-panneau/issues/117)).
- **Migration (started):** guide, codemods for JS (`@panneau/codemods`, [#129](https://github.com/folkloreinc/panneau-js/issues/129)), Rector rules for PHP, tried on the contests platform's admin (custom fields, pages and controllers) before 5.0. Done: the guide ([migration.md](migration.md)), the codemods, and `panneau:install --upgrade` with its `--check` audit and Rector rules ([folkloreinc/laravel-panneau#114](https://github.com/folkloreinc/laravel-panneau/issues/114), [#115](https://github.com/folkloreinc/laravel-panneau/issues/115)). They are being tried on urbania.media. Left: the contests platform's admin.

## 5.0.0 (to do)

- Both repositories release 5.0.0 on the same day.
- The `v5.x` branches become the default branches on GitHub.
- The first client projects migrate (see [migration.md](migration.md)).

## 5.x

Minor releases, each one additive:

- **Image editing (done in phase 2):** crop, rotate, flip and focal point. Edits are non-destructive and rendered through `laravel-image` ([#100](https://github.com/folkloreinc/panneau-js/issues/100), [decisions/0031](decisions/0031-image-editor-and-image-field.md)).
- **Media library:** conversions, tags, search, usage tracking. Depends on the `laravel-mediatheque` roadmap.
- **Home page:** dashboards with widgets (stats, charts, recent items, shortcuts, custom), defined per project and per role.
- **Global search (done in phase 2):** a "Go to…" command palette (⌘K) ([#97](https://github.com/folkloreinc/panneau-js/issues/97), [decisions/0029](decisions/0029-go-to-palette.md)): recent items, navigation, create, commands of plugins and results of `GET /search` grouped by resource. Then the `limit` and `resources` parameters, the `422` and `429` problems, conformance checks and a scope per resource ([decisions/0030](decisions/0030-search-parameters-and-scope.md)), and `laravel-panneau`'s endpoint, on Laravel Scout when the model is searchable ([folkloreinc/laravel-panneau#96](https://github.com/folkloreinc/laravel-panneau/issues/96)). Recent items on the server are set aside for now.
- **AI agents (MCP):** an MCP server that lets an AI assistant work in a Panneau, authenticated as its user.
    - Its tools come from the definition and the protocol: list, search, show, create and update the items of a resource, and run its actions, with a dry run first for those that change or delete items.
    - The agent signs in with OAuth as the user, as the MCP specification describes: it acts with the user's abilities and the backend's policies, and the user can revoke it.
    - It lives in `laravel-panneau`. The tools are built once from the definition, with Laravel's JSON Schema builder. `laravel/mcp` serves them to outside AI clients, signed in with OAuth 2.1 (Passport) or a Sanctum token. The Laravel AI SDK (`laravel/ai`) uses the same tools for an assistant inside Panneau, with its answers streamed to a panel of the app.
    - A decision record sets the tools, their names and their limits when the work starts.
- **Preview:** component previews and iframe previews of the real site fed with unsaved values.
- **Drafts and revisions:** per resource.
- **Collaboration:**
    - presence ("Marie is editing this page");
    - optional realtime collaboration with Yjs (`@panneau/collab`), first on rich text fields and then on whole forms.

## Open questions

Decided later, each in its own decision record:

- **Supported PHP and Laravel versions for 5.x.** Decided: PHP 8.3+ and Laravel 12+ (`laravel-panneau/docs/decisions/0006-supported-versions.md`).
- **Prebuilt bundle.** Should `laravel-panneau` ship a prebuilt `@panneau/app` bundle, so simple sites need no JS build? Custom fields would still need a project build.
- **Where the Folklore plugin's JS lives.** Decided: it has none. Its fields are PHP on the built-in types ([laravel-folklore's decision 0018](https://github.com/folkloreinc/laravel-folklore/blob/v2.x/docs/decisions/0018-panneau-plugin-php-only.md)).
- **A Node reference backend.** Not planned for 5.0. Node sites implement the protocol themselves and use the conformance kit.
- **Router.** Keep `wouter`, or support the host app's router through an adapter only.
