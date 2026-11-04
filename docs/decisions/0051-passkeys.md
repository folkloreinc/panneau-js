# 0051: Passkeys

- Status: proposed
- Date: 2026-11-03
- Issues: [#206](https://github.com/folkloreinc/panneau-js/issues/206), [folkloreinc/laravel-panneau#163](https://github.com/folkloreinc/laravel-panneau/issues/163)
- Changes: `POST /auth/passkeys/options` and `POST /auth/passkeys/login`, sketched in [0012](0012-authentication.md); the account page of [0050](0050-account-page.md), which gets its passkeys

## Context

A passkey (WebAuthn) logs in with the device's lock (a fingerprint, a face, a PIN), without a password that can leak or be phished. `openapi.json` sketches two endpoints for the login, and the definition has `auth.passkeys`, but nothing else: nothing says what the options and the credential look like, nor how users add and remove passkeys.

The browser does the ceremonies: `navigator.credentials.create()` to add a passkey, `navigator.credentials.get()` to log in, with options from the backend, which checks the result. Their options and results are binary (`ArrayBuffer`); the WebAuthn spec defines their JSON form, with base64url strings, and recent browsers convert both ways (`PublicKeyCredential.parseRequestOptionsFromJSON()`, `credential.toJSON()`).

## Decision

### The protocol

- **`auth.passkeys: true`** says that the backend has them. Options and credentials travel in the JSON form of the WebAuthn spec (`PublicKeyCredentialRequestOptionsJSON`, `PublicKeyCredentialCreationOptionsJSON`, `RegistrationResponseJSON`, `AuthenticationResponseJSON`), which the protocol doesn't restate: they are objects, checked by the backend.
- **Login:** `POST /auth/passkeys/options` gives `{ "options" }` for `navigator.credentials.get()`, without a user: passkeys are discoverable, the user picks one. `POST /auth/passkeys/login` sends `{ "credential", "remember" }`, and answers the session, or a `422` with `errors.credential` (a passkey that isn't known, a challenge that expired). The backend keeps the challenge between the two (in the session).
- **The account's passkeys** (`/account/passkeys`): `GET` lists them (`{ "data": Passkey[] }`, with an id, a name, the authenticator when the backend knows it, and when it was added and last used); `POST /account/passkeys/options` gives the options of `navigator.credentials.create()`; `POST /account/passkeys` adds one with `{ "name", "credential" }` (`201`); `DELETE /account/passkeys/{id}` removes one. The changes need a recent password ([0049](0049-two-factor-authentication.md)).
- **A passkey login doesn't ask for the second factor:** it already proves a device and its user. A backend that requires two-factor authentication still requires it of users who log in with a passkey.

### The app

- The login page has a "Log in with a passkey" button, with `auth.passkeys`, an adapter that can, and a browser that has WebAuthn. Cancelling the browser's prompt says nothing; another failure shows its message.
- The account page lists the passkeys, adds one with a name (by default, the name of the browser and the system), and removes one.
- The conversion between the JSON form and the browser's objects uses the browser's own methods, and falls back to a small conversion of its own for browsers without them, without a dependency.

### The mock backend and conformance

The mock backend registers and logs in with real passkeys of the browser, without checking their signatures: the playground can try them. The conformance kit checks the options, a login with a credential that doesn't exist, and the list, without adding one.

## Consequences

- `laravel-panneau` builds them on `laravel/passkeys`, which Fortify uses ([folkloreinc/laravel-panneau#163](https://github.com/folkloreinc/laravel-panneau/issues/163)).
- Renaming a passkey, and the autofill of passkeys in the email field (conditional UI), can come later without changing these endpoints.
