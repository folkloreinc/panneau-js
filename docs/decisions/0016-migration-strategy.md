# 0016: Clean break, maintained old lines, Niche as pilot

- Status: accepted
- Date: 2026-10-14

## Context

The current Panneau lines are used by 18 active projects:

- `laravel-panneau` v1.3 and v1.4;
- `panneau-js` v2, v3 and v4.

Some are heavily customized. `micromag-js` uses `@panneau/*` as a component library for about 15 Micromag sites. Niche is starting its frontend and plans to use Panneau.

A compatibility layer between v1/v4 and 5 would keep the old implicit contract alive and slow down the redesign.

## Decision

- **Panneau 5 is a clean break.** No compatibility layer. The migration is supported by:
    - a guide;
    - JS codemods (imports, plugin registration);
    - Rector rules for the PHP (fields, static properties);
    - `panneau:install --upgrade`.
- **Old lines stay maintained for fixes and security** until their projects have migrated:
    - `laravel-panneau` v1.3 and v1.4;
    - `panneau-js` v3.0 and v4.0.
- **Niche is the pilot.** It uses the 5.0 alphas and betas, and its needs shape the API.
- **Order after 5.0.0:**
    1. projects on v1.4 + v4;
    2. projects on v1.3 + v4;
    3. projects on React 18, when they are redesigned.
- **`micromag-js` stays on v4.** It will be replaced by Niche.
- **`generator-folklore`** (in `folklore-js`) calls `php artisan panneau:install` instead of copying its own files.

## Consequences

- `panneau-js` v4.0 is maintained for as long as Micromag runs.
- Each migration is a pull request in the project, with the checklist in [migration.md](../migration.md).
