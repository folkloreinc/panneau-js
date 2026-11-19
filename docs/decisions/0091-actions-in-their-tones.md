# 0091: Actions in their tones

- Status: accepted
- Date: 2026-11-18
- Extends: [0060](0060-row-actions-colored-icons.md) (the colored icons of rows), [0088](0088-destructive-actions-in-a-menu.md) (the actions that destroy, outlined last)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

Since [0060](0060-row-actions-colored-icons.md), rows show their actions as icons in their colors: `show` `info`, `edit` `accent`, `restore` `success`, and those that destroy `danger`. Every other action is `neutral`, and a project can't say otherwise: an action declared by a resource, such as its page on the site or "Publish", looks like any other.

The header of an item, in its form and its panel, is grey: since [0088](0088-destructive-actions-in-a-menu.md), only the actions that destroy are outlined in their color. A user tells its actions apart by reading their labels, where the rows of the list let them recognize them at a glance.

## Decision

- **An action has a tone.** The protocol's action takes `tone`, a tone of the theme (`info`, `success`, a theme's own tone…), for the actions a resource declares.
- **Its tone, in order:**
    1. `danger` for an action that destroys, whatever it declares;
    2. the tone it declares;
    3. the tone of a built-in action, as in 0060: `show` `info`, `edit` `accent`, `restore` `success`;
    4. `info` for a `link` whose URL leaves the admin (`https://…`), such as the page of an item on the site, which opens in a new tab;
    5. `neutral` otherwise.
- **Where it shows.** In rows, the icon is in its tone, on a tinted background, as in 0060. In the header of an item (its form and its panel), the button is outlined in its tone, without a fill, as the actions that destroy are since 0088. A `neutral` action stays a secondary button, and nothing is ever solid there: the solid button of a form is "Save".
- **The toolbar and the selection don't change.** Their actions keep their style.
- A tone never stands alone: every action keeps its label, as the accessible name of an icon and its tooltip in rows.

## Consequences

- "View on the site" is blue in rows and in the header of every resource that declares it, without saying so.
- A resource can color "Publish" `success`, or an action of its own a tone of its theme (`'tones' => ['brand' => …]`).
- `getActionTone()` of `@panneau/lists` gives the tone of an action, for rows and for the header of an item.
- `laravel-panneau` writes `tone` with `tone()` on its actions.
