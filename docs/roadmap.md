# Roadmap

Tracking issue: [#6](https://github.com/folkloreinc/panneau-js/issues/6). Laravel side: [folkloreinc/laravel-panneau#35](https://github.com/folkloreinc/laravel-panneau/issues/35).

Each item becomes a sub-issue of #6 (or of laravel-panneau#35) when work on it starts. Work happens on the `v5.x` branch of both repositories, through pull requests. Pre-releases are tagged `5.0.0-alpha.N` and then `5.0.0-beta.N`.

## Phase 0: Foundations

Goal: a branch where every change is tested and released properly, plus a written contract.

**`panneau-js`**

- GitHub Actions CI: build, type check, lint, unit tests, Storybook tests.
- TypeScript `strict`, a working ESLint config, Vitest and Testing Library.
- Changesets: real semver, generated CHANGELOG, publishing from CI only, from `v5.x` only.
- Package consolidation (about a dozen packages, subpath exports) and API reports to catch breaking changes in review.
- Remove dead code and dependencies (Google Maps, fonts, tracking, event emitter, duplicate date and icon libraries).

**`@panneau/protocol`**

- Definition JSON Schema and TypeScript types.
- OpenAPI spec of the API.
- Conformance kit.

**`laravel-panneau`**

- GitHub Actions CI with a PHP × Laravel matrix, Pint, Larastan, PHPUnit and Testbench.
- Supported PHP and Laravel versions.

## Phase 1: Core (5.0 alphas)

Goal: the pieces work on their own, and Niche can start using them.

- **Design tokens, themes** (light, dark, Bootstrap-compatible) and **accessible primitives**.
- **Fields as controlled components.** All the v4 field types are kept, reworked onto the new types listed in [protocol.md](protocol.md).
- **Engine:**
    - plugin registry;
    - definition to form and list;
    - form state behind a store interface.
- **Forms:**
    - **Layout:** rows, columns, sections, tabs, sidebar, conditional visibility.
    - **Validation and errors:** client validation with the portable rules; server errors mapped to fields, an error summary, a scroll to the first error, error badges on tabs.
    - **Unsaved changes:** guards on navigation.
    - **Error boundaries** and toasts.
- **Concurrency:** item versions, `If-Match`, a conflict dialog.
- **Data:** `DataAdapter` interface, REST adapter with a Laravel preset, query hooks.
- **Laravel:**
    - definition builders and the definition endpoint;
    - generic resource API, with Policies and abilities;
    - problem+json errors and contract tests;
    - `panneau:install`.
- **Niche pilot.** Niche's first screens (members, media, content metadata) are built with the 5.0 alphas. What doesn't fit becomes an issue here.

## Phase 2: App and content (5.0 betas)

Goal: a complete admin panel, ready for client projects.

**Pilot: the contests platform.** Folklore's contest platform (multi-tenant, with internal, agency and client users) moves its whole admin to the 5.0 betas, one item at a time, starting with the app shell. Niche keeps pulling what its product needs from this phase. What doesn't fit becomes an issue here, labelled `contests`.

**The interface is worked on in parallel.** The look and the interactions of the app (shell, sidebar, pages) are designed on the playground (`npm run playground`), at the same time as the contests platform migrates, instead of waiting for each of its slices.

- **App shell:** routing, layout, menus, replaceable pages, error pages.
    - First version: a sidebar from the `main` menu, collapsible to a rail of icons, with the page on a raised panel as in recent browsers, a drawer on small screens, and themable through the `shell` and `sidebar` component tokens. Home, list, create, edit, plugin and not found pages.
    - **Show page:** the show route opens the item's details in a panel next to its list: its values, a link to edit it, and its `link` actions, such as its page on the site ([decisions/0028](decisions/0028-item-panel.md)). It shows the item's preview when its resource has one: a plugin component, or its page on the site in an iframe.
- **Auth:**
    - password login, password reset, 2FA, passkeys, email verification;
    - OAuth providers (continues [#5](https://github.com/folkloreinc/panneau-js/issues/5) and laravel-panneau#34);
    - the `external` mode for sites with their own auth;
    - account page.
- **Permissions:** abilities in the UI; an optional roles module on the Laravel side.
- **Lists:**
    - sorting, filters (with active filter chips), column choice;
    - inline editing, layouts (table, cards, gallery, calendar), bulk actions;
    - remembered view per user.
- **Actions:**
    - built-in and custom actions, with parameters and confirmation;
    - selection by query (every matching item);
    - per-item results;
    - queued runs with progress and a notification area.
- **Rich text:** TipTap 3 field (HTML storage by default, ProseMirror JSON as an option).
- **Media:** media fields and a basic library on the protocol's media API; `laravel-mediatheque` adapter.
- **Folklore plugin:** Pages, Blocks and PageSlug fields with their JS, shipped by `laravel-folklore`.
- **Migration:** guide, codemods for JS, Rector rules for PHP, tried on the contests platform's admin (custom fields, pages and controllers) before 5.0.

## 5.0.0

- Both repositories release 5.0.0 on the same day.
- The `v5.x` branches become the default branches on GitHub.
- The first client projects migrate (see [migration.md](migration.md)).

## 5.x

Minor releases, each one additive:

- **Image editing:** crop, rotate, flip and focal point. Edits are non-destructive and rendered through `laravel-image`.
- **Media library:** conversions, tags, search, usage tracking. Depends on the `laravel-mediatheque` roadmap.
- **Home page:** dashboards with widgets (stats, charts, recent items, shortcuts, custom), defined per project and per role.
- **Global search:** a "Go to…" command palette (⌘K), started in Phase 2 ([#97](https://github.com/folkloreinc/panneau-js/issues/97), [decisions/0029](decisions/0029-go-to-palette.md)): recent items, navigation, create, commands of plugins and results of `GET /search` grouped by resource. Then the `limit` and `resources` parameters, the `422` and `429` problems, conformance checks and a scope per resource ([decisions/0030](decisions/0030-search-parameters-and-scope.md)), and `laravel-panneau`'s endpoint, on Laravel Scout when the model is searchable ([folkloreinc/laravel-panneau#96](https://github.com/folkloreinc/laravel-panneau/issues/96)). Later: recent items on the server.
- **Preview:** component previews and iframe previews of the real site fed with unsaved values.
- **Drafts and revisions:** per resource.
- **Collaboration:**
    - presence ("Marie is editing this page");
    - optional realtime collaboration with Yjs (`@panneau/collab`), first on rich text fields and then on whole forms.

## Open questions

Decided later, each in its own decision record:

- **Supported PHP and Laravel versions for 5.x.** PHP 8.3+ and Laravel 12+ are proposed; see `laravel-panneau/docs/decisions`.
- **Prebuilt bundle.** Should `laravel-panneau` ship a prebuilt `@panneau/app` bundle, so simple sites need no JS build? Custom fields would still need a project build.
- **Where the Folklore plugin's JS lives.** In `laravel-folklore` (published to npm, like `laravel-image`), or in `panneau-js`.
- **A Node reference backend.** Not planned for 5.0. Node sites implement the protocol themselves and use the conformance kit.
- **Router.** Keep `wouter`, or support the host app's router through an adapter only.
