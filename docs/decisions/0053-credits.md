# 0053: Credits

- Status: proposed
- Date: 2026-11-04
- Issue: [#201](https://github.com/folkloreinc/panneau-js/issues/201)

## Context

Films, shows, productions, episodes and projects list who did what: a person and their roles. Six of the sites that will move to Panneau 5 have credits, and each one built its own field, with its own shape:

- a person picked in a resource of people, created from the picker when missing, with a list of roles picked in a resource of roles, and a `featured` flag;
- the same, kept in rows of a table of credits and a pivot of roles instead of a JSON value;
- a role typed as localized text, with the people who had it (`{ "title": { "fr", "en" }, "people": [...] }`): grouped by role instead of by person;
- the same, with people typed as names, without a resource of people;
- one role per person, picked in a fixed list of keys.

One of them also keeps a description per credit. Five of them have credits on images too: localized text in most of them (`{ "fr", "en" }`), a plain string in the others, under `credit`, `credits` or `image_credit`.

The migration converts these values once, with the codemods and the commands of the backends. It needs one shape to convert to.

## Decision

### A built-in type, not a preset

`credits` is a built-in type. A preset of `repeater` with a `relation` needs nothing new in the protocol, but it can't hold what credits need:

- **a person that isn't in the database.** A `relation` holds references to items. A name next to it is a second field, and every project would pick its own name for it, and its own condition to show one or the other.
- **a role as a localized label.** It is the same: a second field, for the sites without a resource of roles.
- **one shape.** A preset is a convention: a project can change its fields, and nothing checks that a value has the shape the migration wrote. A type is checked by every backend, and the codemods and the commands of the backends convert to it.
- **one control.** Picking a person, creating one, or keeping a name is one choice in one picker, not a field that a condition shows.
- **a display.** Lists show the people and their roles, where a repeater shows a count.

### Value

A list of credits, in order, or `null` when empty:

```jsonc
[
    {
        "person": { "id": "12", "label": "Ada Lovelace" },
        "roles": [{ "id": "3", "label": "Director" }],
        "featured": true,
    },
    {
        "person": { "name": "Jane Doe" },
        "roles": [{ "name": { "fr": "Musique", "en": "Music" } }],
    },
]
```

- **`person`** is a reference to an item of the field's `resource`, `{ "id", "label" }` as a `relation` value, or a name, `{ "name": "Jane Doe" }`. A client sends `{ "id" }` or the id alone; a backend may leave out `label`, and clients get it as they do for relations (`resolve()` of the relation source).
- **`roles`** is a list, empty or not. A role is a reference to an item of the resource of roles, `{ "id", "label" }`, or a name in each locale, `{ "name": { "fr": "Musique", "en": "Music" } }`.
- **`featured`** is `true` for the credits to put forward (the director of a film), and left out otherwise.
- **The fields of the credit**: a credits field can have `fields`, as a repeater does. Their values sit next to `person` and `roles` (`"description": { "fr", "en" }`). `person`, `roles` and `featured` are reserved names.

### The free name

A person is a reference when the field has a `resource`, or a name when the person isn't in it, or when the field has none.

- `settings.names` (`true` by default) allows names next to references. With `false`, every person is a reference. Without a `resource`, every person is a name, whatever `names` says.
- A name is a string, the same in every locale. A role's name is localized: it is translated where a person's name isn't.

### Roles

- `settings.roles` is the id of the resource of roles. With it, roles are references to its items. Without it, roles are names, in the locales of the definition (the locale of the user when it has none).
- A field doesn't mix them: a backend refuses a name among the roles of a field with a resource of roles, and a reference in a field without one.
- A single role, or roles from a fixed list of keys, become a list of one role, or of the items of a resource of roles.

### The field

- One row per credit: the person, the roles, the star of `featured` when `settings.featured` is `true`, then the fields of the credit. Rows move up and down, and are removed, as in a repeater.
- **The person** is a combo box over the relation source, like a `relation` field. Its last options are "Create “Jane Doe”" when the source can create items in the resource ([#29](https://github.com/folkloreinc/panneau-js/issues/29)), and "Add “Jane Doe” as a name" when names are allowed. A name shows with a mark that says it isn't in the resource.
- **Roles** with a resource are the picker of a multiple `relation`, which creates roles the same way. Without one, they are a list of text inputs, one locale at a time, as a localized field.
- `min` and `max` count the credits. `required` needs one.

### Lists

A credits value shows the people in order, featured or not, each with their roles: `Ada Lovelace (Director), Jane Doe (Music)`. Consecutive credits with the same roles share them: `Jane Doe, John Roe (Music)`, as the sites that group people by role showed them.

### Backends

- They check the shape: a person with an `id` or a `name`, roles of the kind of the field, `featured` a boolean, and the rules of the fields of the credit.
- With a `resource` or a resource of roles, they check that the ids exist, as for relations.
- How they keep the value is theirs. `laravel-panneau` keeps it as JSON in the item's attribute, with ids and without labels, and adds the labels when it serializes the item. A project that keeps credits in rows, with a pivot of roles, reads and writes them in its repository.

### Credits of images

Images keep their credit as text: a `text` field of the media library, named `credit`, localized when the project is. They don't use the `credits` type.

- On images, a credit is a line under the picture (`Photo: Jane Doe`), not a list of people with roles to link or to filter.
- Every site but one keeps it as text, and a media library is a resource: its fields are the project's (`Text::make('credit')->localized()`).
- A project that wants people and roles on its media can still give its library a `credits` field.

### Migration

- **`laravel-panneau`** converts the values kept in JSON columns with `panneau:convert-credits`, as `panneau:convert-phones` does for phone numbers:
    - a reference kept as `people://12`, an id or an object with an `id`, under `person` or another key, becomes `{ "id" }`; an object with a `name` becomes a name;
    - a single role, or roles as references or ids, become a list; a role as localized text becomes a name;
    - a credit grouped by role (a role and a list of people) becomes a credit per person, in the same order;
    - `featured` stays, and the other keys stay too, for the fields of the credit.
- The upgrade (`panneau:install --upgrade --check`) points the project's credit fields to `Credits`, and to the command.
- Credits kept in rows of a table stay in that table, read and written by the project's repository, or are moved to JSON by a migration of the project.
- **The codemods** report the project's own credit components, which the built-in type replaces.

## Consequences

- The protocol lists the `credits` type, the `CreditsValue` of its values, and its settings: `names`, `roles` and `featured`.
- `@panneau/fields` gets the `credits` field, on the combo box and the relation source of `relation` fields. `@panneau/lists` gets its display.
- `laravel-panneau` gets the `Credits` field and `panneau:convert-credits`.
- A default role per person, which a site fills when a person is picked, isn't part of the type.
- Text about credits that isn't a list of people (a paragraph of thanks) stays a text field next to the credits.
