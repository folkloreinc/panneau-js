# Decisions

Architecture decision records for Panneau 5. Each record is short: context, decision, consequences. A decision is changed by a new record that supersedes it, not by editing the old one.

Laravel-specific decisions live in [`laravel-panneau/docs/decisions`](https://github.com/folkloreinc/laravel-panneau/tree/v5.x/docs/decisions).

| #                                                                 | Decision                                                                      | Status                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| [0001](0001-versioning-and-releases.md)                           | Panneau 5: aligned versions, `v5.x` branches, real semver                     | Accepted                          |
| [0002](0002-protocol-as-contract.md)                              | A written protocol is the contract between frontend and backend               | Accepted                          |
| [0003](0003-layers-and-packages.md)                               | Independent layers and about a dozen packages                                 | Accepted                          |
| [0004](0004-definitions-are-data.md)                              | Definitions are data                                                          | Accepted                          |
| [0005](0005-styling-and-theming.md)                               | Design tokens and accessible primitives, no global CSS                        | Accepted                          |
| [0006](0006-validation-and-errors.md)                             | Portable validation rules and problem+json errors                             | Accepted                          |
| [0007](0007-rich-text.md)                                         | TipTap replaces CKEditor                                                      | Amended by 0035                   |
| [0008](0008-realtime-and-concurrency.md)                          | Conflict detection in 5.0, collaboration in 5.x                               | Accepted                          |
| [0009](0009-preview-drafts-revisions.md)                          | Component and iframe previews, drafts and revisions per resource              | Accepted                          |
| [0010](0010-media.md)                                             | Media through the protocol, non-destructive image editing                     | Amended by 0026, 0031             |
| [0011](0011-permissions.md)                                       | Backend policies, abilities in the UI, optional roles module                  | Extended by 0046                  |
| [0012](0012-authentication.md)                                    | Complete, optional auth that works next to a site's own auth                  | Amended by 0037                   |
| [0013](0013-public-api-and-stability.md)                          | Public API and stability rules                                                | Accepted                          |
| [0014](0014-testing.md)                                           | Testing strategy                                                              | Accepted                          |
| [0015](0015-dashboards-and-search.md)                             | Dashboards and global search                                                  | Amended by 0064                   |
| [0016](0016-migration-strategy.md)                                | Clean break, maintained old lines, Niche as pilot                             | Accepted                          |
| [0017](0017-actions.md)                                           | Actions on items, selections and resources                                    | Amended by 0040                   |
| [0018](0018-new-packages-next-to-v4.md)                           | New packages next to the v4 code, which moves to `legacy/`                    | Accepted                          |
| [0019](0019-app-entry.md)                                         | The app entry: boot config, mount function and client routes                  | Amended by 0036, 0037, 0038, 0045 |
| [0020](0020-default-theme-and-icons.md)                           | A sober default theme, and Lucide as the only icon set                        | Amended by 0036                   |
| [0021](0021-forms-render-core-state.md)                           | Forms render the form state of the engine                                     | Accepted                          |
| [0022](0022-lists-render-core-state.md)                           | Lists render the list state of the engine                                     | Accepted                          |
| [0023](0023-action-runner.md)                                     | An action runner in its own package                                           | Accepted                          |
| [0024](0024-theme-model.md)                                       | A theme model as extensible as Bootstrap's                                    | Accepted, amended by 0072         |
| [0025](0025-presigned-uploads.md)                                 | Direct uploads to storage, separate from media                                | Amended by 0026                   |
| [0026](0026-media-libraries.md)                                   | Media libraries are resources                                                 | Amended by 0027                   |
| [0027](0027-media-picker.md)                                      | A media picker on a source that products can implement                        | Accepted                          |
| [0028](0028-item-panel.md)                                        | The show route opens an item's details in a panel next to its list            | Amended by 0040, 0041             |
| [0029](0029-go-to-palette.md)                                     | A "Go to…" command palette that products can use without the app              | Accepted                          |
| [0030](0030-search-parameters-and-scope.md)                       | The parameters of the global search, its errors, a scope per resource         | Accepted                          |
| [0031](0031-image-editor-and-image-field.md)                      | An image editor with tools, and an `image` field                              | Accepted                          |
| [0032](0032-field-checks-and-slugs.md)                            | Fields check their value with the backend, and a generic slug                 | Accepted                          |
| [0033](0033-more-field-types.md)                                  | More field types: tel, range, duration, json, tags, embed and location        | Amended by 0047, 0056             |
| [0034](0034-skeletons-while-content-loads.md)                     | Skeletons while content loads                                                 | Accepted                          |
| [0035](0035-rich-text-kept-html.md)                               | Rich text keeps HTML it doesn't edit, inert in the admin                      | Accepted                          |
| [0036](0036-default-icon-loader.md)                               | Lucide's icon loader is the default of `createPanneauApp()` only              | Accepted                          |
| [0037](0037-login-page-token-and-logout.md)                       | The login page of the app, a login with a token, and the logout               | Accepted                          |
| [0038](0038-pages-with-params.md)                                 | Pages with params                                                             | Accepted                          |
| [0039](0039-cursor-pagination.md)                                 | Lists paged with cursors                                                      | Accepted                          |
| [0040](0040-row-links-and-open-mode.md)                           | Built-in item actions by abilities, and what opens an item                    | Amended by 0060                   |
| [0041](0041-groups-in-item-details.md)                            | The panel of an item shows the values of its groups                           | Accepted                          |
| [0042](0042-list-view-columns-and-remembered-view.md)             | The view of a list: chosen columns, and the view the browser remembers        | Accepted                          |
| [0043](0043-inline-editing.md)                                    | Inline editing in lists, one field at a time                                  | Accepted                          |
| [0044](0044-gallery-and-calendar.md)                              | Gallery and calendar layouts, and the query of a calendar                     | Accepted                          |
| [0045](0045-current-context.md)                                   | A current context, picked in the app and sent with every request              | Proposed                          |
| [0046](0046-abilities-in-the-ui.md)                               | Abilities of pages and fields, and a forbidden state                          | Accepted                          |
| [0047](0047-countries-regions-and-phone-numbers.md)               | Countries, regions and phone numbers                                          | Amended by 0057                   |
| [0048](0048-password-reset-and-email-verification.md)             | Password reset and email verification                                         | Proposed                          |
| [0049](0049-two-factor-authentication.md)                         | Two-factor authentication, required for some users, and password confirmation | Proposed                          |
| [0050](0050-account-page.md)                                      | The account page                                                              | Proposed                          |
| [0051](0051-passkeys.md)                                          | Passkeys                                                                      | Proposed                          |
| [0052](0052-oauth-providers.md)                                   | OAuth providers on the login page                                             | Proposed                          |
| [0053](0053-date-ranges-and-money.md)                             | Date ranges and money                                                         | Proposed                          |
| [0054](0054-addresses.md)                                         | Postal addresses                                                              | Proposed                          |
| [0055](0055-links.md)                                             | Links                                                                         | Proposed                          |
| [0056](0056-duration-units.md)                                    | Durations in a declared unit, with days                                       | Proposed                          |
| [0057](0057-phone-extensions.md)                                  | Phone extensions                                                              | Proposed                          |
| [0058](0058-multiple-countries-embed-providers-color-palettes.md) | Several countries, the providers of an embed, and color palettes              | Proposed                          |
| [0059](0059-flags-of-regions.md)                                  | Flags of regions                                                              | Proposed                          |
| [0060](0060-row-actions-colored-icons.md)                         | Row actions are colored icons, and a menu last                                | Proposed                          |
| [0061](0061-item-images-in-lists.md)                              | The image of items in the table, and in media libraries                       | Proposed                          |
| [0062](0062-toasts.md)                                            | Toasts at the bottom, one per thing, and only when the page doesn't say it    | Proposed, amended by 0066         |
| [0063](0063-undo-instead-of-a-confirmation.md)                    | "Undo" instead of a confirmation                                              | Proposed                          |
| [0064](0064-dashboard-widgets.md)                                 | The widgets of the dashboard                                                  | Proposed                          |
| [0065](0065-compound-fields.md)                                   | Compound fields: plugin types made of sub-fields                              | Proposed                          |
| [0066](0066-a-create-goes-back-to-the-list.md)                    | A create goes back to the list, which shows the new item                      | Proposed                          |
| [0067](0067-relation-cards.md)                                    | Relation fields show their items as cards                                     | Proposed                          |
| [0068](0068-collapsed-items-and-lighter-controls.md)              | Collapsed repeater items, permalink slugs, and controls shown when needed     | Proposed, amended by 0070         |
| [0069](0069-show-the-items-an-action-changed.md)                  | "Show" the items an action changed, with a filter of lists on ids             | Proposed                          |
| [0070](0070-select-mode-in-lists.md)                              | Lists show their checkboxes once "Select" is pressed                          | Proposed                          |
| [0071](0071-fields-out-of-forms.md)                               | Fields that items give, but that forms leave out                              | Proposed                          |
| [0072](0072-touch-targets-follow-the-density.md)                  | Touch targets follow the density                                              | Proposed                          |
