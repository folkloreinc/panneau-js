---
'@panneau/fields': patch
'@panneau/forms': patch
'@panneau/intl': patch
---

One language switch for a form, and "Copy from …" for localized fields. A form with localized fields and more than one locale has a "Language of the content" switch above its fields, which sets the language of every localized field at once; each language says whether it has errors or misses required values, and the browser remembers the choice for every form. A field can still switch on its own, until the form's switch changes again. Reaching an error, after a failed save or from the error summary, moves the form's switch. An empty language of a localized field can be copied from a filled one, which makes the form dirty like any edit. `@panneau/fields` exports `ContentLocaleContext`, `useContentLocale()` and `useFieldLocale()`; fields outside a form keep showing their first locale (decision 0108).
