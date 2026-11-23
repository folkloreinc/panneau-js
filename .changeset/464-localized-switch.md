---
'@panneau/protocol': patch
'@panneau/fields': patch
'@panneau/forms': patch
'@panneau/app': patch
'@panneau/intl': patch
---

"Copy from …" for localized fields, and an optional language switch for a form. An empty language of a localized field can be copied from a filled one, which makes the form dirty like any edit. A form can ask for one language switch above its fields: `form.languageSwitch: true` on a resource in the definition, or `languageSwitch` on `FormView` and `Form`. It sets the language of every localized field at once, says which languages have errors or miss required values, is remembered by the browser for every form with the switch, and moves to the language of an error reached from the summary or after a failed save; a field can still switch on its own until the form's switch changes again. Without the setting, the default, each localized field keeps its own switch only, as before. `@panneau/fields` exports `ContentLocaleContext`, `useContentLocale()` and `useFieldLocale()` (decision 0108).
