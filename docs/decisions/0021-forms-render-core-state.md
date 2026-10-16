# 0021: Forms render the form state of the engine

- Status: accepted
- Date: 2026-10-15
- Changes: the dependencies of `@panneau/forms` in [0003](0003-layers-and-packages.md) and [packages.md](../packages.md)

## Context

[packages.md](../packages.md) puts `@panneau/forms` below `@panneau/core`: forms "never depend on `core` or `data`", and core "may import the UI primitives for their types and to map field types to components".

`@panneau/core` was then built as a headless engine that depends on nothing but `@panneau/protocol` and React. It holds the whole form state:

- values behind a store;
- dirty tracking and validation with the portable rules;
- server errors by path, visibility and error counts;
- submit with version conflicts.

A forms package below it would have to duplicate all of that, or take it as props from every caller. A product that renders a form from a list of fields and an `onSubmit`, like Niche, would then need the engine anyway.

The fields of `@panneau/fields` don't need the engine: they are controlled components, and nested fields can be bound to any store through a binding in their context.

## Decision

- **`@panneau/forms` depends on `@panneau/core`**, and renders its form state:
    - `Form` creates the state with `useForm()`, from fields and an `onSubmit`;
    - `FormView` renders a `Form` created elsewhere.
- **Core stays below forms:**
    - it never imports `@panneau/fields`, `@panneau/forms` or any UI package;
    - it still renders no UI, and needs no definition, router or network to manage a form.
- **`@panneau/fields` stays independent** of core. Its registry entries are plain components. `fieldsPlugin` has the shape of a core plugin without importing core.
- Forms still work without a definition, a router or a network, as [0003](0003-layers-and-packages.md) requires.

| Package           | May depend on                              |
| ----------------- | ------------------------------------------ |
| `@panneau/core`   | `protocol`                                 |
| `@panneau/fields` | `protocol`, `intl`, `ui`                   |
| `@panneau/forms`  | `protocol`, `intl`, `ui`, `fields`, `core` |

## Consequences

- Validation, server errors, conflicts and the store are written once, in core, and forms only render them. A shared Yjs store (`@panneau/collab`) reaches forms through core's `FormStore`, without changes in forms.
- A project that uses `@panneau/forms` also installs `@panneau/core`. Core is small and has no dependency besides the protocol.
- `@panneau/lists` can render the list state of core the same way. That is decided with its own work.
