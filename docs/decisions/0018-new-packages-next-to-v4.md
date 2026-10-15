# 0018: New packages next to the v4 code

- Status: accepted
- Date: 2026-10-14

## Context

Panneau 5 reorganizes 117 packages into about a dozen ([0003](0003-layers-and-packages.md)), moves to strict TypeScript, and rewrites the components:

- controlled fields;
- accessible primitives;
- design tokens instead of Bootstrap.

Moving the v4 code into the new structure, making it strict and cleaning it up would mean a lot of work on code that is about to be rewritten. The new packages also reuse the names of v4 packages (`@panneau/core`, `@panneau/fields`, `@panneau/app`…), so both can't be npm workspaces at the same time.

## Decision

- **v5 packages are built new** in `packages/`, with the v5 tooling (strict TypeScript, Vite, Vitest, changesets).
- **On `v5.x`, the v4 code moves to `legacy/`,** outside the npm workspaces. It is not built, linted, tested or published from `v5.x`.
- **Porting.** Components are ported from `legacy/` into the new packages, adapted to the v5 rules (controlled, typed, tested, tokens). Ported code is deleted from `legacy/` in the same pull request.
- **`legacy/` is deleted before 5.0.0.**
- v4 itself keeps being maintained on the `v4.0` branch.

## Consequences

- `v5.x` doesn't run Storybook until `@panneau/ui` sets it up again for v5.
- The history of a ported file is in `legacy/` and in the `v4.0` branch, not in the new file.
- Packages are created when their work starts, not as empty shells.
