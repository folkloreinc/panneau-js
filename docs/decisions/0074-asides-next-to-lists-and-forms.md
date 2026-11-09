# 0074: One aside, next to lists and forms

- Status: proposed
- Date: 2026-11-09
- Amends: [0028](0028-item-panel.md) (the layout of the item panel and its tokens), and the `sidebar` node of form layouts ([protocol](../protocol.md#form-layout))
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (Sidebars, a general principle)

## Context

Two places of the app already have a column next to their main content, built twice:

- **The item panel** of lists ([0028](0028-item-panel.md)): a raised card beside the list from the `xl` width of the root, sticky, over the list below it. A button widens it, for previews, and the browser remembers it. Its tokens are `--panneau-item-panel-*`, in `@panneau/app`.
- **The `sidebar` node** of form layouts: a plain column of 16 to 20rem beside the form from 56rem, below it otherwise. It doesn't stay in view while the form scrolls, its blocks have no title, and nothing can be collapsed.

The roadmap makes sidebars a general principle: next to a list, the whole item of a simple resource; next to a form, the item's state and what acts on it, as in WordPress (publication, Save and Publish, errors, links, preview), then its revisions, and panels from plugins. All of them need the same column first, with the same behaviour everywhere. This record sets that column. What goes in it comes in the next records.

`Sidebar` already names the navigation of the shell, and `--panneau-sidebar-*` are its tokens.

## Decision

- **`Aside` in `@panneau/ui`**: the column next to the main content of a page or a form, made of panels. `AsideLayout` places it next to its main content.
    - **Beside the content from 56rem of the layout** (`AsideLayout` is a container), so that the content keeps at least 32rem. One threshold for lists and forms, measured where the aside is, not on the root.
    - **Below that width, the page chooses** (`narrow` of `AsideLayout`): `below` the content, for forms, or `overlay`, over the content on its right, the whole width on a phone, for the item panel, which opens on demand and closes.
    - **Beside the content, it stays in view**: sticky at the top, as tall as the screen at most, and its body scrolls.
    - **One look**: a card on the surface, with a border, a radius and a light shadow. Over the content, the shadow of overlays.
    - **A header**, optional: a title and the buttons of the aside, then a toolbar (the actions of an item).
    - **A button widens it** (`isWidenable`), to half of the layout by default, for previews. It shows only where widening changes something: beside the content, or over it from 40rem. A close button and Escape when the page gives `onClose`.
    - **The browser remembers** its width and its collapsed panels, under a key the page gives (`storageKey`): `panneau:<key>-size` and `panneau:<key>-panel-<id>` in `localStorage`. `usePreference`, which the app used for this, moves to `@panneau/ui`.
- **`AsidePanel`: a block of the aside.** With a title, it can be collapsed (a disclosure) and starts collapsed when `defaultCollapsed`. Without a title, it is its content. Panels are separated by a line.
- **Tokens `--panneau-aside-*`** in `@panneau/ui`: `width` (22rem), `width-wide` (50%), `bg`, `border`, `radius`, `shadow` and `padding`. They replace `--panneau-item-panel-*`.
- **The item panel is an `Aside`**, `overlay` below the threshold, with the `item-panel` key: what users remembered stays.
- **The `sidebar` node of form layouts is a panel of an `Aside`**, `below` the form on narrow screens. Its `label` is the title of the panel, which the user can collapse unless `collapsible: false`, and `collapsed: true` starts it collapsed. A node without a `label` is a panel without a title. A layout with several `sidebar` nodes has as many panels, in one aside. `Form` takes `sidebarStorageKey`, which the app sets per resource (`form-<resource>`).

## Not decided here

These are the next steps of the roadmap, each with its record when its work starts:

- **The blocks of the app in an aside** (publication, Save draft and Publish, the summary of errors, links, the preview, revisions), and **panels that plugins register**: how a definition places them, as nodes of the layout or as a property of the resource, and how abilities hide them.
- **The form of an item in the panel of its list**, with its values changed in place or saved with a button, and ↑ ↓ between items.
- **The live preview of unsaved values** next to the form ([0009](0009-preview-drafts-revisions.md)).

## Consequences

- `@panneau/ui` exports `Aside`, `AsidePanel`, `AsideLayout` and `usePreference`, and has the `aside` component tokens, with its messages in `@panneau/intl` (widen and narrow; close is the one of the UI).
- `@panneau/app` loses `itemPanelTokens` and the `item-panel` component of `appComponentTokens`: a theme that set `--panneau-item-panel-*` sets `--panneau-aside-*`. Its messages `widenPanel`, `narrowPanel` and `closePanel` give way to those of `@panneau/ui`.
- `@panneau/forms` renders the `sidebar` nodes in an `Aside`, and its skeleton too. Forms with a sidebar look different: their sidebar is a card, which stays in view as the form scrolls.
- The item panel goes beside the list from 56rem of the list's column instead of 80rem of the root: about 76rem of the root, with the navigation of the shell expanded.
