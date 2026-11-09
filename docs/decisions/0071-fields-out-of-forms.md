# 0071: Fields that items give, but that forms leave out

- Status: proposed
- Date: 2026-11-09
- Extends: the `Field` of the protocol, next to `readOnly`, `createOnly` and `updateOnly`

## Context

Some values only exist to be shown with items. The URL of a page is computed from its slug and its parents: a backend gives it with each page, and the definition names it as the page's `itemSubtitle`, so that relation cards ([0067](0067-relation-cards.md)), search results and pickers show it under the title. Nobody types it.

To give that value, the backend declares a field. But `resolveFields()` appends to the form every field that its layout doesn't place, so the URL showed at the bottom of the page's form, as a read-only text. A backend could only hide it with a `visibleWhen` that is never true (`{ "field": "url", "in": [] }`), which also makes clients evaluate a condition for nothing, and reads as a mistake.

The other properties don't fit. `readOnly` keeps the field in the form. `abilities.view: false` hides the field everywhere, and items leave out its value ([0046](0046-abilities-in-the-ui.md)). Leaving the field out of the definition breaks the `itemSubtitle`, columns and details that name it.

## Decision

- **`notInForm: true` on a field** leaves it out of forms. `resolveFields()` and `resolveForm()` drop it in every mode, drop the layout nodes that name it, and never append it. Without it, or with `false`, a field is in forms, as before.
- **Everything else still reads it.** Items carry its value, and lists, details, item panels, search results and relation references show it, as they show any field.
- **It is never written.** A form doesn't send its value, since the field isn't one of its fields. The backend ignores its value on create and update, as it ignores `readOnly` fields, and doesn't validate it: a client that sends it still saves. `checkValues()` skips it, and lists don't edit it in place.
- It applies to the fields at the top of a resource and of its types, as `abilities` and `check` do. A condition (`visibleWhen`) of another field reads the values of the form, which don't have it.
- The name says where the field isn't, like `createOnly` and `updateOnly` say when it is: a field that is somewhere else than forms needs no other flag.

## Consequences

- `@panneau/protocol`: `Field` has `notInForm`, in the definition schema. `checkValues()` skips it. The mock backend ignores its value on writes. The conformance kit checks, with `writes`, that an update ignores the values of such fields (`update.not-in-form`), and leaves them out of the values it writes.
- `@panneau/core`: `resolveFields()` leaves the field out.
- `@panneau/lists`: inline editing skips the field.
- `laravel-panneau` gives fields a `notInForm()` builder, and never validates or saves their values from a request. A site replaces its never-true `visibleWhen` with it.
