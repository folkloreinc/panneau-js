---
'@panneau/fields': minor
'@panneau/protocol': minor
'@panneau/lists': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Relation fields show their items as cards (decision 0067): the item's image, or its resource's icon, its label, linked to the item, its description, and buttons to change or remove it. "Change" opens the picker in place of the card, Escape or "Cancel" keeps the item, and the focus stays where the user was. Several items are a list of cards above the picker. `compact` keeps the former look (the item as the text of its picker, several items as chips): list filters use it.

- `@panneau/fields`: `RelationReference` has an optional `description` and `imageUrl`, and `RelationSource` optional `describe(resource)` and `getItemHref(resource, id)`. References without the image or the description that the items of their resource have get them from `resolve()`. `createRelationSource()` fills them from the `itemSubtitle` and `itemImage` of the definition, and takes `getItemHref`. The options of the picker show the image and the description.
- `@panneau/protocol`: `getImageUrl()` moves from `@panneau/lists` to `@panneau/protocol/runtime`. `@panneau/lists` still exports it.
- `@panneau/app`: the cards of a form link to their items.
- `@panneau/intl`: "Change", "Change {item}" and "Cancel" of relation fields, in English and French.
