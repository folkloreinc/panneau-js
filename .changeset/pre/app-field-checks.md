---
'@panneau/app': patch
---

The forms of the app check their fields with `check`, such as slugs, with the backend (`POST /resources/{resource}/fields/{field}/check`): a slug now shows its URL prefix, the link to its page, and whether it is taken. The create and edit pages didn't give their form a check source, so only forms rendered outside the app checked their fields.
