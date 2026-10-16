---
'@panneau/ui': minor
---

`PanneauRoot` provides an `IntlProvider` when there is none above it, with the messages of every Panneau package (from `@panneau/intl`) in its `locale`: `<PanneauRoot locale="fr">` renders in French without any react-intl setup. Without a `locale`, or with one Panneau doesn't translate, it renders in English, as before. An app's own `IntlProvider` is kept as is.
