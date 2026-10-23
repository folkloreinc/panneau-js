# 0032: Fields check their value with the backend, and a generic slug

- Status: accepted
- Date: 2026-10-23
- Issue: [#109](https://github.com/folkloreinc/panneau-js/issues/109)

## Context

Folklore sites copy a `PageSlug` field from Panneau 1.x into their own code. It shows the page's URL in front of the slug, which depends on the parent chosen in the form, and no slug for the home page. `laravel-folklore` 2 planned to ship it with its own JavaScript.

The `slug` type of Panneau 5 already follows another field (`from`), regenerates on demand, cleans up on blur, and shows a fixed `settings.prefix`. Three things were missing for it to replace `PageSlug`, none of them specific to pages:

- a slug per locale;
- a URL that depends on the item;
- knowing whether a slug is taken before saving.

## Decision

- **Per-locale source.** A localized `slug` follows `from` in its own locale (`slug.en` follows `title.en`). A slug that isn't localized, from a localized source, follows the default locale (the first of the definition's locales), not the first locale that has a value. Field entries get the `locale` of the value they edit.
- **Checking a value.** A field opts in with `"check": true`. The client sends `POST /resources/{resource}/fields/{field}/check` as the value is typed (debounced), and once when the form opens, with `{ value, locale, id, values }`:
    - `id` is the item being edited, or null when creating;
    - `values` are the form's current values, as they would be sent to save, so that the backend can compute what depends on them (a page's parent).

    The backend answers `{ available, suggestion, prefix, url, disabled }`:
    - `available`: no other item of the resource, in its scope and the same locale (and the same group when the backend scopes uniqueness further), has the value;
    - `suggestion`: an available value close to it when it is taken. The field offers it and doesn't replace what the user typed;
    - `prefix` and `url`: what the field shows in front of the value and as a link. The fixed `settings.prefix` stays for fields without `check`, and until the first answer;
    - `disabled`: the field doesn't apply to this item, such as the home page's slug. The field is read-only. This answers the issue's first open question without a condition language for `readOnly`.

- **Not authoritative.** Saving still validates the value (a server-only uniqueness rule). The check only says it earlier, and runs with the user's permissions: create, or update the item `id`.
- **The endpoint is generic** (the issue's second open question): any field type can opt in with `check`, such as a unique email later. The response's shape is the slug's for now. Only fields at the top of a resource check, since `{field}` names a field of the resource.
- **In `panneau-js`**:
    - `DataAdapter.checkField?()` (optional for custom adapters);
    - `createFieldCheckSource(adapter, resource, id)` and a `checkSource` in the fields context, passed by `FormView`, as the relation and upload sources are;
    - the `slug` field shows the answer.
- **The conformance kit** checks the endpoint (`fields.check`) when the tested resource has a field with `check`. The mock backend answers it.

## Consequences

- `laravel-folklore`'s Panneau plugin can be PHP only: its pages module gives the URL of a slug, and needs no field of its own.
- `laravel-panneau` implements the endpoint and `Slug::unique()` and `url()` ([folkloreinc/laravel-panneau#35](https://github.com/folkloreinc/laravel-panneau/issues/35)).
