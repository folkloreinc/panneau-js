# 0019: The app entry: boot config, mount function and client routes

- Status: accepted
- Date: 2026-10-15

## Context

`laravel-panneau` renders the page of the admin panel (a Blade view) and writes the project's JS entry with `panneau:install`. Both need a contract with `@panneau/app` before the shell of Phase 2 exists:

- how the entry mounts the app, and what it imports;
- what the page gives to the app, and in what form;
- which URLs the app handles, so the backend can serve the page for them;
- what happens when the session ends;
- which npm packages and Vite plugins a project needs.

The entry file belongs to the project once written, so this contract must not change during 5.x.

## Decision

### Mount function

`@panneau/app` exports `createPanneauApp()`. The project's entry is a few lines, where it adds its plugins:

```ts
import { createPanneauApp } from '@panneau/app';

createPanneauApp({ element: document.getElementById('panneau')!, plugins: [] });
```

| Option           | Default                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| `element`        | Required: the element the app renders in                                         |
| `plugins`        | None                                                                             |
| `config`         | The boot config of the page (below)                                              |
| `adapter`        | `createLaravelAdapter({ baseUrl: config.apiBaseUrl })` (`@panneau/data/laravel`) |
| `queryClient`    | A new TanStack Query client                                                      |
| `onUnauthorized` | Sends the browser to the login URL (below)                                       |

- **The Laravel adapter is the default,** since `laravel-panneau` is the reference backend. Other backends pass `adapter`.
- **`createPanneauApp()` throws** when the boot config is missing or invalid, with the invalid paths.
- **React apps** that render the panel themselves (a Next.js site) use `<Panneau config={…} />`, with the same options except `element`. `config` is required there, and `readBootConfig()` reads it from the page.

### Boot config

The server writes one JSON object in the page, and the app reads it itself, so the entry doesn't parse anything:

```html
<div id="panneau"></div>
<script type="application/json" id="panneau-boot">
    {"protocol":1,"apiBaseUrl":"/panneau/api","basePath":"/panneau","locale":"fr","definition":{…}}
</script>
```

- **A JSON `<script>`** rather than a `data-` attribute: the definition can be large, and JSON needs no attribute escaping. The server escapes `<`, `>` and `&` (Blade's `@json` does), so the content can't close the element.
- **Outside the root element:** React replaces the content of `element`.
- **The schema is in `@panneau/protocol`:** `BootConfig`, `validateBootConfig()`, and the generated `@panneau/protocol/boot.schema.json`, so backends test the page they render. See [protocol.md](../protocol.md#boot-config).

| Property     | Required | Content                                                                                          |
| ------------ | -------- | ------------------------------------------------------------------------------------------------ |
| `protocol`   | yes      | `1`                                                                                              |
| `apiBaseUrl` | yes      | URL of the API. The app fetches `{apiBaseUrl}/definition` and makes every call there             |
| `basePath`   | yes      | Path of the app (`/panneau`, or `/` on its own domain)                                           |
| `locale`     | yes      | Locale of the UI before the definition loads                                                     |
| `definition` | no       | The definition for the current user ([0004](0004-definitions-are-data.md)), for the first render |
| `loginUrl`   | no       | Where to send users when `GET /definition` answers `401`, before the definition is known         |

- **Inlined definition.** The app renders from it and skips the first `GET /definition`. The definition query never goes stale by itself: it is refetched when it is invalidated (login, logout, locale change). Without it, the app shows a loading state and fetches it.
- **No CSRF token.** The Laravel adapter reads it from the `XSRF-TOKEN` cookie.
- **The page sets its own `<title>` and `<html lang>`.**
- Unknown properties are kept, so the boot config can grow within protocol version 1.

### Client routes

The app uses **history mode** (`history.pushState`), without a hash. Links are real URLs, so they can be opened in a new tab or reloaded. All routes are under `basePath`:

| Path                                        | Page                                                   |
| ------------------------------------------- | ------------------------------------------------------ |
| `{basePath}`                                | Home: `pages.home` of the definition, or the dashboard |
| `{basePath}/resources/{resource}`           | List of a resource                                     |
| `{basePath}/resources/{resource}/create`    | Create form                                            |
| `{basePath}/resources/{resource}/{id}`      | Show page                                              |
| `{basePath}/resources/{resource}/{id}/edit` | Edit form                                              |
| `{basePath}/pages/{page}`                   | A page of the definition's `pages`                     |

- **Path segments are URL-encoded,** since ids are opaque. `create` is not a valid item id in URLs.
- **The query string of a list** is its query, in the protocol's format (`?page=2&sort=-published_at&filter[status]=draft&q=été`). Lists keep it in the URL through the `Router` of `@panneau/core`.
- **Reserved first segments,** for the pages of Phase 2 and 5.x: `resources`, `pages`, `media`, `search`, `account` and `auth` (the login, password reset and two-factor pages of the `panneau` auth mode). Other paths under `basePath` show the app's "not found" page.
- **The backend serves the page for every path under `basePath`,** except the API and the routes it registers itself. `laravel-panneau` registers a catch-all `GET {path}/{any?}` last, excluding `api/*`.

### Unauthenticated users

When an adapter call rejects with an `UnauthorizedError` (`401`, or `419` with the Laravel adapter), the session has ended:

1. The app shows that the session ended, with a link to the login URL if there is one.
2. It calls `onUnauthorized({ loginUrl })` once. The default sends the browser to `loginUrl` (`window.location.assign()`) when it isn't `null`.

`loginUrl` is:

- in `external` auth mode, `auth.loginUrl` of the definition;
- before the definition is loaded (the `GET /definition` itself answered `401`), `loginUrl` of the boot config;
- in `panneau` auth mode, `null`: the login page is part of the app (Phase 2).

The app adds no return URL, since the protocol has none. A backend that wants one puts it in `auth.loginUrl`. For page loads, the backend redirects guests itself (with Laravel, `redirect()->guest()` keeps the intended URL).

### CSS and themes

- **The entry imports no CSS.** Each package's built modules import their own CSS files (CSS Modules, and the app's base stylesheet scoped to its root element, per [0005](0005-styling-and-theming.md)), so the project's bundler only includes what is used. The shared build keeps these imports from the first package that ships CSS (`@panneau/ui`). Until then, no package ships CSS.
- **Themes are not imported either.** They come from plugins (`themes`), selected by the definition (`theme`). The Bootstrap-compatible theme is a plugin.

### npm packages and Vite

| Package                       | In                | Why                                                              |
| ----------------------------- | ----------------- | ---------------------------------------------------------------- |
| `@panneau/app`                | `dependencies`    | The app. It brings the other `@panneau/*` packages it needs      |
| `react`, `react-dom`          | `dependencies`    | Peer dependencies (`^19.2.0`)                                    |
| `@tanstack/react-query`       | `dependencies`    | Peer dependency (`^5`), shared with the project's own components |
| `@vitejs/plugin-react`        | `devDependencies` | JSX and Fast Refresh (`@viteReactRefresh` in Blade)              |
| `vite`, `laravel-vite-plugin` | `devDependencies` | Already in Laravel projects                                      |

- **Not needed:** the React Compiler and Babel (packages are compiled when built), and TypeScript (Vite strips types from `.tsx` entries). Projects that typecheck add `typescript`, `@types/react` and `@types/react-dom`.
- **Peer dependencies are listed explicitly,** although npm installs them, so the project controls their versions. When `@panneau/ui` adds React Aria Components as a peer dependency, the install step adds it too.
- **Versions.** Until 5.0.0, v5 packages are prereleases on the `alpha` (then `beta`) dist-tag, while `latest` is v4. Install them with an explicit range, `^5.0.0-alpha.0`, never as plain `@panneau/app`. All `@panneau/*` packages share one version.

## Consequences

- `laravel-panneau` can build its page, its catch-all route, its install step and their tests now, and validate the page against `boot.schema.json`.
- The shell of Phase 2 replaces the placeholder behind the same entry: projects don't change their entry file.
- `@panneau/app` depends on `@panneau/data/laravel`, a few lines, even for projects with another backend.
- Adding a boot property is additive. Renaming one, or a route, needs a new decision and a major release.
