# 0003: Independent layers and about a dozen packages

- Status: accepted
- Date: 2026-10-14

## Context

v4 has 117 packages: one per field, display, action or element, plus aggregators. Projects update 6 to 10 of them by hand, and versions drift. On the other hand, nothing below `@panneau/app` really works alone. Fields read contexts set up by the app, and lists fetch their own data. Projects reach into `@panneau/core/contexts` and the app's internal components.

## Decision

Panneau 5 is split into layers that only depend on the layers below them:

1. **Protocol** (`@panneau/protocol`): definition and API contract.
2. **UI primitives**:
    - `@panneau/ui`: tokens and primitives;
    - `@panneau/fields`, `@panneau/forms`, `@panneau/lists`: controlled components that need no definition, router or network.
3. **Engine** (`@panneau/core`): plugins, definition to forms and lists, form and list state, validation. No UI.
4. **Data** (`@panneau/data`): `DataAdapter` interface, REST adapter, query hooks.
5. **App** (`@panneau/app`): the complete admin panel.

Feature packages:

- `@panneau/editor` (TipTap);
- `@panneau/media`;
- `@panneau/auth`;
- `@panneau/intl`;
- later, `@panneau/collab`.

Fine-grained imports use subpath exports (`@panneau/fields/text`), so a project only loads what it imports.

## Consequences

- About a dozen packages instead of 117, all versioned together.
- A project can use a field or a form in its own interface without the app. This is how Niche uses Panneau.
- The `exports` map defines the public API. Anything else is internal (see [0013](0013-public-api-and-stability.md)).
