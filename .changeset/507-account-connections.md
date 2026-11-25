---
'@panneau/data': patch
'@panneau/intl': patch
'@panneau/app': patch
---

The connections of the account (#507, decision 0113). The data adapter has `listConnections()`, `createConnectionToken()` and `revokeConnection()` (`GET /account/connections`, `POST /account/connections/tokens`, `DELETE /account/connections/{connection}`), and `queryKeys.connections()`. With `agents.mcp` in the definition, the account page has a "Connections" section: the address of the MCP server to copy, the personal tokens and the apps that let agents in as the user (read, or read and change; made, last used, expires), revoking one after a confirmation that names it, and, when `agents.mcp.tokens` is true, a dialog that makes a personal token, shown once with a button that copies it and forgotten when the dialog closes. Creating and revoking ask for the password when the backend needs a recent one (`423`), as passkeys do.
