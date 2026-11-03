---
'@panneau/data': patch
'@panneau/intl': patch
'@panneau/app': patch
---

The shell has error pages for forbidden content, server errors and an unreachable server (#181).

- `@panneau/data`: a request that gets no answer (offline, or the server can't be reached) rejects with a `NetworkError`, whose `cause` is the error of `fetch`. An aborted request still rejects with its `AbortError`.
- `@panneau/app`: `ErrorPage` (exported, with `getErrorPageKind()` and the `ErrorPageKind` type) shows, in the look of the not found page, what went wrong and what to do: `not-found`, `forbidden`, `server-error`, `offline` (offline, or the server unreachable: it tries again once the browser is back online) and `error`. The shell uses it:
    - a resource the user can't list shows "Access denied" instead of "Page not found";
    - an item or a list that fails to load shows the page of its error (`403`, `404`, `5xx`, no answer) with a retry, in place of an alert;
    - a page that throws while it renders shows an error page with the sidebar still there, and renders again with "Try again" or on another path;
    - at boot, a definition that fails to load shows the error page on a panel in the frame of the shell: "Access denied" when the user isn't allowed in.

    New classes: `panneau-error-page-*`, and `panneau-panneau-frame` and `panneau-panneau-panel` for the frame at boot.
- `@panneau/intl`: the messages of these pages, in English and in French.
