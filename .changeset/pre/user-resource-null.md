---
'@panneau/protocol': patch
'@panneau/app': patch
---

`user.resource` can be `null`: the user has no item they can edit in a resource of users, such as a user outside the resource's scope who reaches the admin by another rule. The app then shows no link to the user's profile in the sidebar and the dock, where it opened a page that wasn't found (folkloreinc/laravel-panneau#202). Without `user.resource`, the app still looks for a resource `users`.
