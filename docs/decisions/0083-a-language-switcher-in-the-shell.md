# 0083: A language switcher in the shell

- Status: accepted, amended by [0086](0086-one-user-menu.md): the language switcher is in the user's menu, a select among its preferences since [#487](https://github.com/folkloreinc/panneau-js/issues/487)
- Date: 2026-11-17
- Builds on: [0052](0052-oauth-providers.md) (a backend's URL, a full navigation with `next`), [0076](0076-a-dock-in-place-of-the-sidebar.md) (the dock)
- Issue: [#305](https://github.com/folkloreinc/panneau-js/issues/305)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

The definition is built in the locale of the request: its labels, its menus and its messages (`locale`). The user can't change it from the app. A project that wants to offer it adds a link to its menu, such as "English" at the bottom of the sidebar, to a route of its own that keeps the choice and comes back. The language then looks like a page of the menu, and every project writes the same route.

`locales` doesn't say which languages the interface has: it lists the locales of localized fields, the languages of the content. A site can have its content in two languages and its admin in one, or the reverse.

## Decision

- **`interfaceLocales`** in the definition lists the languages the user can switch the interface to: `[{ "locale": "fr", "label": "Français", "url": "/panneau/api/locale/fr" }, …]`.
    - `label` is the name of the language in that language, as language menus write them.
    - `url` is where the browser goes to switch, a full navigation, like the providers of 0052. The app adds `next`, the path and query of the page, and the backend comes back to it. The backend keeps the choice as it likes: in the session, or as a preference of the user.
    - The `locale` of the definition is one of them: the app checks it in the switcher. Without `interfaceLocales`, or with a single one, the app has no switcher.
- **The switcher belongs to the shell, not to the menus.** It sits with the user's settings:
    - **In the sidebar**, a button with the language icon in the footer, beside the color scheme, opens a menu of the languages, with the current one checked. In the rail, the button stays, as the color scheme's does.
    - **In the dock**, the user's menu has a "Language" section after "Appearance", as its color schemes are.
    - **"Go to…"** has a command for each other language, as it has for the color schemes.
    - Each language is labeled in its own language, with its `lang`.
- **Switching reloads the app.** The definition, the labels of the plugins, the dates and numbers, and the data already loaded are all in the locale of the request: a new page load gets them all again in the new one. As for other pages outside the app, the browser asks first when a form has unsaved changes.
- **The endpoint.** `GET {api}/locale/{locale}?next=…` is optional in the protocol, for a backend that serves the `url` itself: it switches the session to the locale, then redirects to `next`, a local path under the base path of the app, or to the app. A locale it doesn't offer is a `404`.
- **Auth modes.** The switcher only needs the definition, so it works in both modes. In `external` mode, the site may already have a language of its own for its pages: the backend gives the URL of its own switch, or keeps the choice of Panneau for Panneau's routes only.
- **The login page** isn't covered: before a login, there's no definition. It is in the locale of the request, as before.

## Consequences

- Projects drop the menu links and the routes they wrote for this: `laravel-panneau` lists `panneau.interface_locales` in the definition, serves the endpoint, and applies the choice on Panneau's routes.
- The protocol gains an optional key and an optional endpoint: definitions without `interfaceLocales` show the same app.
- A change of language costs a page load, which is rare, and keeps every label of the app in one locale.
