# 0065: Compound fields: plugin types made of sub-fields

- Status: proposed
- Date: 2026-11-05
- Changes: the sessions of [0053](0053-date-ranges-and-money.md), which become a compound field

## Context

Some fields come back in many sites, but they are made of other fields:

- **credits**: a person, or a name when the person isn't in the database, their roles, and whether the credit is featured. About seven sites that move to Panneau 5 have them. As a built-in type (#201, #219), it was too specific, and it was closed;
- **sessions** of a performance or a screening: dates and a venue, and the fields of each site. [0053](0053-date-ranges-and-money.md) made them a `repeater` built by a laravel-panneau preset;
- **the publication** of an item: whether it is published, its date, and its status.

As a `group` or a `repeater`, each one works, but it is hard to use: the parts are stacked, the items of a repeater are titled "Item 2", and lists show the value as text. As a built-in type, each one adds a shape that every backend must check, for one use.

## Decision

**A compound field is a field type provided by a plugin that carries its sub-fields in `fields`.** The type says what the field is. The sub-fields say what its value holds:

```jsonc
{
    "name": "credits",
    "type": "credits",
    "multiple": true,
    "fields": [
        { "name": "person", "type": "relation", "resource": "people" },
        { "name": "name", "type": "text", "visibleWhen": { "field": "person", "filled": false } },
        { "name": "roles", "type": "relation", "resource": "roles", "multiple": true },
        { "name": "featured", "type": "boolean" },
    ],
}
```

- **Value:** an object of its `fields`, as a `group`, or a list of them with `"multiple": true`, as a `repeater` (the `multiple` of `relation`, `media` and `country`). Rules, `visibleWhen`, defaults and error paths (`credits.1.name`) follow that shape. Nothing else is new in the protocol: no attribute names a base type.
- **Fallback:** a client without the type's plugin renders a type it doesn't know that has `fields` as a `group`, or as a `repeater` with `multiple`. A type without `fields` still shows the placeholder that names the missing plugin. `getNestedShape()` of `@panneau/protocol/runtime` gives the shape, for a `group`, a `repeater` or a compound field.
- **The definition decides the sub-fields.** A site adds its own (a note per credit, a price per session) after those of the type. The plugin lays out those it knows by name, and shows the others after them.
- **Lists:** a compound field isn't a default column. A column of one shows the summary of its plugin, items joined by commas (`Ada Lovelace (Director), Jane Doe`), or its value as text without the plugin. Details show it as one value.

**`defineCompoundField()`** in `@panneau/fields` makes the entry of a compound type from a `layout` (the parts of one value, by name) and a `summarize` (one value as text: the title of an item in the form, and the value in lists and details). It renders through `GroupField` or `RepeaterField`, so that each part binds to its own path and shows its own errors. A project writes its own compound types the same way.

**Official compound types, each a plugin of its own entry point**, loaded only by the projects that use them:

- `credits` (`@panneau/fields/credits`): `person`, `name`, `roles` (references, or a text, localized or not) and `featured`;
- `sessions` (`@panneau/fields/sessions`): `dates` and `venue`. A `Sessions` field of laravel-panneau describes `"type": "sessions"` with `multiple`; without the plugin, it is the repeater of 0053.

**The publication is a layout component, not a field.** Its parts (`published`, `published_at`, `status`) stay at the top of the resource, where lists filter, sort and edit them in place, and where abilities apply. `publication` (`@panneau/forms/publication`) is a `component` node of the form layout that frames the fields of its children under the state of the item: `Published` (`success`), `Scheduled` (`info`, a date to come), or `Not published` (`neutral`), with its date. A `select` status with an option for the value gives the state its label and tone (`Draft`, `In review`).

- A `component` node now gets its children, rendered, and the fields of the form. **A `component` node without its plugin renders its children**, so that the fields it frames stay in the form.
- Drafts and revisions ([0009](0009-preview-drafts-revisions.md)) will show in this component when a resource has them: the draft that isn't published, the publish and unpublish actions, the number of the version and a link to the history. They are not decided here.

## Consequences

- A field common to several sites is a plugin and a builder, not a built-in type: the protocol keeps its types, and a backend checks a compound field as the group or the repeater it is.
- A site that doesn't load a plugin still edits the value, as a group or a repeater.
- laravel-panneau gets `Credits`, and its `Sessions` describes `"type": "sessions"`.
- A credit of a person who isn't in the database is a `name` next to `person`: a combobox that offers "Add “…” as a name" in the person's picker is a later improvement of the `credits` plugin.
