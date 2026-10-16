# @panneau/ui

## 5.0.0-alpha.1

### Major Changes

- 10aaed0: Add `@panneau/ui`: the design tokens (`--panneau-*` CSS variables), a sober default theme in light and dark, a Bootstrap-compatible theme, `PanneauRoot`, and accessible primitives on React Aria Components (buttons, text, number, select, combo box, checkbox, switch, radio, date and time inputs, dialog, popover, menu, tabs, tooltip, toasts, alert, badge, spinner, card, disclosure), with Lucide icons and English and French messages.

### Minor Changes

- dbab586: Icons by name. `getNamedIcon(name)` of `@panneau/ui` turns a Lucide icon name (`"send"`) into an icon component, which loads that icon the first time it renders (one dynamic import per icon), with an empty space of the same size until then. `loadNamedIcon(name)` loads one ahead of time. `@panneau/lists` shows the icon an action names (`"icon": "send"`), and takes icon components by action id for actions written in code (`actionIcons={{ archive: Archive }}` on `ListView` and `List`), which win over names. `getActionIcon()` and `ActionIcons` are exported.
- 8d1313a: The messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` now live in `@panneau/intl`. `@panneau/ui/locales`, `@panneau/fields/locales` and `@panneau/forms/locales` still export the `en` and `fr` messages of their package, but are deprecated: use `withPanneauMessages()`, `en` or `fr` from `@panneau/intl`, which have the messages of every package. `fieldsPlugin` now carries the French messages of every package, those of `@panneau/forms` included.
- daf7c87: `PanneauRoot` provides an `IntlProvider` when there is none above it, with the messages of every Panneau package (from `@panneau/intl`) in its `locale`: `<PanneauRoot locale="fr">` renders in French without any react-intl setup. Without a `locale`, or with one Panneau doesn't translate, it renders in English, as before. An app's own `IntlProvider` is kept as is.

### Patch Changes

- 56a9917: Document how Vite apps keep `getNamedIcon()` from splitting `lucide-react` into one chunk per icon in development: exclude `lucide-react/dynamicIconImports.mjs` from `optimizeDeps`. Panneau's Storybook does it, and named icon stories wait longer for their first icon.
- Updated dependencies [712dfcb]
- Updated dependencies
- Updated dependencies [8d1313a]
- Updated dependencies [9c844ee]
  - @panneau/intl@5.0.0-alpha.1
