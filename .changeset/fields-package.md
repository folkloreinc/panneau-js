---
'@panneau/fields': major
---

Add `@panneau/fields`: controlled fields for the protocol's built-in types (text, textarea, number, boolean, date, datetime, time, select, email, url, color, slug, localized values, group, repeater with typed blocks, relation), one subpath per field. Each subpath also exports the registry entry of its type; `builtInFields` and `fieldsPlugin` gather them, and `FieldsProvider` gives nested fields their components, locales, relation source and a binding to a store by path. `createRelationSource()` searches any adapter with a `list()` method, such as `@panneau/data`'s. `richtext` and `media` render a placeholder until their plugins exist.
