# Architecture

Status: accepted direction for Panneau 5. Details will change as the work lands. Decisions are recorded in [decisions/](decisions/).

## Overview

Panneau 5 is built as independent layers. The full admin app is only one way to assemble them.

```
                ┌──────────────────────────────────────────────┐
  full admin →  │ @panneau/app   shell: routes, layout, auth,  │
                │                dashboard, search, media      │
                ├──────────────────────────────────────────────┤
  definition →  │ @panneau/core  engine: plugins, definition → │
  driven        │                forms and lists, validation   │
                ├───────────────────────┬──────────────────────┤
  pieces     →  │ @panneau/fields,      │ @panneau/data        │
                │ forms, lists, ui      │ adapter interface,   │
                │ (controlled, no fetch)│ REST adapter         │
                ├───────────────────────┴──────────────────────┤
  contract   →  │ @panneau/protocol  definition schema,        │
                │                    OpenAPI, conformance kit  │
                └──────────────────────────────────────────────┘
                                     ▲
                                     │ HTTP (protocol)
                ┌────────────────────┴─────────────────────────┐
                │ laravel-panneau (reference) │ any backend     │
                └──────────────────────────────────────────────┘
```

Each layer only depends on the layers below it. A project picks the highest layer that fits:

| Project                                        | Uses                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Client site that needs a complete admin panel  | `laravel-panneau` + `@panneau/app`                                                  |
| Laravel site with a few custom admin screens   | `laravel-panneau` + `@panneau/core` + `@panneau/forms`/`lists` inside its own pages |
| Product with its own API and interface (Niche) | `@panneau/fields`, `forms`, `lists`, `ui`, plus its own data adapter or none        |
| Node site (Next.js or another)                 | `@panneau/app` or the pieces, against a backend that implements the protocol        |

## Layers

### Protocol (`@panneau/protocol`)

The contract between frontend and backend. See [protocol.md](protocol.md).

- **Definition schema:** JSON Schema plus TypeScript types for the definition (resources, fields, layouts, lists, actions, pages, menus, auth, dashboard).
- **HTTP API:** an OpenAPI document for resources, media, auth, search and dashboards, with its query conventions, errors and concurrency rules.
- **Conformance kit:** fixtures and checks that any backend can run against its own responses. `laravel-panneau` runs them in its test suite.
- **Versioning:** the protocol carries its own version (`protocol: 1`). It follows the same compatibility rules as the packages (see [decisions/0013](decisions/0013-public-api-and-stability.md)).

### UI primitives (`@panneau/ui`, `@panneau/fields`, `@panneau/forms`, `@panneau/lists`)

Components that work without a definition, a router or a network.

- **Fields** are controlled components: `value`, `onChange`, `errors`, `disabled`, plus field-specific props. Any React app can use `<TextField>` or `<MediaField>` directly.
- **Forms** render a list of fields and a layout tree, and handle values, errors and dirty state. They don't save anything themselves; the caller passes `onSubmit`.
- **Lists** render items with columns, layouts (table, cards, gallery, calendar), selection, sorting and filter controls. Items and query state come from props.
- **UI** provides the design tokens and accessible primitives (buttons, dialogs, menus, popovers, tabs, toasts), built on React Aria. Components ship CSS Modules and read CSS variables. They don't import any global CSS (see [decisions/0005](decisions/0005-styling-and-theming.md)).

### Engine (`@panneau/core`)

Turns a definition into working forms and lists, and is the extension point.

- **Plugin registry.** Plugins provide field types, displays, list layouts, actions, pages, widgets, locales and themes. They replace the namespaced `ComponentsManager` and the deep imports of `@panneau/core/contexts`.
- **Definition engine.** It resolves a resource into:
    - its form, from fields plus layout;
    - its list, from columns, filters, sorts and actions;
    - its abilities.
- **Form state.** Values, dirty tracking, nested and localized values, client validation with the portable rules, mapping of server errors, and unsaved-changes guards. Behind a store interface, so a realtime store (Yjs) can replace the local one later.
- **List state.** Query (filters, sort, page), synchronized with the URL when a router is present.

`@panneau/core` doesn't render any UI. It provides hooks and providers.

### Data (`@panneau/data`)

- **`DataAdapter` interface.** A typed interface for everything the engine and app need from a backend: `list`, `get`, `create`, `update`, `delete`, `runAction`, media, auth, search and widgets.
- **REST adapter.** Implements the protocol over `fetch`. `laravel-panneau` needs no other adapter.
- **Custom adapters.** A product with its own API (Niche) writes an adapter, or calls its API directly and only uses the UI layer.
- **Query hooks.** TanStack Query hooks on top of the adapter (`useResourceList`, `useResourceItem`, mutations with invalidation).

Laravel specifics (CSRF tokens, the `419` status) live in a small Laravel preset of the REST adapter, not in the protocol.

### App (`@panneau/app`)

The complete admin panel:

- routing and layout;
- navigation from `menus`;
- resource pages (index, create, edit, show);
- auth pages and account page;
- home dashboard, global search, media library;
- error pages.

Every page can be replaced through a plugin, and the building blocks (layout, page header, resource form, resource list) are exported as public API.

### Feature packages

Heavier features live in their own packages, so projects only load what they use:

| Package           | Content                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `@panneau/editor` | Rich text field built on TipTap 3                                                               |
| `@panneau/media`  | Media library, upload (Uppy), image editing (crop, rotate, focal point)                         |
| `@panneau/auth`   | Auth forms and flows: login, OAuth providers, password reset, 2FA, passkeys, email verification |
| `@panneau/intl`   | UI translations (French, English) and the locale loading helpers                                |
| `@panneau/collab` | (5.x) Presence and realtime collaboration through Yjs                                           |

## Packages

Panneau 5 has about a dozen packages instead of 117. Fine-grained imports go through subpath exports, so a project that only needs one field doesn't load the others:

```ts
import { createRestAdapter } from '@panneau/data';
import { TextField } from '@panneau/fields/text';
import { Form } from '@panneau/forms';
```

Anything not reachable from a package's `exports` map is internal. See [decisions/0003](decisions/0003-layers-and-packages.md). The target list of packages, with the allowed dependencies of each, is in [packages.md](packages.md).

## Definitions

A definition is plain JSON that validates against the protocol schema. It can be written by:

- **PHP builders in `laravel-panneau`:** `Resource` classes and field builders.
- **TypeScript builders** in `@panneau/protocol`, for Node backends and for tests:

    ```ts
    defineResource({ id: 'pages', fields: [text('title').required()] });
    ```

- **Code that turns data into a definition.** Niche, for example, builds forms from field definitions stored in its database.

The app loads the definition from an endpoint (`GET /definition`). A server can also inline it in the page for the first render. See [decisions/0004](decisions/0004-definitions-are-data.md).

## Extension

A plugin is one object that bundles what a feature adds:

```ts
export default definePlugin({
    id: 'folklore-pages',
    fields: { 'page-slug': PageSlugField },
    displays: { 'page-slug': PageSlugDisplay },
    locales: { fr: () => import('./lang/fr.json') },
});
```

Plugins are passed to the app (`<Panneau plugins={[...]}>`) or to `PanneauProvider` when only the pieces are used. A Laravel package can ship a PHP field and its JS plugin together. The `laravel-folklore` Pages, Blocks and PageSlug fields are the first case.

- **Themes:** sets of design tokens (CSS variables), with light and dark schemes. A Bootstrap-compatible theme maps Panneau's tokens to Bootstrap's variables, for sites that use Bootstrap.
- **Locales:** plugins can add locales or override messages. Resource names and field labels come from the definition, already translated by the backend.

## Cross-cutting concerns

- **Validation.** Portable rules in the definition are checked in the browser and translated to server rules by `laravel-panneau`. The server is always authoritative. See [decisions/0006](decisions/0006-validation-and-errors.md).
- **Errors.** API errors use `application/problem+json`, with field errors for validation. Error boundaries wrap pages, list rows and fields, so one broken component doesn't take the page down.
- **Concurrency.** Items carry a version. Updates send `If-Match`, and a `412` response opens a conflict resolution dialog. See [decisions/0008](decisions/0008-realtime-and-concurrency.md).
- **Permissions.** The backend sends abilities with the definition (per resource) and with each item. The UI hides or disables actions accordingly. The backend still enforces them. See [decisions/0011](decisions/0011-permissions.md).
- **Actions.** Operations on one item, a selection (including every item matching the list query) or a whole resource, with optional parameters, per-item results and long-running runs. One concept covers built-in actions (show, edit, duplicate, delete, restore, export, import) and project actions. See [decisions/0017](decisions/0017-actions.md).
- **Accessibility.** Primitives come from React Aria. The CI runs axe checks on Storybook stories.
- **Internationalization.** UI messages use react-intl. Content fields can be `localized`, with values keyed by locale.

## Technical baseline

- **Runtime:** React 19.2 or later (peer dependency), with the React Compiler in the build. Node 24 for development and CI, following the workspace rules.
- **Language and output:** TypeScript `strict`, ESM only, with type declarations.
- **Data and routing:**
    - TanStack Query v5 as a peer dependency, declared explicitly;
    - routing stays `wouter`, behind a small router interface, so the app can run inside a host router.
- **Tests:** Vitest and Testing Library for units; Storybook 10 with interaction and a11y tests; Playwright against the Laravel reference app. See [decisions/0014](decisions/0014-testing.md).
- **Build and tooling:**
    - TypeScript 6, until typescript-eslint supports TypeScript 7.
    - Vite in library mode (one file per module, ESM), with the React Compiler through Babel.
    - ESLint with typescript-eslint `strict`, and Prettier.
    - Changesets with one shared version.

    The shared build config is `config/vite.package.ts`. See [decisions/0018](decisions/0018-new-packages-next-to-v4.md) for how v5 packages live next to the v4 code.
