# 0008: Conflict detection in 5.0, collaboration in 5.x

- Status: accepted
- Date: 2026-10-14

## Context

Today, two people editing the same item overwrite each other without warning. Realtime editing (Yjs style) is wanted. Full collaboration needs a Yjs server, such as Hocuspocus in Node, for each project. That means infrastructure, and it is more than many client projects need.

## Decision

- **5.0: conflict detection.**
    - Every item has a `version`.
    - Updates send `If-Match`.
    - A `412` response opens a dialog that shows what changed, with the choice to reload or overwrite.
- **Form state lives behind a store interface.** The local store (5.0) can be replaced by a shared Yjs store without changing fields or forms.
- **5.x:**
    - **Presence:** who is viewing or editing an item, over a lightweight channel (Laravel Reverb or polling).
    - **`@panneau/collab`:** optional realtime collaboration through Yjs and Hocuspocus. It covers rich text fields first, then whole forms.
    - **`laravel-panneau` support:** short-lived signed tokens for the Yjs server, and an endpoint to persist documents.

## Consequences

- Most projects get safe concurrent editing without new infrastructure.
- Projects that need realtime collaboration add `@panneau/collab` and a Yjs server.
- Fields must not keep values in their own state, so that a shared store can drive them later.
