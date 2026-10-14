# Current state (October 2026)

This audit describes Panneau before version 5. Sources:

- `panneau-js` at v4.1.1, on the `v4.0` branch;
- `laravel-panneau` at v1.4.0, on the `v1.4` branch;
- the projects inventory of `folkloreinc/folklore-dev`.

The Laravel side is audited in more detail in [`laravel-panneau/docs/current-state.md`](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/current-state.md).

## The main issue: no written contract

`panneau-js` and `laravel-panneau` don't depend on each other. They agree on a definition format and an HTTP API that are not documented anywhere, and they have drifted apart:

- **What PHP doesn't send.** The JS definition type accepts `pages`, `menus`, `auth`, `theme`, `forms` and `fields`. The PHP `Definition` never emits them.
- **What PHP doesn't provide.** The JS data layer calls routes that `laravel-panneau` doesn't have:
    - uploads;
    - the whole `medias/*` API;
    - `auth/check`, `auth/register`, `auth/password/*`;
    - `account/*`;
    - `restore`.
- **What breaks.** `clone` redirects to a route that doesn't exist, while the JS expects JSON.
- **Assumptions about Laravel:**
    - pagination uses `page` and `last_page`, in a custom format that is not Laravel's paginator;
    - errors use Laravel's 422 format, and 419 (CSRF) and 401 trigger `onUnauthorized`;
    - CSRF tokens go in the `X-XSRF-TOKEN` header and the `_token` field;
    - `_method` overrides the HTTP verb.

Projects fill the gaps themselves. The `laravel-panneau` generator of `generator-folklore` writes about 60 files into each project. These are nearly identical across projects, and they drift over time:

- `HomeController`, `AccountController`, `UploadController`, `PanneauPolicy`, `AppComposer`;
- the Blade views;
- a `PanneauServiceProvider` that always sets the same three resolvers.

## panneau-js v4

### Structure

- **117 packages**, versioned together by Lerna. Each top-level folder holds one-component packages: `actions/`, `displays/`, `elements/`, `fields/`, `filters/`, `forms/`, `lists/`, `modals/`. `packages/` holds the infrastructure and one aggregator per category.
- **Builds:** ESM only (Rollup, Babel with the React Compiler, `.d.ts` bundled).
- **Code:** 90% TypeScript, but with `strict: false` and loose types (`[key: string]: unknown` index signatures, untyped `opts`).
- **React:** 19.2 only. Routing uses `wouter` and `@folklore/routes`; data uses TanStack Query v5 and `@folklore/fetch`.
- **Bootstrap:** `Container` nests about 16 providers.
- **Components:** a namespaced registry (`ComponentsManager`) resolves component names (`'date-time'` → `DateTime`).

### Features

- **Fields:**
    - `text`, `email`, `password`, `telephone`, `textarea`, `number`, `url`, `color`;
    - `date`, `date-time`, `time`;
    - `select`, `autocomplete`, `checkboxes`, `radios`, `toggle`, `toggles`;
    - `html` (CKEditor 5), `embed`, `display`, `input-group`;
    - `fields`, `item`, `items`, `localized`, `resource-item`;
    - `import`;
    - media fields: `media`, `image`, `video`, `audio`, `document`, `font`, and their `*-upload` variants.
- **Forms:**
    - Layouts are normal, horizontal, inline or two-pane (with a preview).
    - Validation is server-side only (422).
    - `useForm` is reimplemented in core; `@folklore/forms` is declared but never imported.
- **Lists:**
    - Layouts are table, cards or calendar.
    - Filters, sorting by URL query, pagination, selection and bulk actions.
    - No inline editing.
- **Medias:**
    - Uploads go through Uppy v5 (xhr, tus or Transloadit).
    - The media browser and picker support trash and tags.
    - No image editing.
- **Rich text:** a minimal CKEditor 5 build with bold, italic, links and lists. Uploads and embeds are commented out.
- **Auth:**
    - There are two sets of endpoints that don't match: `packages/auth` calls `auth/*`, while `forms/auth` posts to Fortify's URLs.
    - Only the login page is wired. The 2FA forms are not routed, the account page is a stub, and there are no passkeys.
- **Styling:**
    - Bootstrap 5 is imported globally, plus CSS Modules.
    - There are two icon systems (Bootstrap Icons, FontAwesome) and two date libraries (`date-fns`, `dayjs`).
- **i18n:** react-intl with hashed ids, in French and English.

### Quality

- **Tests:**
    - no unit, integration or end-to-end tests;
    - 120 Storybook stories, with a mock Express API that is the closest thing to a spec of the API;
    - the a11y addon is installed but not enabled;
    - the `lint` script doesn't run with ESLint 10.
- **Releases:**
    - every publish bumps the patch version, giving 1,043 tags (324 for v3.0 alone);
    - no CHANGELOG and no README;
    - `lerna.json` still allows publishing from old branches.
- **Dead code in core:**
    - Google Maps, fonts, tracking, panels, `EventsManager`, `validateFields`;
    - it pulls in `webfontloader`, `wolfy87-eventemitter`, `@folklore/tracking` and `tinycolor2` for nothing.

## How projects use Panneau

There are 18 active projects using Panneau directly. All of them require dev branches (`v1.3.x-dev`, `v1.4.x-dev`), never tags. The detailed list lives in Folklore's internal projects inventory.

| Combination                    | Active projects |
| ------------------------------ | --------------- |
| `laravel-panneau` v1.4 + JS v4 | 3               |
| v1.3 + v4                      | 4               |
| v1.3 + v3 (React 18)           | 5               |
| v1.3 + v2                      | 1               |
| Other (older lines, JS only)   | 5               |

Other users of `@panneau/*`:

- **`micromag-js`** uses it as a component library (fields, modals, medias and about 12 element packages). It reaches about 15 Micromag sites.
- **`niche-js`** is frozen.

### Recurring patterns and pain points

1. **Boilerplate generated per project**, as described above.
2. **Fields without their JS.** The `PageSlug` field of `laravel-folklore` has no JS component in `panneau-js`, so 8 projects ship their own copy.
3. **Blade views overridden** in every project, to load the site's bundle.
4. **Custom controllers repeat the same overrides.** `getResourceFromRequest` and `getIndexQueryFromRequest` are overridden 38 times each. Custom actions are hand-named routes in `routes/panneau.php`.
5. **Pages, menus and auth injected from outside the package**, by wrapping `Definition` or by merging into the definition in JS. A Google login means re-declaring routes and replacing the login page.
6. **Projects reach into the internals:**
    - `@panneau/core/contexts` hooks and namespace constants;
    - `MainLayout` and `ResourceItemsList` from `@panneau/app`.
7. **Granular packages.** Projects keep scripts that update 6 to 10 `@panneau/*` packages by hand.
8. **Heavy customization.** The largest project has 37 resources, 122 custom fields, 22 controllers and a wrapped `Definition`. Another has 78 field classes.

## Niche

Niche is URBANIA's upcoming content platform (Laravel 13, React 19). Its frontend has not started yet, and it plans to use `@panneau/*`.

Its stack:

- React 19 with the React Compiler, TanStack Query, react-intl and Bootstrap;
- an OpenAPI spec written first, with generated types;
- strict TypeScript and Vitest.

Its needs:

- **Multi-tenant**, with a Policy checked on every action.
- **Opaque public ids** (prefixed ULIDs), never sequential ids.
- **Field definitions are data** stored in the database, not PHP classes.
- **Its own scoped media API.**
- **Its own rich text editor** (TipTap 3, Yjs).

Niche records the limits it finds in the Folklore packages. For Panneau:

- forms and lists are tightly coupled to the PHP definition format;
- `@panneau/*` has undeclared transitive dependencies;
- routes are enabled by default without middleware.
