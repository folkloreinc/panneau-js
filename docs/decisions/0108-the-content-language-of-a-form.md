# 0108: The content language of a form

- Status: accepted
- Date: 2026-11-23
- Issue: [#464](https://github.com/folkloreinc/panneau-js/issues/464)
- Builds on: [0021](0021-forms-render-core-state.md) (fields don't depend on forms), [0071](0071-fields-out-of-forms.md) (fields used outside a form)
- Not to be confused with: [0083](0083-a-language-switcher-in-the-shell.md), the language of the interface
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the fields of editors)

## Context

A localized field shows one locale at a time, with its own switch, and the first locale shows first. Writing a whole item in the second language means switching every field, one by one, in every form. Nothing copies a value from one language to another, though a translation often starts from the other language's text: a name, a URL, a list of blocks.

The language of the content (`locales` of the definition) is not the language of the interface (`interfaceLocales`, 0083): an editor in a French interface writes the English version of a page. The interface's language reloads the app; the content's language is a view of the values already there.

## Decision

- **A form owns the language of its content.** `FormView` has one language switch, "Language of the content", above its fields: in its header area, which a form has with or without a sidebar. It shows only when the form has localized fields (in groups, repeaters and blocks too) and more than one locale.
- **`ContentLocaleContext` lives in `@panneau/fields`.** Fields don't depend on forms (0021): the form provides the context (`{ locale, setLocale, changes }`), and a localized field reads it when it is there. Without it, outside a form or in a form with a single locale, a field behaves as before: its first locale shows. `useFieldLocale()` gives the same behaviour to the localized fields of plugins.
- **A field can still switch on its own**, and keeps its locale until the form's switch changes again, even to the locale it had (`changes` counts the changes).
- **The browser remembers the choice for every form** (`panneau:content-locale`), as it does the density: an editor who translates stays in the language they translate to from one item to the next. A locale that the form doesn't have falls back to the first one.
- **The switch reads the form's state.** Each locale says whether its values have errors, or miss required values (a required localized field that shows is empty in it), as a field's switch does.
- **Reaching an error moves the form's switch**: the first error after a failed save, and an error picked in the summary. Every localized field then shows that locale, and the field switched on its own too.
- **"Copy from …"** next to a field's switch, for an empty locale: the value of the filled locale, or a menu of the filled locales when there are several. A copy is an edit: the form gets unsaved changes. A read-only or disabled field has none.

## Consequences

- `@panneau/fields`: `ContentLocaleContext`, `useContentLocale()` and `useFieldLocale()`. `LocalizedField` follows the context when its `locale` isn't controlled, and copies locales.
- `@panneau/forms`: `FormView` provides the context and renders the switch.
- `@panneau/intl`: the labels of the switch and of the copy, in English and French.
- Lists and item details keep showing localized values as before: they have no switch.
