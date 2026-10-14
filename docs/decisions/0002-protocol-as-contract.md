# 0002: A written protocol is the contract

- Status: accepted
- Date: 2026-10-14

## Context

The definition format and the HTTP API between `panneau-js` and `laravel-panneau` are implicit:

- The JS expects keys and routes that the PHP doesn't provide.
- The JS also relies on Laravel details (the `419` status, `_method`, a custom pagination format).
- Projects fill the gaps with generated code.
- A product with its own API (Niche) can't use the forms and lists without adopting the PHP definition format.

## Decision

- **The contract is a written protocol, versioned and published in `@panneau/protocol`:**
    - a JSON Schema of the definition;
    - an OpenAPI document of the HTTP API;
    - TypeScript types generated from both;
    - a conformance kit.
- **The frontend only relies on the protocol.** Laravel specifics (CSRF, session cookies) live in a preset of the REST adapter.
- **`laravel-panneau` is the reference implementation.** It validates its responses against the OpenAPI document in its tests.
- **The protocol has its own version** (`protocol: 1` in the definition). Version 1 only changes additively.

## Consequences

- The protocol is written first, in Phase 0, before the components that use it.
- A Node backend, or any other, can serve a Panneau frontend by implementing the protocol and passing the conformance kit.
- Changing the API means changing the protocol first, in a reviewed pull request.
