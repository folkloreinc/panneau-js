# 0104: Users choose the density

- Status: accepted, amended by [#487](https://github.com/folkloreinc/panneau-js/issues/487): the density is a row of icons, after the appearance's, in the "Preferences" section of the menu, closed at first, above the actions
- Date: 2026-11-23
- Amended: the picker offers Compact, Comfortable and Large instead of "Default" (see the amendment below)
- Issue: [#440](https://github.com/folkloreinc/panneau-js/issues/440)
- Amends: who sets the density in [0024](0024-theme-model.md) (section 5) and the user's menu of [0086](0086-one-user-menu.md)
- Builds on: [0072](0072-touch-targets-follow-the-density.md) (touch targets follow the density)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The density of the app is the definition's: `theme.density`, `auto` without one ([0024](0024-theme-model.md)). The backend sets it for everyone. Someone who spends the day in long lists can't make them denser, and someone who finds the controls small can't make them roomier, while both can already choose the appearance in their menu ([0086](0086-one-user-menu.md)).

## Decision

- **The user's menu has "Density"**, after "Appearance", as a row of icons each named by its tooltip, with a small label, in the "Preferences" section, closed at first, above the actions (since #487; it was a group of the menu, with a check on the current choice):
    - **Compact** and **Comfortable**, the densities of a mouse and a keyboard;
    - **Default**, the definition's density, checked until the user picks another. It is how the user goes back to what the site sets, and follows the site if it changes its density.

    `touch` and `auto` aren't offered. They exist for devices: `touch` is for fingers, and `auto` chooses between comfortable and touch by the pointer. A definition can still set either, and "Default" is then that density.

- **"Go to…" has a command for each other choice**, "Density: compact", as it has for the appearance.
- **The browser remembers the choice**, as it does the color scheme: `localStorage`, under `panneau:density`. Without a choice, or with a value it doesn't know, the app takes the definition's density.
- **Touch screens keep their targets** ([0072](0072-touch-targets-follow-the-density.md)). When the definition's density is `auto` and the main pointer is coarse, the app is in the touch density whatever the user chose, and the menu and the palette have no density: a choice there would change nothing. The choice made with a mouse stays kept for when the pointer is fine again.
- **A definition can lock the density**: `theme.lockDensity: true`. The definition's density is then the only one: the menu and the palette have no density, and a choice kept in the browser is ignored. It is for a backend whose density is part of its design, such as a kiosk in the touch density.

## Consequences

- The protocol gains an optional key, `theme.lockDensity`: definitions without it show the choice, with their density as the default.
- `@panneau/intl` gains `panneau.app.densityTitle`, `panneau.app.densityOption` and `panneau.app.density`.
- The density lives in the app (`useDensityPreference()`, internal to `@panneau/app`), which gives `PanneauRoot` the density in effect. `@panneau/ui` doesn't change: a density is still one value of the root or a scope.
- The choice is per browser, not per account, like the appearance: a backend that wants it to follow the user across devices would need a preference in the protocol, which is left for later.

## Amendment: Large instead of Default

The row keeps three icons, like the appearance's, but offers **Compact**, **Comfortable** and **Large**, the `touch` density, which a mouse user can now pick too. There is no "Default" button:

- Without a choice, the button that matches the definition's density is checked (`touch` is Large, `auto` is Comfortable, since a coarse pointer has no choice at all). Choosing that button clears the kept choice instead of storing it, so the app follows the definition again if it changes its density. It is how the user goes back to what the site sets.
- A value `default` kept by the previous version isn't a choice anymore: it reads as none, so the definition's density applies and the matching button is checked.
- `lockDensity` and `auto` on a touch screen don't change: the menu and the palette have no density, and the choice kept is ignored (0072 stays true).
- "Go to…" has a command for each choice but the one in effect, "Density: large".
- `@panneau/intl`: `densityOption` and `density` say "Large" / "Grande" for the third choice.
