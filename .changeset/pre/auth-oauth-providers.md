---
'@panneau/protocol': patch
'@panneau/app': patch
'@panneau/intl': patch
---

OAuth providers on the login page (decision 0052).

- `@panneau/protocol`: `AUTH_ERROR_PARAM` and `AUTH_ERROR_CODES`, the `next` of `GET /auth/providers/{provider}/redirect`, the providers of the mock backend (`providerUsers`: a provider logs in at once), and the `auth.providers` conformance check, which doesn't follow the redirection.
- `@panneau/app`: the link of a provider adds `next`, the page to come back to; the login page says why a login with a provider failed (`authError`), and the address loses it.
- `@panneau/intl`: their messages, in English and French.
