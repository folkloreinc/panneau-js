---
'@panneau/protocol': patch
'@panneau/data': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Passkeys (decision 0051).

- `@panneau/protocol`: the login options and the login (`/auth/passkeys/options`, `/auth/passkeys/login`), the passkeys of the account (`/account/passkeys`, its options, adding and removing one), the `WebAuthnOptions` and `Passkey` schemas, and `auth.passkeys`. The mock backend registers and logs in with the browser's passkeys, without checking signatures. The `auth.passkeys` and `account.passkeys` conformance checks change nothing.
- `@panneau/data`: optional `passkeyLoginOptions()`, `passkeyLogin()`, `listPasskeys()`, `passkeyRegistrationOptions()`, `addPasskey()` and `deletePasskey()`, and the `passkeys` query key.
- `@panneau/app`: a "Log in with a passkey" button on the login page, and the passkeys on the account page. The WebAuthn ceremonies use the browser's JSON conversions, with a fallback of their own.
- `@panneau/intl`: their messages, in English and French.
