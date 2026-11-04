# 0049: Two-factor authentication, required for some users, and password confirmation

- Status: proposed
- Date: 2026-11-03
- Issues: [#203](https://github.com/folkloreinc/panneau-js/issues/203), [folkloreinc/laravel-panneau#160](https://github.com/folkloreinc/laravel-panneau/issues/160)
- Changes: `POST /auth/login` and `POST /auth/two-factor/challenge`, sketched in [0012](0012-authentication.md) and left out of [0037](0037-login-page-token-and-logout.md); the `/account/two-factor` endpoints that `docs/protocol.md` listed

## Context

`openapi.json` already says that `POST /auth/login` answers `202` with `{ "twoFactor": true }` when a second factor is needed, and sketches `POST /auth/two-factor/challenge`, but the login page doesn't handle it, and nothing lets a user set it up. The contests platform, pilot of phase 2, requires two-factor authentication for its internal and client accounts: those users must not reach the admin before they have set it up. Which users must have it is the backend's business (everyone, a role, a permission).

Setting it up, turning it off and seeing new recovery codes are sensitive: someone at an unlocked computer shouldn't be able to turn it off. Laravel and Fortify ask for the password again when it wasn't confirmed recently (`password.confirm`, a `423`). The account page and passkeys, next in the auth, will need the same confirmation.

## Decision

### The challenge at login

- **`POST /auth/login` answers `202` with `{ "twoFactor": true }`** when the credentials are right and the user has two-factor authentication: the user isn't logged in yet, and the backend keeps the pending login (in the session).
- **The login page then asks for the code** of the authenticator app, with a link to use a recovery code instead, and sends `{ "code" }` or `{ "recoveryCode" }` to `POST /auth/two-factor/challenge`. `200` with the session logs in; a wrong code is a `422` with `errors.code` (or `errors.recoveryCode`); a pending login that expired is a `422` too, and the page goes back to the login form. Too many tries, a `429`.
- `DataAdapter.login()` resolves with the session, or with `{ twoFactor: true }` (`LoginResult`): a breaking change of the type for adapters, in the alphas. `twoFactorChallenge()` is a new optional method.

### Setting it up

`auth.twoFactor: true` says that the backend supports it. The current user's two-factor authentication is a sub-resource of the account:

| Endpoint                                  | What it does                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `GET /account/two-factor`                 | `{ "status": "disabled" \| "pending" \| "enabled", "required": boolean }`                  |
| `POST /account/two-factor`                | starts the setup: `{ "secret", "otpauthUrl", "qrCode"? }`, `pending` until it is confirmed |
| `POST /account/two-factor/confirm`        | `{ "code" }`: turns it on, and gives `{ "recoveryCodes": [...] }`                          |
| `POST /account/two-factor/recovery-codes` | new recovery codes, in place of the old ones                                               |
| `DELETE /account/two-factor`              | turns it off, when it isn't required                                                       |

An operation that the status doesn't allow (confirming what isn't pending, new codes without it, turning off what is required) is a `409`.

- `qrCode` is an SVG document, which the app shows as an image (`<img src="data:image/svg+xml…">`), never as markup: a script in it doesn't run. Without it, the app shows the secret and a link with `otpauthUrl`.
- The recovery codes are only shown when they are made: the app shows them once, with a button to copy them, and asks the user to keep them.
- The setup is a component of the app (`TwoFactorSetup`), used by the page below and by the account page.

### Requiring it

- **A user who must have it and hasn't set it up is refused** on every operation, but those of the auth and `/account/two-factor`, with a `403` problem of type `urn:panneau:problem:two-factor-required` (`TWO_FACTOR_REQUIRED_PROBLEM_TYPE`), as an unverified address is ([0048](0048-password-reset-and-email-verification.md)). The app then shows a page with the setup and a logout, and loads once it is on.
- `GET /account/two-factor` says `required`, so that the account page doesn't offer to turn it off.

### Password confirmation

- **An operation that needs a recent password answers `423`,** a problem of type `urn:panneau:problem:password-confirmation` (`PASSWORD_CONFIRMATION_PROBLEM_TYPE`). The app asks for the password in a dialog, sends it to `POST /auth/password/confirm` (`204`, or `422` with `errors.password`), and runs the operation again. `@panneau/data` rejects with a `PasswordConfirmationError`.
- How recent is the backend's business (Laravel: `auth.password_timeout`, 3 hours). A login with the password counts as a confirmation, so that the setup required right after a login doesn't ask again.
- The setup, its confirmation, new recovery codes and turning it off need it. The account page and passkeys will reuse it.

## Consequences

- The mock backend implements all of it: users with `twoFactor`, a fixed code (`123456` by default) and `twoFactorRequired`; the conformance kit checks the status and that a challenge without a pending login is refused, without changing the user.
- `laravel-panneau` builds it on Fortify's trait, actions and TOTP provider, without Fortify's routes ([folkloreinc/laravel-panneau#160](https://github.com/folkloreinc/laravel-panneau/issues/160)).
- Two-factor authentication is for logins with a password: a login with a token (`auth.token`) or an OAuth provider doesn't ask for it.
