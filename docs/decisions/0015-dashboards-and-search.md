# 0015: Dashboards and global search

- Status: accepted
- Date: 2026-10-14

## Context

The v4 home page is empty unless a project replaces it. There is no search across resources. Most Folklore projects run MySQL.

## Decision

**Dashboard:**

- The home page is a dashboard of widgets, declared in the definition per project and per role.
- Built-in widgets:
    - stat (number with a trend);
    - chart;
    - recent items of a resource;
    - shortcuts;
    - a welcome message.
- Projects add widgets through plugins.
- Each widget gets its data from `GET /dashboard/widgets/{widget}`.
- Personalization per user (choosing and arranging widgets) can come later, without changing the format.

**Global search:**

- A command palette (`⌘K`) searches every resource that enables search, through `GET /search?q=`, with results grouped by resource.
- `laravel-panneau` implements it with Laravel Scout when installed. The database engine works on MySQL with full-text indexes, and Meilisearch is supported. Without Scout, it falls back to a simple query on the resource's searchable columns.
- Backends that use other databases implement the same endpoint their own way.

## Consequences

- Both ship in 5.x minor releases.
- The list search (`q`) and the global search share the same resource configuration.
