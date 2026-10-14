# Migration

Panneau 5 is a clean break: the definition format, the API and the package names change. Projects move to it one at a time, with a guide and tools. The older lines stay maintained until their projects have moved. See [decisions/0016](decisions/0016-migration-strategy.md).

## Maintained lines

| Line                   | Maintained for                                   | Until                                                  |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `panneau-js` v3.0      | Projects on React 18                             | They migrate (usually during a redesign)               |
| `panneau-js` v4.0      | Projects on v4, `micromag-js` and Micromag sites | They migrate; Micromag is eventually replaced by Niche |
| `laravel-panneau` v1.3 | Most Laravel projects                            | They migrate                                           |
| `laravel-panneau` v1.4 | Projects on Laravel 11+                          | They migrate                                           |

These lines only get fixes and security patches. New features go to 5.x.

## Order

1. **Niche**, during the alphas and betas: the pilot project. It starts directly on 5.x.
2. **Projects on `laravel-panneau` v1.4 and `panneau-js` v4**, after 5.0.0. They are the closest to 5.
3. **Projects on v1.3 and v4.**
4. **Projects on v1.3 with v3 or older (React 18).** These need React 19 as well. They migrate when a redesign or a major update happens, not on their own.
5. **Heavily customized projects** last. Their custom fields and controllers are the best test of the migration tools, so they serve as test cases from the betas onward.

`micromag-js` stays on v4. Micromag will eventually be replaced by Niche.

## Before migrating

These steps can be done on the current lines and make the move smaller:

- Require tagged versions (`^1.3`, `^4.1`) instead of dev branches.
- Move hand-written routes for custom actions into one place, so they map to resource actions.
- Stop importing from `@panneau/core/contexts` and other internals where a public export exists.

## Mapping: Laravel

| v1                                                                                                       | 5                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `config('panneau.resources')` and static props on `Resource` (`$repository`, `$jsonResource`, `$types`…) | Resources registered in a service provider; instance methods (`model()`, `fields()`, `layout()`, `list()`, `actions()`) |
| `Repository` contract and `ResourceItem`                                                                 | Eloquent models directly; a custom `ResourceRepository` when needed                                                     |
| `JsonResource` per resource                                                                              | `toItem()` on the resource, or keep a `JsonResource`                                                                    |
| `TextLocalized`, `MediaLocalized`…                                                                       | `Text::make('title')->localized()`                                                                                      |
| `Upload`, `Image`, `ImageUpload`…                                                                        | `Media::make('image')->accept('image/*')`                                                                               |
| `Item`, `Items`, `ResourceItem(s)`                                                                       | `Relation`, `Repeater`, `Group`                                                                                         |
| Custom `ResourceController` subclasses                                                                   | Resource hooks (`query()`, `creating()`, `saved()`) and resource actions                                                |
| `routes/panneau.php` with custom routes                                                                  | Resource actions; custom pages through plugins and `pages`                                                              |
| Generated `HomeController`, `AccountController`, `UploadController`, `PanneauPolicy`, views              | Provided by the package, installed by `panneau:install`                                                                 |
| `Panneau::resource()` gate on `Panneau::class`                                                           | Policies per model, plus the `viewPanneau` gate                                                                         |

Rector rules will cover the mechanical parts: field class renames, `localized()`, and static properties to methods.

## Mapping: JS

| v4                                                                 | 5                                                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| About 117 `@panneau/*` packages                                    | About a dozen packages with subpath exports                                                     |
| `components` prop with namespaces (`fields`, `pages`, `previews`…) | Plugins (`definePlugin`)                                                                        |
| `@panneau/core/contexts` hooks                                     | Public hooks from `@panneau/core`                                                               |
| `MainLayout`, `ResourceItemsList` from `@panneau/app`              | Public building blocks of `@panneau/app`                                                        |
| `ApiProvider` / `DataProvider` with `Api` classes                  | `DataAdapter` and the REST adapter                                                              |
| CKEditor `html` field                                              | `richtext` field (TipTap); HTML stays the storage format                                        |
| Bootstrap classes in custom components                             | Design tokens and `@panneau/ui` primitives; the Bootstrap-compatible theme eases the transition |

Codemods will rewrite imports and the plugin registration.

## Per project

Each migration is a pull request in the project, following this checklist:

1. Upgrade `laravel-panneau` and `@panneau/*` to 5.x together.
2. Run `php artisan panneau:install --upgrade`, Rector, then the JS codemods.
3. Move resources, fields and custom routes, following the mapping above.
4. Delete the files that the package now provides.
5. Check every resource page in the browser: list, create, edit, delete, plus custom actions.
6. Update the project in the inventory of `folkloreinc/folklore-dev`.
