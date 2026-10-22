# @panneau/app

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/data@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [3c68628]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/data@5.0.0-alpha.3
  - @panneau/core@5.0.0-alpha.3

## 5.0.0-alpha.2

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2
  - @panneau/core@5.0.0-alpha.2
  - @panneau/data@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 345e06c: Add `@panneau/app` with the app entry: `createPanneauApp({ element, plugins, adapter, config })` reads the boot config of the page, creates the Laravel adapter by default, uses the inlined definition or fetches it, and renders a placeholder shell that follows the client routes under `basePath` in history mode. When the API answers `401` (or `419` from Laravel), it sends the browser to the login URL, or calls `onUnauthorized`. Also exports `<Panneau>` and `readBootConfig()`.

### Patch Changes

- Updated dependencies [b1d02aa]
- Updated dependencies [de03e3d]
- Updated dependencies [3e4f251]
- Updated dependencies [dfb0b1f]
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/core@5.0.0-alpha.1
  - @panneau/data@5.0.0-alpha.1
  - @panneau/protocol@5.0.0-alpha.1
