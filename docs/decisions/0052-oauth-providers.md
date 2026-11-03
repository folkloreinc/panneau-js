# 0052: OAuth providers on the login page

- Status: proposed
- Date: 2026-11-03
- Issues: [#5](https://github.com/folkloreinc/panneau-js/issues/5), [folkloreinc/laravel-panneau#34](https://github.com/folkloreinc/laravel-panneau/issues/34)
- Changes: `auth.providers` and `GET /auth/providers/{provider}/redirect`, sketched in [0012](0012-authentication.md); the links of providers that [0037](0037-login-page-token-and-logout.md) put on the login page

## Context

Folklore's and its clients' teams log in with their Google accounts. Without Panneau's support, each project replaces the login page and writes its own Socialite controller. The definition already has `auth.providers` (an id, a label, the `url` where the login starts), and the login page links to each one, but nothing says where the user lands after the provider, nor how a failure is told: the user went to another site and came back with a full page load.

## Decision

- **A provider's `url` starts its login** with a full navigation (`GET /auth/providers/{provider}/redirect` for a backend that follows the protocol). The app adds `next`, the path and query of the page the user was on, so that the backend brings them back there. A backend only follows a local `next`, under the base path; another one is ignored.
- **The callback is the backend's,** and outside the protocol: it is the URL registered with the provider. It logs in and goes to `next`, or to the base path.
- **A failure comes back to the app** at the base path, with `authError` (`AUTH_ERROR_PARAM`) in the query, and one of the codes of `AUTH_ERROR_CODES`, which the login page translates:
    - `provider`: the provider failed, or the user cancelled;
    - `email`: the provider gave no verified email address;
    - `domain`: the address isn't in a domain the admin allows;
    - `access`: no user has this address, or the user isn't allowed in.

    The page then removes `authError` from the address, so that a reload doesn't show it again. A code it doesn't know shows the message of `provider`.

- **A provider login doesn't ask for the second factor** ([0049](0049-two-factor-authentication.md)): the provider has its own.
- **Linking to users by email:** the backend finds the user with the provider's verified address. Creating users, or linking by another key, is the backend's choice.
- The conformance kit checks that the `redirect` of each provider answers a redirection, and that an unknown provider is a `404`.

## Consequences

- A project with "Sign in with Google" configures its provider in the backend, and keeps the login page of the app.
- `laravel-panneau` implements it with Socialite, with allowed domains and Google's `hd` claim ([folkloreinc/laravel-panneau#34](https://github.com/folkloreinc/laravel-panneau/issues/34)).
