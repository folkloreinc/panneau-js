# 0009: Component and iframe previews, drafts and revisions per resource

- Status: accepted
- Date: 2026-10-14

## Context

v4 has a two-pane form with a React preview component per resource. Other cases need more:

- **A real page:** some sites want to see the page itself, rendered by the site with its own styles.
- **Unpublished changes:** some resources need drafts or a history to preview against.

## Decision

Both preview modes are supported, chosen per resource:

- **Component preview.** A plugin component receives the form values and renders them. It is fast and needs nothing from the backend.
- **Iframe preview.** The form posts its unsaved values to `POST /resources/{resource}/{id}/preview`. The backend returns a short-lived signed URL of the real page, rendered with these values. The iframe reloads as values change, debounced, and can also receive values through `postMessage` for live updates.

Drafts and revisions are optional features per resource (`features.drafts`, `features.revisions`):

- **Drafts:** a resource can have a published version and a draft, with publish and unpublish actions.
- **Revisions:** a history of saved versions, with a comparison and a restore.

## Consequences

- These ship in 5.x minor releases, after 5.0.
- `laravel-panneau` provides the building blocks: signed preview URLs, a trait for drafts, a revisions table. Each project decides which resources use them.
