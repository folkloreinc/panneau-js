# 0079: Collapsible groups and emphasized entries in menus

- Status: proposed
- Date: 2026-11-17
- Builds on: [0046](0046-abilities-in-the-ui.md) (menus by abilities), [0076](0076-a-dock-in-place-of-the-sidebar.md) (the dock)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

A `group` of a menu is a title over its links, always open. An admin with many resources (a few main ones, and a dozen logs and settings that are opened now and then) gets a long sidebar where every entry weighs the same: the main resources are lost among the others, and the user scrolls past groups they rarely open.

## Decision

- **A group can be collapsible**: `{ "type": "group", "label": "Logs", "collapsible": true }`. Its title is a button that shows or hides its links (`aria-expanded`), with a chevron.
    - **`collapsed: true`** starts it closed, for the groups that are rarely opened. It implies `collapsible`.
    - **The user's choice is remembered** by the browser, per group (`usePreference`, under its label), and wins over `collapsed`.
    - **Without a choice, a group that holds the current page starts open**, even with `collapsed`: the current page is never hidden when the app loads on it.
    - A group without a label can't be collapsed: it has no title to press. `collapsible` is then ignored.
- **An entry can be emphasized**: `"emphasis": true` on a `resource`, `page` or `link`. Its label is bold, for the few entries that matter most. It changes nothing else: its place, its icon and its abilities stay.
- **Where they apply.** The sidebar collapses groups and shows emphasized entries in bold.
    - **The rail** (the sidebar collapsed to its icons) shows every link, as before: its groups have no titles to press.
    - **The dock** already shows a group behind a button: `collapsible` changes nothing there. Emphasized entries are bold in its menus.
    - **"Go to…"** lists every link, collapsed or not.
- **Both are optional and left out when false**: definitions without them show the same menus.

## Consequences

- Backends write `collapsible`, `collapsed` and `emphasis` in menus (`MenuItem::group(...)->collapsible()`, `->collapsed()` and `->emphasis()` in `laravel-panneau`).
- A collapsed group still counts its links for abilities (0046): a group left empty is left out, collapsed or not.
- A project that renames a group loses the choice remembered for it, as the label is its key.
