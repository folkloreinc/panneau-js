# @panneau/data

## 5.0.0-alpha.3

### Minor Changes

- 3c68628: The pieces of the adapters are exported for an app's own endpoints: `readProblem()` reads the problem of a failed response (`application/problem+json`, Laravel's `{ message, errors }`, or the status), and `@panneau/data/laravel` adds `getLaravelHeaders()` (`X-Requested-With` and the CSRF token from Laravel's cookie) and `createLaravelError()` (`419` as `UnauthorizedError`). The Laravel adapter uses them.

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
  - @panneau/protocol@5.0.0-alpha.3

## 5.0.0-alpha.2

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 3e4f251: Add `@panneau/data`: the `DataAdapter` interface, `createRestAdapter()` with typed errors (`ValidationError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`), `If-Match` from item versions and protocol list queries, the Laravel preset (`@panneau/data/laravel`), and TanStack Query hooks with cache invalidation (`@panneau/data/query`).

### Patch Changes

- de03e3d: Add an example test of a full flow with `@panneau/core`: load the definition, list, edit with validation errors, save and get a version conflict.
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/protocol@5.0.0-alpha.1
