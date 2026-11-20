# 0098: Hidden layout nodes hide their fields

- Status: accepted
- Date: 2026-11-20
- Changes: what `visibleWhen` means on a layout node (the layout of a form, `docs/protocol.md`), and what clients and backends validate and save

## Context

A field with `visibleWhen` whose condition is false is hidden: clients don't show it, `checkValues()` of `@panneau/protocol` doesn't check its rules, and a backend drops its value. The protocol also says that "any node can have `visibleWhen`": a `tab`, a `section`, a `sidebar`. `FormView` hides such a node, and the fields inside it. But nothing said what the condition of a node means for its fields, and the rest of the stack only read the conditions of fields ([#386](https://github.com/folkloreinc/panneau-js/issues/386)):

- **Clients** validated them: `useForm()` runs `checkValues()` on the fields, which don't carry the condition of their tab. A required field in a hidden tab blocked the save, with an error on a field the user can't see, and the error summary linked to it.
- **laravel-panneau** validated them too, and saved their values: `Form::applicable()` only reads the `visibleWhen` of fields ([laravel-panneau#256](https://github.com/folkloreinc/laravel-panneau/issues/256)).

A `tab` "Event" shown when `type` is `event`, holding a required `starts_at`, made articles impossible to save.

## Decision

A field inside a layout node whose `visibleWhen` is false is hidden, as if it had the condition itself: clients don't show it and don't validate it, and backends don't validate it and don't save its value.

- **Every node on the way counts.** The conditions of the nodes that hold a field, from the root of the layout down to its own `field` node, all apply, with the field's own `visibleWhen`. They are evaluated on the values of the form, as the conditions of nodes are.
- **A field placed more than once** applies when one of its places is visible.
- **A field that the layout doesn't place** keeps its own condition only.
- **Clients:** `resolveFields()` (and `resolveForm()`) of `@panneau/core` give each field the conditions of the nodes that hold it, in its `visibleWhen` (`all` of them, `any` of its places). Forms, their validation, their binding and their error summary then follow the conditions of fields, as before. The definition that a backend sends doesn't change: the nodes keep their conditions, and the fields their own.
- **Backends** do the same when they validate and extract the values of a form.

## Consequences

- A condition on a tab or a section is enough: a backend no longer repeats it on each of its fields to make them optional.
- The fields that `resolveFields()` gives have more in their `visibleWhen` than the definition. Code that compares them to the fields of the definition reads the definition instead.
- laravel-panneau follows in [#256](https://github.com/folkloreinc/laravel-panneau/issues/256). Until then, a required field in a hidden node is still refused by the backend.
