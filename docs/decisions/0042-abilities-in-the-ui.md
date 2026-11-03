# 0042: Abilities of pages and fields, and a forbidden state

- Status: accepted
- Date: 2026-11-03
- Issue: [#183](https://github.com/folkloreinc/panneau-js/issues/183)
- Extends: [0011](0011-permissions.md), after [0040](0040-row-links-and-open-mode.md) for the actions of items

## Context

[0011](0011-permissions.md) sends abilities to the UI: per resource in the definition (`viewAny`, `create`), per item in the API (`view`, `update`, `delete`, `duplicate`, action ids). The UI hides what they don't allow, and the backend still checks. [0040](0040-row-links-and-open-mode.md) applied them to the built-in item actions. The rest of the UI doesn't follow them yet:

- **Pages have no abilities.** A backend that doesn't want a user on a page leaves it out of the definition, and its route then says "not found".
- **Routes reached without the ability** say "not found" (a resource without `viewAny`), or render a form that fails on save (the create route without `create`, the edit route of an item without `update`). A `403` from the API shows the generic load error, with a "Retry" that can't help.
- **Fields can't be hidden or read-only for one user.** The definition is the current user's, but a backend that leaves a field out breaks the layouts and columns that name it, which `lintDefinition()` refuses. `readOnly` says a field is never edited (a computed value), not that this user can't.
- **Bulk actions.** A user who can't delete anything still gets the checkboxes of the built-in `delete` (0040), and a "Delete" whose items are all skipped.

The contests platform, pilot of phase 2, has three roles: admins, managers, and clients who reach their own contests, read their stats and exports, and edit some things only when they are granted. Each of them sees one admin, built from the same definition.

Other admins do it the same way. Nova and Filament hide a resource from the navigation by its policy's `viewAny`, gate bulk deletion with a resource-level ability (`deleteAny` in Filament), and hide fields (`canSee()`, `visible()`) or make them read-only (`readonly()`, `disabled()`) for the current user. Both answer `403` on a page the user can't open.

## Decision

### Pages

- **`abilities` on a page:** `{ "view": false }`. The page is left out of menus, and its route shows the forbidden state. Without `abilities`, or without `view: false`, the page is allowed: pages had no abilities before.
- A backend can still leave out a page the user should not know about: its route is then "not found".
- **The home page:** `pages.home` with `view: false` is replaced by the built-in home, the cards of the resources, rather than a forbidden home page.

### Menus

- An entry is shown when its target is: a `resource` entry needs the resource's `viewAny`, a `page` entry the page's `view`. `resources` lists the resources the user can list.
- A group without any entry left is left out (as before). So is a separator at the start or the end of the menu, or next to another one.
- A `link` entry to another URL has no abilities: a backend leaves it out of the definition of a user who can't follow it.

### Routes and the forbidden state

- **The forbidden state** is a page of the app: a title ("You can't open this page"), a sentence, and a link to the home page. It keeps the shell and its menu. A `401` still goes to the login, as before.
- It shows:
    - on the list and show routes of a resource without `viewAny`;
    - on the create route of a resource without `create`;
    - on the route of a page with `view: false`;
    - when the request of a page answers `403`: the list of a resource, or the item of a form. In the item panel, a `403` shows the same message in the panel.
- **The edit route of an item that can't be updated** (without `abilities.update: true`) goes to its show route, as 0040 opens such an item, replacing the entry of the history. When the item can't be viewed either, it shows the forbidden state.
- A resource that isn't in the definition is still "not found".

### Fields

- **`abilities` on a field:** `{ "view": false }` or `{ "update": false }`. Only `false` restricts: a field without `abilities`, or without one of them, is allowed, as fields had none before.
    - `view: false`: the field is left out of forms, details, list columns, sorts and inline editing, as if it weren't in the definition, but layouts and columns that name it stay valid. Items don't carry its value. Its filter, if the list has one, is the backend's choice: it leaves it out of the definition when the filter would tell its values.
    - `update: false`: the field is read-only in forms, and not editable inline. The backend ignores its value on create and update, as it ignores `readOnly` fields, so a form that sends it still saves.
- They apply to the fields at the top of a resource and of its types, as `check` does. Nested fields (in a `group` or a `repeater`) follow their parent.
- `readOnly` keeps its meaning: a field nobody edits.

### Actions

- **`abilities.run: false` on an action** hides it for the user, in rows, the toolbar, the panel and the form (0011). It also applies to the built-in item actions: a resource whose user can't delete any item declares `{ "id": "delete", "abilities": { "run": false } }`, and the list has no "Delete" and no checkboxes for it. Lists have checkboxes only when a selection action can run.
- Actions on a selection that no item of the page allows stay shown: "Select all" reaches items of other pages, and its dry run counts those it skips (0017).

### Create buttons

`create` on a resource hides every way to create one of its items: the button of its list, "Create" in the "Go to…" palette, the button of a `relation` field that creates the related item, and the upload of a media picker, as before for some of them. The create route shows the forbidden state.

### Conformance

The conformance kit checks that the API agrees with the abilities the definition and the items announce, without changing anything:

- every resource without `viewAny` answers `403` on its list;
- the tested resource's fields with `view: false` have no value in its items;
- an item of the tested resource without `delete` is skipped (`forbidden`) by a dry run of the built-in `delete`;
- with `writes`: an item without `update` answers `403` to an empty update (`PATCH` with `{}` and its `If-Match`), and a resource without `create` answers `403` to an empty create.

## Not decided here

- **Abilities of a field per item** (a field that some items let the user edit): the definition is per user, not per item. When a project needs it, an item could carry them.
- **Menus by a current context** (the contest, then the client, on the contests platform) and pages and menus in `laravel-panneau`'s definition are the work of the shell.
- **Roles.** Which user gets which abilities is the backend's: `laravel-panneau` has an optional roles module (its decision 0014).

## Consequences

- Additive in the protocol: `abilities` is optional on `Page` and on `Field`, with the meaning above. The JSON Schema and the OpenAPI document follow. The mock backend reads the abilities of resources (`403` on lists without `viewAny`, creates without `create`), of items (`403` on updates without `update`), and of fields (values of hidden fields left out, values of read-only ones ignored).
- **What changes for definitions written before this decision:** the list of a resource without `viewAny` was "not found", and is now forbidden. The edit route of an item without `update: true` goes to its panel: with a backend that sends no abilities on its items, the edit route needs `update: true` on each item, as 0040 already asks for "Edit".
- `@panneau/core`'s `resolveFields()` and `resolveForm()` leave out fields with `view: false` and make those with `update: false` read-only; `resolveList()` leaves their columns, sorts and inline editing out. `canViewField()` and `canUpdateField()` say it for one field, and `canViewPage()` for a page. `@panneau/app` has a forbidden page, and leaves out the menu entries the user can't reach.
- `laravel-panneau` sends the abilities of fields and pages, leaves the values of hidden fields out of its items, ignores those of read-only ones, and declares the built-in `delete` with `run: false` when the policy's `deleteAny` refuses it.
