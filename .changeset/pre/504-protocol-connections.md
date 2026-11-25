---
'@panneau/protocol': patch
---

The connections of the account (#504, decision 0113): `Connection` (a personal token or an OAuth client of the user, with `write`, `createdAt`, `lastUsedAt` and `expiresAt`), `ConnectionsResponse`, `ConnectionTokenRequest` and `ConnectionTokenResponse`, and their three operations in `openapi.json`, with `agents.mcp`: `GET /account/connections`, `POST /account/connections/tokens` (`201` with the token once; `409` when the account can't make one; `422`; `423`) and `DELETE /account/connections/{connection}` (`204`; `404`; `423`). The definition's `agents.mcp` takes `tokens`, whether the user can make a personal token: without it, clients assume they can't. The mock backend answers the three endpoints when its definition has `agents.mcp` (`MockUser.connections` gives the first ones), and the conformance kit checks the list (`account.connections`).
