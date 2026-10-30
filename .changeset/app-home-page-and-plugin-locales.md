---
'@panneau/app': patch
'@panneau/ui': minor
---

The app loads the messages of its plugins, and its home route follows the definition.

- `<Panneau>` and `createPanneauApp()` load the messages that plugins provide (`locales`) in the locale of the definition, over Panneau's, before they render the shell. A plugin's pages no longer need an `IntlProvider` of their own. Messages that fail to load are left out, with an error in the console.
- The home route renders `pages.home` of the definition when it has one, as decision 0019 says: the page of a plugin, with its `props`, or the built-in `dashboard` (the cards of the resources until the dashboard has widgets). Without it, the home is the cards of the resources, as before.
- `PanneauRoot` takes `messages`, added to Panneau's in the `IntlProvider` it provides when there is none above it.
