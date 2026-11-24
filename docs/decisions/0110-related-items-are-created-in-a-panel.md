# 0110: Related items are created in a panel, over the form

- Status: accepted
- Date: 2026-11-23
- Amends: [0067](0067-relation-cards.md) (the cards of a relation field in a panel open in a new tab)
- Issue: [#471](https://github.com/folkloreinc/panneau-js/issues/471)

## Context

A relation field picks existing items. To link an author that doesn't exist yet, an editor leaves the form and its unsaved changes, creates the author, comes back and picks it. The field already had a "Create “text”" option, through the `create()` of its `RelationSource`, which only sent the typed text as the title of the new item, and the app never turned it on. A resource whose items need more than a title, a type, or validation couldn't be created that way.

## Decision

- **A side panel, over the page.** "Create “text”" opens a panel on the right of the screen, the whole height of it, as the item panel goes over its list ([0099](0099-the-item-panel-goes-over-its-list.md)), and with the same `Aside` ([0074](0074-asides-next-to-lists-and-forms.md)): not a centered dialog. A resource's form needs the room, and the form underneath stays in view on its left. The panel is modal: the focus moves to it and stays in it, Escape and its close button close it, and the page under it can't be used until then.
- **The full form of the related resource**: its fields, its layout, its validation, its `422` errors and its abilities, as its create page has them, after the choice of its type in a resource with types ([0077](0077-resource-types.md)), under the title "New Author". The typed text is the value of its `itemTitle` field. A short form for quick creation may come later, declared by the resource.
    - **Its width:** the wide aside (half of the screen), at least 36rem, the whole width on a phone. Its layout adapts as it does on a page of that width: the `sidebar` nodes of the form go beside it from 56rem of the panel, below it otherwise ([0074](0074-asides-next-to-lists-and-forms.md)). They are not flattened into the form: below it, they stay the panels the form's layout declares.
    - **Saving** creates the item and adds it to the relation: after the others in a multiple relation, in place of the item in a single one, with the "Undo" of a removal as before. The panel closes and the focus comes back to the field. The form underneath keeps its values, and now has unsaved changes.
    - **Closing** it with unsaved changes asks first, as leaving a page does. The typed text alone isn't a change.
    - **⌘ S and ⌘ Enter** save the form of the panel while it is open, never the form of the page: the panel is a dialog, which the save shortcut keeps apart.
- **One level.** Inside the panel, relation fields pick existing items: they offer no "Create …", and the links of their cards open in a new tab, which leaves neither the panel nor the form under it. A panel never opens over a panel.
- **"Create …" follows the abilities**: it shows when the user can create in the related resource (`abilities.create`, [0046](0046-abilities-in-the-ui.md)), and, in a resource with types, when one of them can be created.
- **Fields don't need the app.** The panel is something the app gives to fields, through their relation source: `createRelationSource()` takes `createItem(resource, values)`, which creates the item somewhere else and resolves with it, or with `null` when nothing was created. A source says that the links of its cards open in a new tab with `linksInNewTab`. Without them, fields behave as before: `create()` sends the title through the adapter, or `onCreate` of the field opens what a project wants.

## Not decided here

- **Editing an item from its card**, in the same panel, with "Edit" when the user can update it: the next pull request of [#471](https://github.com/folkloreinc/panneau-js/issues/471).
- **Creating without typing first**: "Create …" needs a text, as the option did.

## Consequences

- `@panneau/fields`: `RelationSourceOptions` has `createItem`, `RelationSource` has `linksInNewTab`. A created item goes into the source's cache, so that its card shows at once. A source doesn't offer creation in a resource whose types all forbid it. `RelationField` brings the focus back to the field once `create()` or `onCreate` settles.
- `@panneau/app`: its relation source turns `create` on, through a panel that the shell shows over the page. The panel comes with the first page's JavaScript, about 6 KB: what it needs (the form, the aside, the modal) is already there, and a chunk loaded with `import()` would split the modules it shares with that page into small chunks, which weighed 17 KB more when measured.
