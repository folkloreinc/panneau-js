---
'@panneau/intl': major
---

Add `@panneau/intl`: the messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` in one place. `withPanneauMessages(locale, messages)` merges the messages of every package for a locale with an app's (`fr-CA` falls back to `fr`), `getPanneauMessages(locale)` returns them, and `en`, `fr` and `panneauMessages` are the catalogs. It also exports the message descriptors (`uiMessages`, `fieldsMessages`, `formsMessages`), typed with the values each message takes. A test checks that every message has a French translation with the same arguments.
