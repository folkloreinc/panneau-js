---
'@panneau/ui': patch
'@panneau/lists': patch
'@panneau/app': patch
---

The links of an item's actions look like the buttons beside them, in rows and in the header of the item's panel and form, with room between them.

- `@panneau/ui`: `LinkButton` is a link with the look of a `Button`: the same tones, appearances, sizes, hover and pressed backgrounds and focus ring. It goes through React Aria, so an app's router handles it. With `external`, it opens in a new tab, without access to the admin. `ButtonStyleProps` are the props of that look (tone, appearance, variant, size, icons, full width), shared by both.
- `@panneau/lists`: the links of a row (`show`, `edit`, and other `link` actions) are `LinkButton`s, ghost and small like the other actions of the row, so their hover background is the one of the `…` menu button, on the same box. A destructive link is `danger`, like a destructive button. A link that leaves the admin (`http://`, `https://`) opens in a new tab. The actions of a row are `--panneau-space-2` apart, up from `--panneau-space-1`, and wrap on several lines in a narrow list or a card rather than overflow it; in a wide table they stay on one line. A link of the toolbar is outlined like the buttons beside it.
- `@panneau/app`: the links in the header of an item's panel and form are `LinkButton`s, outlined like the buttons beside them, and `danger` when destructive. The `LinkButton` of `@panneau/app` renders the primary `LinkButton` of `@panneau/ui`, and is deprecated: use that one with `variant="primary"`, as the create link of lists, the link home of the not found page and the sign-in providers now do.

Four public classes are removed, as these links have the classes of a button (`panneau-button`): `panneau-actions-link`, `panneau-actions-link-md`, `panneau-pages-action-link` and `panneau-pages-link-button`.
