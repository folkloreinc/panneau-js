# 0113: The connections of the account

- Status: accepted
- Date: 2026-11-24
- Amends: [0090](0090-agents-work-through-tools-as-their-user.md) (the connections of the account page)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (AI agents (MCP)), [#504](https://github.com/folkloreinc/panneau-js/issues/504)
- Laravel side: [laravel-panneau decision 0029](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/decisions/0029-account-connections.md)
- Changes: the protocol (`Connection`, three endpoints of the account, `agents.mcp.tokens`)

## Context

[0090](0090-agents-work-through-tools-as-their-user.md) has the account page list the connections of the user to the MCP server, and names three endpoints: `GET /account/connections`, `POST /account/connections/tokens` and `DELETE /account/connections/{id}`. It doesn't give the shape of a connection, nor what a backend answers when it can't make a token. `laravel-panneau` built them (its decision 0029) and found three things that 0090 left open:

- **An OAuth client holds many tokens.** A client that refreshes its token every hour would fill the page with lines that are all the same agent.
- **Some backends can't make a personal token** for a user: with Laravel Passport, a project without a personal access client. The page shouldn't offer a button that is always refused.
- **Some backends don't record when a token was used.** Passport doesn't.

## Decision

- **A connection** is what lets an agent in as the user: a personal token (`type: "token"`), or an OAuth client the user authorized (`type: "client"`). **A client is one connection, which stands for all its tokens:** revoking it revokes every token of the user for that client, not the client itself.

    ```json
    {
        "id": "token:12",
        "type": "token",
        "name": "Claude",
        "write": true,
        "createdAt": "2026-11-24T10:00:00+00:00",
        "lastUsedAt": null,
        "expiresAt": null
    }
    ```

    - `id` is opaque: the app sends it back to revoke the connection and never parses it.
    - `write` says whether its agents can use the tools that write; a read connection can't ([0090](0090-agents-work-through-tools-as-their-user.md)).
    - Dates are ISO 8601 strings, as those of passkeys. **`lastUsedAt` is null when the connection wasn't used yet, or when the backend doesn't record use**: the app says "never used" only when it knows. `expiresAt` is null for never.

- **The endpoints**, beside the other endpoints of the account, exist only when the definition has `agents.mcp`:
    - `GET /account/connections` → `200` `{ "data": [Connection] }`, the newest first;
    - `POST /account/connections/tokens` with `{ "name", "write"? }` → `201` `{ "token", "connection" }`. The plain text of the token is answered once. **A `409` problem when the account can't make a personal token**, as the account answers a user who can't have passkeys; a `422` for a missing `name` or a `write` that isn't a boolean;
    - `DELETE /account/connections/{connection}` → `204`, and the connection stops working at once; a `404` for an id that isn't a connection of the user.
    - Creating and revoking can need a recent password: the `423` problem, as for passkeys and two-factor authentication. Listing doesn't.
- **`agents.mcp.tokens`**, a boolean of the definition, says whether the user can make a personal token. The app offers one only when it is `true`. It is optional, for backends written before it: **absent means the app must not assume it can**, the same as `false`. A backend that can make tokens says so.

## Consequences

- `@panneau/protocol` has `Connection`, `ConnectionsResponse`, `ConnectionTokenRequest` and `ConnectionTokenResponse`, the three operations in `openapi.json`, `agents.mcp.tokens` in the definition, the endpoints in the mock backend (with `agents.mcp`; `409` unless `tokens` is `true`), and a conformance check that lists the connections.
- The change is additive: `PROTOCOL_VERSION` stays the same.
- `laravel-panneau` checks the operations against `openapi.json` and deletes its `tests/protocol/pending.openapi.json` once it pins a release of `@panneau/protocol` that has them.
- The account page of `@panneau/app` can build on them: it is not part of this decision.
