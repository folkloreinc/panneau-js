# Decisions

Architecture decision records for Panneau 5. Each record is short: context, decision, consequences. A decision is changed by a new record that supersedes it, not by editing the old one.

Laravel-specific decisions live in [`laravel-panneau/docs/decisions`](https://github.com/folkloreinc/laravel-panneau/tree/v5.x/docs/decisions).

| #                                        | Decision                                                         | Status   |
| ---------------------------------------- | ---------------------------------------------------------------- | -------- |
| [0001](0001-versioning-and-releases.md)  | Panneau 5: aligned versions, `v5.x` branches, real semver        | Accepted |
| [0002](0002-protocol-as-contract.md)     | A written protocol is the contract between frontend and backend  | Accepted |
| [0003](0003-layers-and-packages.md)      | Independent layers and about a dozen packages                    | Accepted |
| [0004](0004-definitions-are-data.md)     | Definitions are data                                             | Accepted |
| [0005](0005-styling-and-theming.md)      | Design tokens and accessible primitives, no global CSS           | Accepted |
| [0006](0006-validation-and-errors.md)    | Portable validation rules and problem+json errors                | Accepted |
| [0007](0007-rich-text.md)                | TipTap replaces CKEditor                                         | Accepted |
| [0008](0008-realtime-and-concurrency.md) | Conflict detection in 5.0, collaboration in 5.x                  | Accepted |
| [0009](0009-preview-drafts-revisions.md) | Component and iframe previews, drafts and revisions per resource | Accepted |
| [0010](0010-media.md)                    | Media through the protocol, non-destructive image editing        | Accepted |
| [0011](0011-permissions.md)              | Backend policies, abilities in the UI, optional roles module     | Accepted |
| [0012](0012-authentication.md)           | Complete, optional auth that works next to a site's own auth     | Accepted |
| [0013](0013-public-api-and-stability.md) | Public API and stability rules                                   | Accepted |
| [0014](0014-testing.md)                  | Testing strategy                                                 | Accepted |
| [0015](0015-dashboards-and-search.md)    | Dashboards and global search                                     | Accepted |
| [0016](0016-migration-strategy.md)       | Clean break, maintained old lines, Niche as pilot                | Accepted |
