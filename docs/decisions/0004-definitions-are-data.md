# 0004: Definitions are data

- Status: accepted
- Date: 2026-10-14

## Context

In v4, the definition is produced by PHP classes and embedded by a Blade view. Other ways of defining resources are not supported:

- **TypeScript:** a Node site would need it.
- **Database:** Niche defines fields per content genre and stores them there.

Pages, menus and auth options can't be set from PHP at all, so projects merge them into the definition in JS.

## Decision

- **A definition is JSON that validates against the protocol schema.** How it is produced doesn't matter: PHP builders in `laravel-panneau`, TypeScript builders in `@panneau/protocol`, or code that turns stored data into a definition.
- **The app loads it from `GET /definition`.** It is computed for the current user (abilities) and locale. A server can inline it in the page to save a request on first load.
- **Everything configurable is in the definition:** pages, menus, auth, dashboard, search and theme.
- **Behaviour that can't be expressed as data** (a custom field, a custom page) is a plugin. The definition refers to plugins by name.

## Consequences

- The frontend never needs to know which language or framework produced a definition.
- Forms and lists can be built at runtime from stored field definitions.
- The definition is tested against the schema, in both repositories.
