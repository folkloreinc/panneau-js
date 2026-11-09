# 0075: A dock, in place of the sidebar

- Status: proposed
- Date: 2026-11-09
- Builds on: the first version of the shell ([roadmap](../roadmap.md)), [0029](0029-go-to-palette.md) (the "Go to…" palette), [0045](0045-current-context.md) (the current context), [0050](0050-account-page.md) (the account page)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The shell has one frame: the sidebar of the `main` menu on the left, collapsible to a rail of icons, and the page on a raised panel. On a small screen, a bar at the top opens the sidebar as a drawer.

An admin with a few sections doesn't need a column for them, and wants the whole width for its lists and forms. On a phone, a drawer hides the sections behind a button, where a bar of tabs at the bottom keeps them in reach of the thumb. Both ask for the same frame: the navigation in a dock at the bottom of the window, as in the dock of an operating system or the tab bar of a phone app.

## Decision

- **The definition chooses**: `theme.navigation` is `sidebar`, the default, or `dock`. It is in the theme with `colorScheme` and `density`: a choice of presentation, made by the backend, that doesn't change the menus. The menus, their groups and their icons stay the same in both frames.
- **`DockLayout` in `@panneau/app`**, next to `AppLayout`, renders the same parts in another place:
    - **a bar at the top**, which scrolls with the page: the site, as in the sidebar, and the current context in a button that opens its picker;
    - **the page on a raised panel**, as wide as the window less its insets;
    - **the dock**, fixed at the bottom: a raised pill, centered, with the shadow of overlays.
- **What the dock holds**, in this order:
    - the entries of the `main` menu: a link is its icon with a short label under it, and the current one is raised as in the sidebar. A group is a button with its icon and its label that opens a menu of its links, upwards, and is current when one of them is. A group without a label is its links. A separator is a vertical line;
    - after a line: "Go to…" (with Ctrl+K / ⌘K, as before), the queued action runs while there are some, and the user's menu.
    - **The user's menu** is the user's avatar and name: their profile when the definition has the resource of users, the color scheme as three choices, and "Log out".
- **Below the `lg` width of the root** (64rem), the dock is a bar of tabs across the bottom of the window, above the safe area of phones:
    - the first three entries (the home page first), then "More", a menu of the others, with the links of each group under its label, then the user's menu: five tabs at most;
    - "Go to…" and the action runs move to the bar at the top, as in the small screens of `AppLayout`.
- **The frame keeps what sticks to the bottom above the dock.** The layout sets `--panneau-frame-bottom` to the space the dock takes at the bottom of the window:
    - the footer of forms sticks at that distance from the bottom, instead of `0`;
    - an aside beside the content is that much shorter;
    - toasts rise above the dock (`useToastOffset`).
      `AppLayout` doesn't set it, and everything stays as before.
- **Nothing collapses**: Ctrl+\ / ⌘+\ does nothing, and the "Go to…" palette has no command for the sidebar.
- **Tokens `--panneau-dock-*`** in `@panneau/app`: `bg`, `border`, `radius`, `shadow`, `item-color`, `item-hover-bg`, `item-current-color` and `item-current-bg`. The `shell` tokens still style the window and the panel.
- **The skeleton of the shell** draws the dock when the definition in the boot config says so, and the sidebar otherwise.

## Not decided here

- **A choice of the user** between the sidebar and the dock, remembered by the browser like the color scheme.
- **Items that plugins add to the dock**, such as a shortcut to create an item.
- **Hiding the dock** while the page scrolls down, on phones.

## Consequences

- `@panneau/protocol` adds `navigation` to the definition's theme, and the Laravel package can set it.
- `@panneau/app` renders `DockLayout` when the definition asks for it, and exports `dockTokens`, in `appComponentTokens` under `dock`. Its messages add "More".
- The items of menus that are links (`href`) aren't underlined any more, in `@panneau/ui`.
- `@panneau/forms` and `@panneau/ui` read `--panneau-frame-bottom`, with `0px` as its default: the footer of forms and asides beside the content don't change without it.
