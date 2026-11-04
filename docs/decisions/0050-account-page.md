# 0050: The account page

- Status: proposed
- Date: 2026-11-03
- Issues: [#204](https://github.com/folkloreinc/panneau-js/issues/204), [folkloreinc/laravel-panneau#161](https://github.com/folkloreinc/laravel-panneau/issues/161)
- Changes: the link to the user's profile in the sidebar ([0012](0012-authentication.md) planned an account page with the security settings); `GET` and `PATCH /account` of `openapi.json`

## Context

The sidebar links the user's name to their item in the resource of users, when the definition has one. That item is an admin resource: its fields, its layout and its policies are those of the people who manage users, not of a user who wants to change their own password. A backend without a resource of users has no link at all. Two-factor authentication ([0049](0049-two-factor-authentication.md)) needs a place where users set it up, get new recovery codes and turn it off; passkeys will need one too.

`openapi.json` sketches `GET` and `PATCH /account`, with the values of any field, and `docs/protocol.md` lists `/account/password`.

## Decision

- **`auth.account: true`** says that the backend has the endpoints of the account. The app then has an account page at `{basePath}/account`, in the shell, and the user's name in the sidebar links to it, in place of their item in the resource of users. Without it, the link stays what it was.
- **The page has sections,** each with its own form and its own save, so that changing the password doesn't send the name:
    - **Profile:** the name and the email, from `GET /account` (`{ "data": User }`), saved with `PATCH /account` (`{ "name", "email" }`, `422` with `errors`), which gives the user back. The app fetches the definition again, for the name in the sidebar. With `auth.emailVerification`, a new email is unverified: the backend sends it a link, and the app shows its verification page ([0048](0048-password-reset-and-email-verification.md)).
    - **Password,** when `auth.password` isn't false: the current password, and the new one twice, checked to match, sent with `PUT /account/password` (`{ "currentPassword", "password" }`, `204`, or `422` with `errors.currentPassword` or `errors.password`).
    - **Two-factor authentication,** with `auth.twoFactor`: off, the setup of 0049; on, buttons to get new recovery codes, and to turn it off when it isn't required. Both ask for the password when the backend needs it.
    - **Passkeys** come next, in the same page.
- `DataAdapter` gets the optional `getAccount()`, `updateAccount()` and `updatePassword()`.

## Consequences

- The resource of users stays the admin's tool to manage others; a user edits themselves on the account page.
- `laravel-panneau` implements the endpoints on Fortify's `UpdatesUserProfileInformation` and `UpdatesUserPasswords`, which a site can replace with its own ([folkloreinc/laravel-panneau#161](https://github.com/folkloreinc/laravel-panneau/issues/161)).
