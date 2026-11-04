---
'@panneau/protocol': patch
'@panneau/data': patch
'@panneau/app': patch
'@panneau/intl': patch
---

The account page (decision 0050).

- `@panneau/protocol`: `auth.account`, `PATCH /account` with the name and the email, `PUT /account/password` with the current password; the account of the mock backend (a new email is verified again with `auth.emailVerification`), and the `account` conformance check.
- `@panneau/data`: optional `getAccount()`, `updateAccount()` and `updatePassword()`, and the `account` and `twoFactor` query keys.
- `@panneau/app`: with `auth.account`, the user's name in the sidebar links to `{basePath}/account`, a page with their name and email, their password, and their two-factor authentication (set up, new recovery codes, turned off unless it is required).
- `@panneau/intl`: its messages, in English and French.
