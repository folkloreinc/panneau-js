# 0116: Palette commands in the context of the current page

- Status: accepted
- Date: 2026-11-26
- Issue: [#531](https://github.com/folkloreinc/panneau-js/issues/531)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6)
- Specifies: [0029](0029-go-to-palette.md), the commands of plugins

## Context

The commands of plugins in the "Go to…" palette ([0029](0029-go-to-palette.md)) only get the definition (`CommandContext`). A command can't act on the item the user is editing or on the items selected in a list, and the palette offers nothing on the current page: archiving the item open in its form means leaving the keyboard for the header.

The actions of an item already run in one place: `ItemActions` asks for the confirmation, `useItemActionRunner()` runs them through the action runner of [0023](0023-action-runner.md) (parameters, results, undo toasts), and the abilities of the item filter them (`getItemActions()`). The palette must reuse them, not copy them.

## Decision

- **`CommandContext` gets the current page**, in an optional `page` (`null` outside of a page of the app):
    - `route`: the route of the app (`resource.index`, `resource.edit`, `page`…), the kind of page;
    - `resource`: the resource of the page, when it has one;
    - `item`: the item of the page, once loaded: the item of a form, or of the panel open over a list;
    - `selection`: the selection of a list page (`ListSelection` of `@panneau/core`: some ids, or every item matching the query but some).
- **A command declares when it applies** with `when(context)`. A command with `when` shows only when it returns `true`, in the first group of the palette, "On this page", above the recent items. A command without `when` shows as before, in its group.
- **`perform(context)`** gets the context, so a command acts on the item or the selection.
- **The actions of the current item come first in "On this page"**: those of its header or its panel, with their links, filtered by the item's abilities. Running one from the palette is pressing its button: the same confirmation, runner and toasts. The page publishes them, with the function its buttons call.
- **The app publishes the page** in a store of the shell: the shell sets the route, the form page and the list page set their resource, item and selection, and the actions of an item set themselves while they are shown. The palette reads it when it opens.

Unchanged: function sources of commands (`(context) => Command[]`) still get the context, now with `page`, and commands that only read `definition` work as before.

## Consequences

- Backward compatible: `page`, `when` and the argument of `perform` are optional additions to `@panneau/core`.
- A product without the app passes its own `page` to `getCommands()`, or none.
- The actions of a list selection run from its selection bar, where `ListView` keeps their confirmation (skipped items, "all matching" counts). The palette shows them in a later step, once `ListView` can run one from outside; plugin commands already get the selection.
