---
'@panneau/protocol': patch
'@panneau/data': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Password reset and email verification in the `panneau` auth mode (decision 0048).

- `@panneau/protocol`: `POST /auth/email/verification` and `POST /auth/email/verify` in `openapi.json`, `429` answers of the password reset, the `EMAIL_UNVERIFIED_PROBLEM_TYPE` and `AUTH_PAGE_PATHS` constants, the `auth` option of the mock backend (users, a session and the emails it "sends"), and conformance checks of the reset and of the verification when the definition enables them.
- `@panneau/data`: the optional `forgotPassword()`, `resetPassword()`, `sendEmailVerification()` and `verifyEmail()` of `DataAdapter`, implemented by `createRestAdapter()`.
- `@panneau/app`: with `auth.passwordReset`, a "Forgot your password?" link on the login page and the page that the reset link opens (`{basePath}/auth/reset-password`); with `auth.emailVerification`, a page that sends a new link when the API refuses an unverified address, and the page that the link opens (`{basePath}/auth/verify-email`).
- `@panneau/intl`: their messages, in English and French.
