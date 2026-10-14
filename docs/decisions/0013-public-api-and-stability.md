# 0013: Public API and stability rules

- Status: accepted
- Date: 2026-10-14

## Context

Projects import internal modules (`@panneau/core/contexts`, the app's layout components) and override internal PHP methods. Any refactor of Panneau breaks them. A stable API is needed so that Panneau can keep evolving after 5.0.

## Decision

- **JS public API:** what a package exports through its `exports` map, and is documented. Anything else is internal and can change in any release.
- **API reports.** Each package has an API report generated from its type declarations (API Extractor or equivalent). A change to the report is visible in review, and a breaking change fails CI on a minor or patch.
- **PHP public API:**
    - contracts (interfaces), builders, `Resource` methods meant to be overridden, config keys and events;
    - classes not meant to be extended are `final` or marked `@internal`.
- **Protocol:** version 1 only grows: new optional properties and endpoints.
- **Deprecation before removal.** A deprecated API logs a warning in development and is listed in the CHANGELOG. It is removed in the next major at the earliest.
- **Extension goes through plugins, contracts and hooks** (see [architecture.md](../architecture.md)), not through internal imports or overriding internal methods.

## Consequences

- Projects that only use the public API can update within 5.x without changes.
- Every gap that forces a project to use internals becomes an issue: either a public extension point is added, or the use case is supported directly.
