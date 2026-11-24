# 0086: One user's menu, at the bottom of the sidebar and in the dock

- Status: accepted, amended by [0104](0104-users-choose-the-density.md): the menu has a choice of the density, after the appearance, and by [#487](https://github.com/folkloreinc/panneau-js/issues/487): who is logged in links to the profile, the preferences (appearance, density, language) are rows above a menu of the actions
- Date: 2026-11-17
- Issue: [#316](https://github.com/folkloreinc/panneau-js/issues/316)
- Amends: where the language switcher sits in [0083](0083-a-language-switcher-in-the-shell.md), the "Log out" button of [0037](0037-login-page-token-and-logout.md), the link of the user's name in [0050](0050-account-page.md), and the user's menu of the dock in [0076](0076-a-dock-in-place-of-the-sidebar.md)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The footer of the sidebar grew one control at a time: the user, whose name links to their profile ([0050](0050-account-page.md)), the button of the appearance, which cycles through the color schemes, "Log out" next to it ([0037](0037-login-page-token-and-logout.md)), and the language button ([0083](0083-a-language-switcher-in-the-shell.md)). Four controls share the width of the sidebar: the email is cut, and three icons sit next to each other with only their tooltips to tell them apart. The appearance's button also hides its choices: the user presses it until the icon they want shows up.

The dock already gathers the same controls in a user's menu ([0076](0076-a-dock-in-place-of-the-sidebar.md)), as most apps do behind the avatar.

## Decision

- **One button in the footer.** The footer of the sidebar only shows the user: their avatar, their name and their email, with a chevron. The whole of it is one button, which opens the user's menu upwards. Its label is "Your account (name)".
    - In the rail, the avatar alone is the button, with the label in its tooltip.
    - Without a user in the definition, the button is "Your account", with the icon of a user.
    - On the user's profile, the button has the current state of a link of the sidebar.
- **The user's menu**, a popover, top to bottom (amended by #487):
    - **who is logged in**, their name and their whole email. When the user has a profile (their account page, or their item in the resource of users, as in 0050), it is a link to it, with an arrow and "Profile" in its tooltip; the menu has no "Profile" item. It also describes the menu for assistive technologies;
    - **the preferences**, a compact group of one row each, a small label and its control at the end: **"Appearance"** (Light, Dark and Same as the system) and **"Density"** (0104), as rows of icons (a segmented control) each named by its tooltip; **"Language"**, a select of the interface locales, each in its own language (with its `lang`), only with more than one (0083);
    - a line, then **the actions**, a menu: "Keyboard shortcuts", which opens their help ([0112](0112-one-registry-of-keyboard-shortcuts.md)); a line, then **"Log out"**, alone and last, when the app can log out (0037).

    The popover is a non-modal dialog named as the button. Tab goes through it in the order shown. A choice of the appearance or the density leaves it open, to compare; a language, the profile and an action close it. Before #487, who was logged in titled the group of "Profile", and the appearance and the language were groups of the menu, with a check on the current choice: their kinds of controls differed for no reason, and "Profile" repeated the name above it.

- **The dock has the same menu** behind its user's tab. Its top, the user with their name and email, replaces the item with the avatar of 0076.
- "Go to…" keeps its commands of the appearance and of the languages (0029, 0083).

## Consequences

- The footer has room for a long email, and the menu shows it whole. Every setting of the user is in one place, the same in the sidebar, the rail and the dock.
- Changing the appearance or the language takes two clicks instead of one, and the choices are named instead of guessed from an icon.
- The logout is no longer a button of the sidebar but an item of a menu (`menuitem`). Since #487, tests and stories find the profile as the link named after the user, the appearance and the density as radio groups (`radiogroup`, `radio`), and the language as a select (`button`, `option`), in the popover (`dialog`).
- The shell's `Sidebar` and `Dock` share the menu (`UserMenu`, internal to `@panneau/app`). `@panneau/intl` gains `panneau.app.userMenu`, the label of the button.
