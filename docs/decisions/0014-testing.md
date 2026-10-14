# 0014: Testing strategy

- Status: accepted
- Date: 2026-10-14

## Context

`panneau-js` has no tests, only Storybook stories. `laravel-panneau` has 9 tests, and one fails. Bugs reach production through dev branches.

## Decision

**`panneau-js`:**

- Vitest and Testing Library for the engine, hooks, the adapter and each field, form and list component.
- Storybook stories for every component, with interaction tests (play functions) and axe a11y checks run in CI.
- Playwright end-to-end tests of the full app against the `laravel-panneau` test app: login, CRUD, validation errors, conflicts, media upload.

**`@panneau/protocol`:**

- Schema tests with valid and invalid fixtures.
- The conformance kit is tested against the mock API.

**`laravel-panneau`:**

- PHPUnit with Testbench, using the workspace tools (Pint, Larastan).
- Feature tests for every endpoint, validated against the OpenAPI document.
- Unit tests for every field builder and rule conversion.

**CI:**

- GitHub Actions on every pull request.
- A bug fix adds a regression test that fails without the fix.

## Consequences

- Phase 0 sets up the tooling before any feature work.
- The Storybook mock API stays, and follows the protocol so that stories exercise the real adapter.
