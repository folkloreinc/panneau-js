# 0001: Panneau 5, aligned versions and real semver

- Status: accepted
- Date: 2026-10-14

## Context

`panneau-js` is at 4.1 and `laravel-panneau` at 1.4. Nothing says which versions work together. Lerna publishes the JS packages in fixed mode and bumps the patch version on every publish: there are 1,043 tags, 324 of them for v3.0 alone. No CHANGELOG is kept. Client projects require dev branches (`v1.3.x-dev`), so every push reaches production on the next `composer update`.

## Decision

- **Shared major version.** The next major of both repositories is **5**, called "Panneau 5": `folklore/laravel-panneau` 5.x and `@panneau/*` 5.x. A minor or patch release of one repository doesn't require a release of the other. Each major of one works with the same major of the other.
- **Branches.** Work happens on `v5.x` branches, following the workspace rules: one maintenance branch per major, and every change through a pull request.
- **Semver.**
    - A patch fixes a bug.
    - A minor adds features without breaking anything.
    - Breaking changes wait for the next major, after a deprecation.
- **JS releases use [changesets](https://github.com/changesets/changesets).** Each pull request declares its change, the CHANGELOG is generated, and CI publishes from `v5.x` only. Packages stay versioned together.
- **Tagged versions.** Projects require tagged versions (`^5.0`), never branches.

## Consequences

- `laravel-panneau` jumps from 1.x to 5.x. Composer and Packagist handle this without problem.
- `lerna.json` (or its replacement) on `v5.x` only allows publishing from `v5.x`.
- Pre-releases (`5.0.0-alpha.N`, `5.0.0-beta.N`) let Niche use the work before 5.0.0.
