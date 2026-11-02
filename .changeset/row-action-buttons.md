---
'@panneau/ui': patch
'@panneau/lists': patch
'@panneau/app': patch
---

The links of an item's actions look like the buttons beside them, in rows and in the header of the item's panel and form, with room between them.

- `@panneau/ui`: `LinkButton` is a link with the look of a `Button`: the same tones, appearances, sizes, hover and pressed backgrounds and focus ring. It goes through React Aria, so an app's router handles it. `ButtonStyleProps` are the props of that look, shared by both.
- `@panneau/lists`: the links of a row (`show`, `edit`, and other `link` actions) are `LinkButton`s, ghost and small like the other actions of the row, so their hover background is the one of the `…` menu button, on the same box. The actions of a row are `--panneau-space-2` apart, up from `--panneau-space-1`. The classes `panneau-actions-link` and `panneau-actions-link-md` are removed: the links have the classes of a button (`panneau-button`). A link of the toolbar is outlined like the buttons beside it.
- `@panneau/app`: the links in the header of an item's panel and form are `LinkButton`s, outlined like the buttons beside them. The class `panneau-pages-action-link` is removed.
