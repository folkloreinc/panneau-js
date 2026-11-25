---
'@panneau/app': patch
---

After the login, the app goes to a same-origin `next` (#508). In `panneau` auth mode, when the app is opened with `?next=` holding a path of its origin (such as the authorization page of the backend's OAuth server), a guest who logs in, with a password, a second factor, a passkey or a provider (whose callback brings the user back to the app with its `next`), goes there with a full page load, and a user who is already logged in goes there right away. A `next` that isn't a same-origin path is ignored. A target that sends a logged-in user straight back with the same `next` isn't followed again.
