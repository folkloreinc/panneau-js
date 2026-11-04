---
'@panneau/protocol': minor
'@panneau/fields': minor
'@panneau/lists': minor
'@panneau/forms': minor
'@panneau/intl': minor
'@panneau/codemods': minor
---

Credits, people and their roles ([decision 0053](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0053-credits.md)).

- **`credits`:** a new built-in type, a list of `{ person, roles, featured }`. `person` is a reference to an item of the field's `resource`, or a name (`{ name: 'Jane Doe' }`), unless `settings.names` is `false`. `roles` are references to the items of the resource that `settings.roles` names, or names in each locale (`{ name: { fr: 'Musique', en: 'Music' } }`). `settings.featured` lets users mark the credits to put forward, and `fields` are the fields of each credit. The protocol exports `Credit` and `CreditsValue`, `lintDefinition()` checks the resources of a credits field and the names of its fields, and the conformance kit checks the values of credits fields.
- `CreditsField` (`@panneau/fields/credits`): the person picker searches the relation source, creates a person when the source can, and keeps the text as a name; roles are picked and created in the resource of roles, or typed in each locale. `formatCredits()` gives them as text.
- `@panneau/lists`: `CreditsDisplay` shows the people with their roles.
- `@panneau/forms`: the errors of the parts of a credit (`credits.0.person`) show under them, not under the whole field.
- `@panneau/codemods` reports the project's own credit fields, which the `credits` type replaces.
