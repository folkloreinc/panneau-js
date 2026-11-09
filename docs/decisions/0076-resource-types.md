# 0076: Resource types

- Status: proposed
- Date: 2026-11-09
- Changes: `types` of a resource in the [protocol](../protocol.md#resource), which only had an `id`, a `label` and `fields`
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x; the backend is [folkloreinc/laravel-panneau#138](https://github.com/folkloreinc/laravel-panneau/issues/138)

## Context

In 1.x, a resource could list `$types`: the items of one table, told apart by a `type` column, each type with fields of its own and its own `canCreate`. The sites moving to Panneau 5 use them for pages: one audited site has 12 page types over three resources, each with 0 to 7 fields of its own on top of the common ones. Block types became the `types` of a `repeater`; resource types had nothing.

The protocol already let a resource declare `types` (an `id`, a `label` and `fields`, the shape of a block type), and `resolveForm()` added the fields of a type given to it. Nothing else used them: an item didn't say its type, the app created and edited items with the resource's fields only, and nothing forbade creating a type.

From the 1.x sites, a type needs:

- a label, in the definition;
- creating an item asks for its type first, and a type can forbid creation (singletons such as the home page);
- the form shows the resource's fields and those of the item's type;
- the list can show and filter by type;
- the backend knows the item's type when it serializes and saves it.

## Decision

- **A resource type** (`ResourceType`) has an `id`, a `label`, an optional `description` and `icon`, its own `fields`, and `abilities`. `abilities.create: false` keeps it out of the choices when creating, and the backend refuses to create one. Its items can still be edited, by their own abilities.
- **Items say their type.** An item of a resource with `types` has `type`, the id of its type. It is set when the item is created: the body of `POST /resources/{resource}` has `type`, and a type the resource doesn't have, or no type, is a `422` with `errors.type`; a type that can't be created is a `403`. Updates ignore `type`.
- **The fields of an item** are those of the resource, then those of its type, in forms, details, validation and field checks. Type fields are named apart from the resource's, and none of them is named `type`.
- **One layout.** The resource's `form.layout` can name the fields of every type: the form of a type leaves out the nodes of the others, and adds its fields that the layout doesn't name at the end.
- **Creating asks for the type first.** The create route has the type: `/resources/{resource}/create/{type}`.
    - The list's create button is a menu of the types the user can create, and the "Go to…" palette has a create entry per type.
    - `/resources/{resource}/create` without a type shows a card per type, or goes straight to the form when only one type can be created.
    - A type the resource doesn't have is not found; one that can't be created is forbidden. The form's title is the type's label: "New Event".
- **A resource can create items** when its abilities allow it and one of its types can be created.
- **Lists show and filter by type with what they have.** The backend declares a `select` field `type` whose options are the types, with `notInForm: true` since the form doesn't change it, and a `select` filter `type`: columns, details and filters then work as for any field. `lintDefinition()` requires a field `type` in a resource with types to be `notInForm`.
- **`@panneau/protocol/runtime`** has the helpers: `getResourceType()`, `getItemType()`, `getCreatableTypes()`, `getTypeFields()`, `hasResourceTypes()` and `ITEM_TYPE_KEY`. The mock backend implements the rules above.

## Consequences

- `laravel-panneau` can give resources `types()`, with a `ResourceType` (`id()`, `label()`, `fields()`, abilities), add the `type` field and filter, and save and serialize the type ([folkloreinc/laravel-panneau#138](https://github.com/folkloreinc/laravel-panneau/issues/138)). `panneau:install --upgrade --check` and the Rector rules can then port 1.x `$types`.
- Changing the type of an item isn't possible from the admin: a resource action can do it, with the fields of the new type to fill.
- List columns name the resource's fields only, not those of a type: a column for some items only would be empty for the others.
- One layout for every type keeps the definition short. A type with a layout of its own can come later, as `form.layout` on the type.
