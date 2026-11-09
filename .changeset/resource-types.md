---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/intl': patch
'@panneau/app': patch
---

Resource types (decision 0076). A resource's `types` are now `ResourceType`s, with a `description`, an `icon` and `abilities`: `abilities.create: false` keeps a type out of the choices when creating (a singleton such as the home page). Items of a resource with types have a `type`, which a create sends and updates ignore, and their fields are those of the resource, then those of their type. `lintDefinition()` lets `form.layout` name the fields of the types, checks their references, and reports duplicate type ids, type fields named as a field of the resource or `type`, and a field `type` that isn't `notInForm`. `@panneau/protocol/runtime` has `getResourceType()`, `getItemType()`, `getCreatableTypes()`, `getTypeFields()`, `hasResourceTypes()` and `ITEM_TYPE_KEY`, and the mock backend checks and saves the type of items.

`resolveResource()` of `@panneau/core` allows creating in a resource with types only when one of its types can be created.

In the app, the create button of a list with several types to create is a menu of them, and the "Go to…" palette has a create entry per type. The create route takes the type, `/resources/{resource}/create/{type}`; without one, it shows a card per type, or the form of the only type that can be created. Forms and the item panel show the fields of the item's type, and a new item is saved with its type.
