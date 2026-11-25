---
'@panneau/data': patch
---

Replacing a file without direct uploads works on PHP 8.3 and Symfony below 7.4 (#167). `createRestAdapter()` takes `multipartMethodOverride`, the name of a form field: a `multipart/form-data` request whose method is not `POST` is then sent as `POST`, with its method in that field, and keeps its headers (`If-Match` included). Off by default. `createLaravelAdapter()` turns it on with `_method`, which Laravel's method spoofing routes to the `PATCH` route; pass `false` to send the method as is. JSON bodies keep their method.
