---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/lists': patch
---

Fields can be left out of forms with `notInForm: true` (decision 0071): items still give their value, which lists, details and references read, such as the URL of a page shown under its title. `resolveFields()` and `resolveForm()` drop such a field even when the layout names it, `checkValues()` and inline editing skip it, the mock backend ignores its value on writes, and the conformance kit checks that a backend does too (`update.not-in-form`).
