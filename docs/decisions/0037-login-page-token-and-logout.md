# 0037: The login page of the app, a login with a token, and the logout

- Status: accepted
- Date: 2026-10-30
- Issues: [#136](https://github.com/folkloreinc/panneau-js/issues/136), [#137](https://github.com/folkloreinc/panneau-js/issues/137)
- Changes: what the app does when the session ends in `panneau` mode, in [0019](0019-app-entry.md); the login of [0012](0012-authentication.md), which assumed an email and a password

## Context

In `panneau` auth mode, the login page is part of the app ([0012](0012-authentication.md), [0019](0019-app-entry.md)), but the app had none: when the API answered `401`, it said that the session had ended, with nothing to do. Nothing called `DataAdapter.logout()` either: the shell had no logout.

A backend that isn't Laravel can log in another way. Eclair's dashboard logs in with the server's admin token, not an email and a password: it rendered its own login page before mounting the app, and passed the token as `password`, with an empty `email`, since `LoginCredentials` required both.

The login page shows before the user is known, when `GET /definition` answers `401`: it can't take its settings from the definition.

## Decision

### The login page

- **In `panneau` mode, the app shows its login page when the API answers `401`,** in place of the page, at the URL the user was on. After the login, it fetches the definition and shows that page. A user whose session ended in the app is told so; a guest who just arrived isn't.
    - `onUnauthorized` is still called, with `loginUrl: null`.
    - No client route yet: `{basePath}/auth/…` stays reserved for the pages that need their own URL (password reset, two-factor challenge).
- **The boot config gets `auth`,** the `auth` of the definition, so the page knows which logins to offer before the definition. The app uses the definition's once it has it.
- **What the page offers comes from `auth`:**
    - an email and a password, when `auth.password` is true, or when neither `password` nor `token` is set;
    - **a token,** when `auth.token` is set: one secret field, with its `label` (default "Token") and `help`. It is sent as `{ "token": "…" }` to `POST /auth/login`. It covers any login with a single secret: an access token, a code;
    - a link for each OAuth provider that has a `url`.

    Between two of them, "or". Errors of the backend show under the field they name (`422` with `errors`), the others above the form.

- **The page is in `@panneau/app` until `@panneau/auth` starts** ([0003](0003-layers-and-packages.md)), with the password reset, two-factor and passkeys pages. It isn't exported yet.

### Credentials

`LoginCredentials` of `@panneau/data` is `PasswordCredentials | TokenCredentials`: `{ email, password, remember? }` or `{ token, remember? }`. The request body of `POST /auth/login` in `openapi.json` is one of them.

### Logout

The sidebar has a "Log out" button next to the appearance's, when the app can log out:

- **`panneau` mode:** the app calls `DataAdapter.logout()` (`POST /auth/logout`), forgets everything it loaded for the user (the cache of its queries, the inlined definition), and shows the login page. A `401` answer counts as logged out. Another error keeps the user in, with a toast.
- **`external` mode:** the browser goes to `auth.logoutUrl`, the site's own logout, a new optional property of `auth`. The site logs out as it does for its own users (a route that logs out and redirects, the logout of an identity provider). Without it, there is no button.

Unsaved changes ask first, as when leaving the page.

## Consequences

- A backend in `panneau` mode writes `auth` in the boot config, and serves the page of the app to guests instead of redirecting them: the app shows the login page. `laravel-panneau` follows, with `auth.logoutUrl` in `external` mode.
- Adapters that implement `login()` take the union: a breaking change of the type for custom adapters, in the alphas.
- Eclair's dashboard drops its own login page and its `sign-out` page.
- The two-factor answer of `POST /auth/login` (`202`) isn't handled by the page yet; it comes with the two-factor challenge.
