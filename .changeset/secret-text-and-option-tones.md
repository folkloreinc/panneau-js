---
'@panneau/protocol': minor
'@panneau/fields': minor
'@panneau/lists': minor
'@panneau/intl': minor
---

Secret text fields, and options with a tone.

- `text` fields with `"settings": { "secret": true }` hold a secret, such as an access key: the field types it in a password input, with a button that shows it, and keeps the browser from filling it in (`autocomplete="new-password"`). Lists and item details show it as dots. `TextField` takes `secret`.
- The options of `select` fields take a `tone` (`{ "value": "failed", "label": "Failed", "tone": "danger" }`): a built-in tone or one of the theme. The `select` display of lists and item details shows each option as a badge in its tone.
