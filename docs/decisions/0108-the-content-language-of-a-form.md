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

- **A field's language is the field's own, unless the form opts in.** By default, each localized field keeps its own switch and shows its first locale, as before: a form doesn't change what its fields show, and a resource whose editors write one language at a time, or several side by side, isn't moved by a choice made elsewhere. A switch for the whole form is a choice of the form.
- **The form opts in with `form.languageSwitch: true`** in the definition, next to `form.layout`: a setting of how the resource's form works, where a definition author looks for it. Forms built without a definition take `languageSwitch` (`FormView`, `Form`). The app passes the resource's setting.
- **With it, the form owns the language of its content.** `FormView` has one language switch, "Language of the content", above its fields: in its header area, which a form has with or without a sidebar. It shows only when the form has localized fields (in groups, repeaters and blocks too) and more than one locale. Its code loads with `import()`, with the first form that shows it.
- **`ContentLocaleContext` lives in `@panneau/fields`.** Fields don't depend on forms (0021): the form provides the context (`{ locale, setLocale, changes }`), and a localized field reads it when it is there. Without it (fields outside a form, a form without the setting), a field behaves as before. `useFieldLocale()` gives the same behaviour to the localized fields of plugins.
- **A field can still switch on its own**, and keeps its locale until the form's switch changes again, even to the locale it had (`changes` counts the changes). Without the switch, nothing moves a field switched on its own but the user, and an error in it.
- **The browser remembers the choice for every form with the switch** (`panneau:content-locale`), as it does the density: an editor who translates stays in the language they translate to from one item to the next. A form without the setting neither reads nor writes it. A locale that the form doesn't have falls back to the first one.
- **The switch reads the form's state.** Each locale says whether its values have errors, or miss required values (a required localized field that shows is empty in it), as a field's switch does.
- **Reaching an error** (the first one after a failed save, one picked in the summary) shows its locale: with the switch, the switch moves, and every localized field with it; without it, only the field in error, as before.
- **"Copy from …"**, with or without the switch, next to a field's switch for an empty locale: the value of the filled locale, or a menu of the filled locales when there are several. A copy is an edit: the form gets unsaved changes. A read-only or disabled field has none. Its code loads with the first empty locale.

## Consequences

- `@panneau/protocol`: `form.languageSwitch` on resources, in the definition schema. The example of the protocol turns it on for its `pages`, which the playground shows. Clients that don't know it ignore it, and backends that don't send it keep the forms of before.
- `@panneau/fields`: `ContentLocaleContext`, `useContentLocale()` and `useFieldLocale()`. `LocalizedField` follows the context when its `locale` isn't controlled, and copies locales.
- `@panneau/forms`: `languageSwitch` on `FormView` and `Form`; with it, the form provides the context and renders the switch.
- `@panneau/app`: the form of a resource passes `form.languageSwitch`. laravel-panneau can give its forms a builder for it.
- `@panneau/intl`: the labels of the switch and of the copy, in English and French.
- Lists and item details keep showing localized values as before: they have no switch.
