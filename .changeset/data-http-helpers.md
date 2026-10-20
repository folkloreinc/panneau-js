---
'@panneau/data': minor
---

The pieces of the adapters are exported for an app's own endpoints: `readProblem()` reads the problem of a failed response (`application/problem+json`, Laravel's `{ message, errors }`, or the status), and `@panneau/data/laravel` adds `getLaravelHeaders()` (`X-Requested-With` and the CSRF token from Laravel's cookie) and `createLaravelError()` (`419` as `UnauthorizedError`). The Laravel adapter uses them.
