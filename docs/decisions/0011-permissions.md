# 0011: Backend policies, abilities in the UI, optional roles module

- Status: accepted
- Date: 2026-10-14

## Context

v1 has no authorization per resource. Its form requests only check that a user is logged in, and some routes check nothing. Projects write a `PanneauPolicy` for access to the panel, and their own role systems. Niche has workspace roles with per-member overrides.

## Decision

- **The backend decides.** In `laravel-panneau`, every resource operation goes through the Policy of the item (an Entity contract or a model). A resource without a policy is denied, unless the project explicitly allows it.
- **Abilities are sent to the UI:**
    - per resource in the definition (`viewAny`, `create`);
    - per item in API responses (`update`, `delete`, custom actions).

    The UI hides or disables what is not allowed. It never replaces the backend check.

- **An optional roles module in `laravel-panneau`:**
    - roles and their permissions are defined in config;
    - users get one or more roles;
    - a UI manages users, roles and invitations;
    - generated policies check permissions such as `pages.update`.
- **Projects with their own model** (Niche, or `spatie/laravel-permission`) skip the module and write their policies.

## Consequences

- A fresh install is closed by default.
- The UI never shows a button that would fail with 403.
