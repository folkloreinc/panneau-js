# Panneau 5

Panneau is Folklore's toolkit for building admin panels and content management interfaces. It has two halves:

- **`panneau-js`** (this repository): the React packages, published as `@panneau/*`.
- **[`laravel-panneau`](https://github.com/folkloreinc/laravel-panneau)**: the Laravel package `folklore/laravel-panneau`, the reference backend.

Panneau 5 is the next major version of both. They ship together under the same version number. These documents describe where Panneau is going and why. They are the reference for the work tracked in [#6](https://github.com/folkloreinc/panneau-js/issues/6) (the Laravel side is tracked in [folkloreinc/laravel-panneau#35](https://github.com/folkloreinc/laravel-panneau/issues/35)).

## Goals

Panneau 5 must be:

- **Stable.** A written contract between frontend and backend, a public API that only breaks in a major version, and tests at every level.
- **Easy to use.** Install it on an existing Laravel site with one command. Add a resource without writing a controller.
- **Powerful.** Flexible form layouts, client-side validation, rich lists, media editing, permissions, dashboards, search, preview and realtime collaboration.
- **Modern.** React 19, TypeScript `strict`, accessible components, and theming through design tokens.

It must also serve two kinds of projects:

- **Client projects** that need a complete admin panel, often with a custom CMS.
- **Products such as Niche** (URBANIA's upcoming content platform) that use Panneau's pieces (fields, forms, lists) inside their own interface, against their own API.

## Rules

- Easy to add to an existing site, whether Laravel or full Node.
- Easy to include only some components in an existing project.
- The base pieces (fields, forms, lists) work without the full app, for projects that want a custom integration.
- Easy to extend with fields, themes, locales and pages.
- A simple and robust integration with Laravel.
- The frontend assumes no particular backend. The contract is a written protocol.
- A migration path for current projects.
- A stable API, so Panneau can evolve without breaking projects.

## Documents

| Document                             | Content                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------- |
| [current-state.md](current-state.md) | Audit of `panneau-js` v4 and of how projects use Panneau today              |
| [architecture.md](architecture.md)   | Layers, packages, extension points, and how projects use them               |
| [protocol.md](protocol.md)           | The definition format and the HTTP API between frontend and backend (draft) |
| [roadmap.md](roadmap.md)             | Phases, what ships in 5.0 and what comes in 5.x, open questions             |
| [migration.md](migration.md)         | Migration strategy and order for current projects                           |
| [decisions/](decisions/)             | Architecture decision records                                               |

The Laravel side of the architecture is documented in [`laravel-panneau/docs`](https://github.com/folkloreinc/laravel-panneau/tree/v5.x/docs).
