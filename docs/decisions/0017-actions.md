# 0017: Actions

- Status: accepted
- Date: 2026-10-14

## Context

**Actions in v4.** In v4, actions are UI components: show, edit, duplicate, delete, restore, import and upload. Lists add bulk actions. Each bulk action has its own `endpoint` and posts `{ ids }` with a raw `postJSON`, which bypasses the API client (base URL, unauthorized handling). "Select all" only covers the current page. There is no result format, so the UI can't say what happened to each item. There is also no support for long-running work.

**Actions in Laravel v1.** `laravel-panneau` v1 has no concept of action. Projects add hand-named routes (`resources.{id}.{action}`) and controllers for exports, imports, notifications or contest draws. The most customized project has 22 such controllers.

## Decision

An **action** is an operation a user applies to one item, to a selection of items, or to a resource as a whole. One concept covers Panneau's built-in actions and the actions of projects.

- **Three kinds:**
    - `server`: the backend runs it;
    - `link`: it navigates, like show and edit;
    - `client`: a plugin handles it in the browser, for example by opening a custom modal.
- **Declared per resource in the definition.** A declaration has:
    - id, label, icon;
    - scope: `item`, `selection`, `resource`;
    - placement: `row`, `toolbar`, `form`, `menu`;
    - `destructive` and `confirm`;
    - optional `fields` with a `layout`, for parameters.
- **Parameters** are rendered in a modal by the same form engine as resources. They get the same client validation and the same field errors.
- **Selection** is either a list of ids or the current list query (filters and search), with exclusions. "Select all" therefore covers every matching item, not only the current page.
- **Running an action:**
    - one endpoint per action: `POST /resources/{resource}/actions/{action}`, called through the `DataAdapter`;
    - the request carries the selection and the parameter values;
    - the response is an action result: a message, counts, the items that failed or were skipped with a reason, what to refresh, and an optional redirect or download.
- **Long-running actions** answer `202` with a run. The UI follows its progress and notifies the user when it ends, even after they leave the page.
- **Permissions:**
    - The definition says whether the user can run the action on the resource.
    - Each item lists the actions allowed on it in its `abilities`. The UI hides an action on an item that doesn't allow it. For a selection, it says how many items will be skipped before running it.
    - For a selection of every item matching a query, only the backend knows: an action that declares `dryRun` answers a dry run (`"dryRun": true`), which lists ask before they confirm (#44).
    - The backend checks every item again. In a selection, an item that is not allowed is skipped and reported; it doesn't fail the whole action.
- **Built-in actions:**
    - links: `show`, `edit`;
    - server: `duplicate`, `delete`, `restore`;
    - resource scope: `export` (CSV, XLSX) and `import` (file and column mapping).

    A project can disable or replace any of them.

## Consequences

- The `endpoint` property of v4 actions and the raw requests go away. Every server action goes through the adapter, with the same error handling.
- Custom routes and controllers in projects become action classes (see `laravel-panneau/docs/architecture.md`). They are the main test cases of the migration.
- `laravel-panneau` needs a table of action runs and queued jobs for long-running actions.
- A notification area in the app shows finished runs, their results and their downloads.
