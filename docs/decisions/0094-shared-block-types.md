# 0094: Shared block types

- Status: accepted
- Date: 2026-11-19
- Extends: [0077](0077-resource-types.md) (the types of a resource)
- Part of: 5.x (the protocol)

## Context

A `repeater` with `types` carries the full definition of each of its block types. A site with blocks repeats them in every place a repeater is declared:

- in each type of a resource ([0077](0077-resource-types.md)): the blocks of a home page, an edition page, a contact page…;
- in each resource with blocks: pages and articles;
- inside the blocks that hold blocks, such as a stack or an accordion, which carry the list of block types again.

On a site with 11 types of pages and 27 block types, the definition held 325 copies of block types. It weighed 2.06 MB (143 KB gzipped) in every page of the admin, against 63 KB once each list of block types appeared once. Each copy was built and serialized by the backend, and parsed and kept by the client.

## Decision

- **Shared lists of block types.** The definition takes `blockTypeSets`, lists of block types by key. A `repeater` names one with `typeSet` in place of `types`.
- **The backend decides what to share.** It can keep `types` inline, or share the lists that repeat; the meaning is the same. A shared list can hold blocks with repeaters that name other sets, never one that names a set it is part of, directly or not: blocks don't nest without end.
- **Clients resolve the sets when they read the definition.** `validateDefinition()` and `validateBootConfig()` give each repeater with a `typeSet` the `types` of its set, the same array for every repeater that names it. Components keep reading `types`, so nothing else changes for them. `resolveBlockTypeSets()` does the same for a definition validated otherwise.
- **What is invalid.** A set that doesn't exist, a field with both `types` and `typeSet`, and a set that holds itself are issues of the definition.

## Consequences

- The definition of a site with blocks is a fraction of its size, built and parsed faster. In memory the sets are shared as well.
- A client that predates this decision shows a repeater with a `typeSet` without blocks to add. Upgrade the client with the backend, as the versions table of `laravel-panneau` says.
- `laravel-panneau` shares the lists of block types that appear more than once.
