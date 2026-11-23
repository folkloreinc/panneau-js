# 0086: One user's menu, at the bottom of the sidebar and in the dock

- Status: accepted, amended by [0104](0104-users-choose-the-density.md): the menu has a choice of the density, after the appearance
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
- **The user's menu**, in this order:
    - who is logged in, their name and their whole email, as the title of a first group; in it, **"Profile"**, when the user has one (their account page, or their item in the resource of users, as in 0050);
    - **"Appearance"**: Light, Dark and Same as the system, as choices with a check on the current one;
    - **"Language"**: the interface locales, each in its own language, with a check on the current one, only with more than one (0083);
    - a line, then **"Log out"**, when the app can log out (0037).
- **The dock has the same menu** behind its user's tab. Its first group, the user with their name and email, replaces the item with the avatar of 0076.
- "Go to…" keeps its commands of the appearance and of the languages (0029, 0083).

## Consequences

- The footer has room for a long email, and the menu shows it whole. Every setting of the user is in one place, the same in the sidebar, the rail and the dock.
- Changing the appearance or the language takes two clicks instead of one, and the choices are named instead of guessed from an icon.
- The profile, the appearance and the logout are no longer buttons and links of the sidebar but items of a menu: tests and stories find them in the menu (`menuitem`, `menuitemradio`).
- The shell's `Sidebar` and `Dock` share the menu (`UserMenu`, internal to `@panneau/app`). `@panneau/intl` gains `panneau.app.userMenu`, the label of the button.
