# 0048: Password reset and email verification

- Status: proposed
- Date: 2026-11-03
- Issues: [#196](https://github.com/folkloreinc/panneau-js/issues/196), [folkloreinc/laravel-panneau#158](https://github.com/folkloreinc/laravel-panneau/issues/158)
- Changes: the auth endpoints sketched in [0012](0012-authentication.md) and `openapi.json`; the `{basePath}/auth/…` pages that [0037](0037-login-page-token-and-logout.md) reserved

## Context

In the `panneau` auth mode, the login page of the app ([0037](0037-login-page-token-and-logout.md)) logs in with an email and a password, but a user who forgot theirs has no way back in, and a backend that wants verified addresses has no way to say so. The definition already has `auth.passwordReset` and `auth.emailVerification`, and `openapi.json` sketches `POST /auth/password/forgot` and `POST /auth/password/reset`, but nothing uses them.

Both flows go through an email whose link the user opens in a browser, often in another tab or on another device, without a session. What the link opens decides a few things:

- **a page of the backend** (Fortify's views, a controller that redirects): every backend draws its own pages, in a look that isn't the app's, and the protocol says nothing of them;
- **a page of the app**, which calls the API: the same pages for every backend, translated and themed like the rest. The backend only has to know where the page is, and what the link carries.

Email verification also needs a way for the API to refuse a user who logged in but hasn't verified their address yet. A plain `403` is the forbidden page of [0046](0046-abilities-in-the-ui.md), with nothing to do.

## Decision

### Password reset

- **`auth.passwordReset: true`** adds a "Forgot your password?" link under the password form of the login page. It shows, in place of the login form, a form for the email, which calls `POST /auth/password/forgot` with `{ "email" }`, then says that a link was sent if the address has an account, with a link back to the login.
    - The backend answers `204` whether or not the address has an account, and whether or not a link was sent recently, so that the answer doesn't tell which addresses have one. A malformed email is a `422`; too many requests from the client, a `429`.
- **The email links to a page of the app,** `{basePath}/auth/reset-password?token=…&email=…` (`AUTH_PAGE_PATHS.resetPassword`). The page asks for the new password twice, checks that both match, and calls `POST /auth/password/reset` with `{ "token", "email", "password" }`.
    - A token that is wrong or expired is a `422` with `errors.email` or `errors.token`; a password that the backend's rules refuse, a `422` with `errors.password`. The page shows them under the fields, or above the form with a link to ask for a new link.
    - Once the password is reset, the app shows the login page, with a message that the password was changed and the email filled in. The reset doesn't log in: the login stays the only way in, with its gate and, later, its second factor.
- The page shows in place of everything else, logged in or not: it doesn't need the definition.

### Email verification

- **`auth.emailVerification: true`** says that the backend refuses users whose address isn't verified. Every operation answers them with a `403` problem of type `urn:panneau:problem:email-unverified` (`EMAIL_UNVERIFIED_PROBLEM_TYPE`), except those of the auth: the login, the logout, and the two below.
- **The app shows a "Verify your email address" page** when the API answers that problem: a button that calls `POST /auth/email/verification` to send a new link (`204`, or `429` when one was sent too recently), and a logout.
    - Sending the first link is up to the backend (when it creates the user, or at the first request it refuses): the app never sends one on its own, so that reloading the page doesn't send emails.
- **The email links to a page of the app,** `{basePath}/auth/verify-email?token=…` (`AUTH_PAGE_PATHS.verifyEmail`). The page calls `POST /auth/email/verify` with `{ "token" }` as it opens, then says that the address is verified, with a button to continue to the app. A token that is wrong or expired is a `422`.
    - The token is opaque to the app: the backend chooses what it carries (the user, a hash of the address, an expiry, a signature). Having it proves the address: the user doesn't need to be logged in, which matters when the link opens on another device.

### Protocol and adapters

- `@panneau/protocol` exports `AUTH_PAGE_PATHS` (the paths of these pages under `basePath`, for the links of the emails) and `EMAIL_UNVERIFIED_PROBLEM_TYPE`. `openapi.json` documents the four endpoints. The mock backend implements them with its `auth` option (its users, and a callback for the emails it "sends"). The conformance kit checks them when the definition enables them, without sending an email to a real address.
- `DataAdapter` gets four **optional** methods, as `duplicate()`: `forgotPassword()`, `resetPassword()`, `sendEmailVerification()` and `verifyEmail()`. `createRestAdapter()` implements them. Without them, the app doesn't offer the flow.
- The pages are in `@panneau/app`, next to the login page, until `@panneau/auth` starts ([0037](0037-login-page-token-and-logout.md)).

## Consequences

- A backend in `panneau` mode sends emails whose links open the pages of the app. `laravel-panneau` sends its own notifications, so that a site's own reset and verification emails and their URLs are left alone ([folkloreinc/laravel-panneau#158](https://github.com/folkloreinc/laravel-panneau/issues/158)).
- A backend that already has its own reset page can leave `passwordReset` off and keep it.
- The two-factor challenge and the account page come next, under `{basePath}/auth/…` and `{basePath}/account`.
