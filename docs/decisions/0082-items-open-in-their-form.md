# 0082: Items open in their form, and the panel is a choice of the resource

- Status: accepted, amended by [0101](0101-the-show-route-keeps-its-list-while-the-item-loads.md): the show route shows its list and the panel's skeleton while the item loads
- Date: 2026-11-17
- Issue: [#306](https://github.com/folkloreinc/panneau-js/issues/306)
- Supersedes: the default of `open` in [0040](0040-row-links-and-open-mode.md) (`"panel"`), and what titles link to in [0028](0028-item-panel.md)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), Phase 2 (app shell)

## Context

[0028](0028-item-panel.md) made the title of an item open its details in a panel next to its list, and [0040](0040-row-links-and-open-mode.md) kept the panel as the default of `open`, with `"open": "edit"` for resources whose panel adds nothing.

The first projects migrated to Panneau 5 show that the exception is the rule. Their users open pages, articles, events or editions to change them: the panel is a step between the list and the form, which they go through for nearly every item. They read the values they will see in the form anyway, then look for "Edit". Each resource of those projects would need `"open": "edit"` to get what users expect.

The panel still has uses:

- **Items the user can't update.** The client has no read-only form ([0040](0040-row-links-and-open-mode.md)): for them, the panel is the only way to see an item's values.
- **Items read more than edited**: orders, form submissions, logs, whose values are checked and rarely changed.
- **Previews** ([0009](0009-preview-drafts-revisions.md)): a resource with a component or an iframe preview shows it in the panel, next to the list, without leaving it.

## Decision

- **`edit` is the default of `open`.** The title of an item opens its edit form, in its list and wherever the app links to the item (search, the dashboard, relation cards, toasts). The show route of an item redirects to its form, as `"open": "edit"` does since [0040](0040-row-links-and-open-mode.md), and `show` is left out of the built-in item actions.
- **An item the user can't update opens in the panel**, as before: its title links to the show route, which doesn't redirect it. Without `abilities.update: true`, the form would fail on save.
- **The panel stays, as a choice of the resource: `"open": "panel"`**, for items read more than edited, or shown with their preview. It works as before: the show route with the item's details next to the list, "View" and "Edit" in rows, "Edit" in the panel.
- **Clients treat an `open` they don't know as `edit`**, the default.

### Why keep the panel rather than remove it

Removing it would leave items that can't be updated with no page at all, until the client has a read-only form, and would take previews out of the list, where they are compared from one item to the next. The panel is built and tested: as an option, it costs one value of `open`. Its place in the roadmap (the form of an item in the panel of its list, in [0074](0074-asides-next-to-lists-and-forms.md)) can also make it a way to edit, which this decision doesn't settle.

## Not decided here

- **A read-only form**, or a show page of its own, for the items that can't be updated.
- **The show route going to the site**, which [0040](0040-row-links-and-open-mode.md) left to a third value of `open`.

## Consequences

- **Definitions without `open` change behavior:** their titles open the form, the show route redirects there, and rows have "Edit" without "View". A resource that wants the panel back sets `"open": "panel"`. Those with `"open": "edit"` don't change.
- `getOpenMode()` of `@panneau/core` returns `edit` unless the resource says `panel`. The description of `open` in the protocol, its JSON Schema and the mock example follow.
- While an item that opens in its form loads, the show route shows nothing, as with `"open": "edit"` before. When its fetch fails (`403`, `404`), the page shows the panel with the error, and its refetch no longer hides the page again.
- `laravel-panneau`'s `Resource::open()` returns `edit` by default, and its definitions always write `open`, so that clients from before this decision, which read a missing `open` as `panel`, open items as the backend says.
