---
'@panneau/protocol': patch
'@panneau/data': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Two-factor authentication in the `panneau` auth mode (decision 0049).

- `@panneau/protocol`: `POST /auth/two-factor/challenge` with a code or a recovery code, `POST /auth/password/confirm`, the `/account/two-factor` endpoints (status, setup, confirmation, recovery codes, off), the `TwoFactorChallenge`, `TwoFactorStatus`, `TwoFactorSetup` and `RecoveryCodes` schemas, `423` answers, `TWO_FACTOR_REQUIRED_PROBLEM_TYPE` and `PASSWORD_CONFIRMATION_PROBLEM_TYPE`; two-factor users, a fixed code and required two-factor in the mock backend; conformance checks of the status and of a challenge without a pending login.
- `@panneau/data`: `login()` resolves with `{ twoFactor: true }` when the login waits for a second factor (`LoginResult`: a breaking change of the type for custom adapters); optional `twoFactorChallenge()`, `confirmPassword()`, `getTwoFactor()`, `enableTwoFactor()`, `confirmTwoFactor()`, `disableTwoFactor()` and `regenerateRecoveryCodes()`; `PasswordConfirmationError` for `423`.
- `@panneau/app`: the login page asks for the second factor; a user who must have two-factor authentication gets a page that sets it up (QR code, key, confirmation, recovery codes); operations that need the password ask for it in a dialog.
- `@panneau/intl`: their messages, in English and French.
