---
'@panneau/protocol': minor
'@panneau/app': minor
'@panneau/intl': minor
---

Add a language switcher to the shell (decision 0082). The definition can list the languages of the interface in `interfaceLocales`, each with its label and the URL that switches to it. With two or more, the sidebar has a language button beside the appearance's, the dock's user menu a "Language" section, and "Go to…" a command for each other language. Choosing one goes to its URL with `next`, the page to come back to. The protocol documents `GET /locale/{locale}` as an optional endpoint for that URL.
