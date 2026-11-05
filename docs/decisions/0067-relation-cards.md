# 0067: Relation fields show their items as cards

- Status: proposed
- Date: 2026-11-05
- Changes: how a `relation` field shows its value

## Context

A `relation` field showed its item as the text of its picker: the `parent` of a page was a search field with "About us" in it. Nothing told the item from what the user types, nor showed what it was: no image, no second line, no way to open it. Several items were small chips. Panneau 4 showed the items of a relation as cards (its `ResourceCard`): an image, a title, a description, and buttons to change or remove the item, which people found clearer.

The protocol already says what shows an item: its `itemTitle`, its `itemSubtitle` ("under the title, in search results, cards and pickers") and its `itemImage` ([0061](0061-item-images-in-lists.md)).

## Decision

- **The chosen item is a card**: a square with its image, or the icon of its resource (an image placeholder when its resource has images), its label, linked to the item when the app knows where it opens, its description on a second line, and buttons to change and remove it. Several items are a list of cards, each with its remove button, above the picker that adds more. A field that can't change shows its cards without buttons.
- **"Change" opens the picker in place of the card**, with the focus in it. Choosing an item shows its card; Escape or "Cancel" keeps the item. The focus stays where the user was: on the card after a choice, on the picker after a removal, on the next card after removing one of several. The buttons say what they act on ("Change Ada Lovelace", "Remove Ada Lovelace"), and the list of cards is a list for screen readers.
- **What the card shows comes from the source.** `RelationReference` has an optional `description` (the `itemSubtitle`, as text) and `imageUrl` (the `itemImage`, read as [0061](0061-item-images-in-lists.md) says). `RelationSource` has two optional methods: `describe(resource)`, its icon and whether its items have an image or a description, and `getItemHref(resource, id)`, where an item opens. Items give references without them (`{ id, label }`): when the resource's items have an image or a description, the field gets them from `resolve()`, once per source and id, as it does for plain ids. The options of the picker show the same image and description.
- **Small places keep the compact field.** `compact` shows the item as the text of its picker and several items as chips, as before: the filters of a list use it.

## Consequences

- `@panneau/fields`: `RelationField` draws cards, with `compact` for the former look. `createRelationSource()` fills `description` and `imageUrl` from the definition, describes resources, and takes `getItemHref`.
- `@panneau/protocol`: `getImageUrl()`, which reads an image value, moves from `@panneau/lists` to `@panneau/protocol/runtime`, so that fields read images as lists do. `@panneau/lists` still exports it.
- `@panneau/app`: the cards of a form link to the show route of their items, which opens their form when their resource opens there ([0040](0040-row-links-and-open-mode.md)). A link leaves the form through the router, which asks first when it has unsaved changes.
- A field with images or descriptions costs one request per item it shows, the first time. A backend could send them in its references later, as `media` references carry their `media`; the protocol doesn't ask it yet.
