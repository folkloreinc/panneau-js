# 0012: Complete, optional auth that works next to a site's own auth

- Status: accepted, amended by [0037](0037-login-page-token-and-logout.md): a login with a token, and the logout
- Date: 2026-10-14

## Context

v1 only wires Fortify's login and logout. v4 has two sets of auth endpoints that don't match, unrouted 2FA forms and a stub account page. Projects add Google login by replacing routes and pages. Many sites already have a public authentication (members, subscribers), and the admin must not interfere with it.

## Decision

- **`laravel-panneau` owns the admin's auth flows.** All of them are optional and configured in `config/panneau.php`:
    - password login, logout, password reset, email verification;
    - two-factor authentication and passkeys, through Fortify;
    - OAuth providers through Socialite, with allowed email domains (continues laravel-panneau#34 and panneau-js#5).
- **Two modes, exposed in the definition as `auth.mode`:**
    - **`panneau`:** Panneau's own login pages, on a guard that can be separate (`panneau`) or the site's (`web`).
    - **`external`:** the site handles login. Panneau only checks the session and the `viewPanneau` gate, and sends unauthenticated users to the site's login URL.
- **Coexisting with the site's auth:**
    - Panneau's auth routes are opt-in and prefixed.
    - With its own guard, Panneau never changes the site's Fortify configuration, views or guards.
- **`@panneau/auth` provides the pages and forms:** login, OAuth buttons, password reset, 2FA challenge, passkeys, and an account page with the security settings.

## Consequences

- A site with members or subscribers can add Panneau without touching their login.
- The generated `AccountController` and custom login pages in projects go away.
