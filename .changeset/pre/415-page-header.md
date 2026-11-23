---
'@panneau/app': patch
---

The header of a page keeps its place from page to page, and its actions keep theirs whatever the length of the title. A `narrow` page (`PageLayout width="narrow"`: forms without a sidebar, the account page, the page that chooses a type) now narrows its content from the start of the column, and no longer its header: the title, the back link and the actions of an item are at the same place on a list, on a form with a sidebar and on a form without one. In the header, the title takes the space left by the actions and wraps, whole, and the actions stay at the end of the title's row; below 48rem of the root, they go under the title.

For themes that target the classes of the header: `.panneau-pages-header` is a grid, `.panneau-pages-header-title` is now the `h1` itself, and the back link or the breadcrumbs are in a new `.panneau-pages-header-parents`.
