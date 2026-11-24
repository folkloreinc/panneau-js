---
'@panneau/protocol': patch
---

The protocol describes the tools of agents (decisions 0090 and 0106): `AGENT_TOOLS` names the five tools (`describe`, `find_items`, `get_item`, `save_item`, `run_action`) and whether each one writes, and each has the schema of its arguments and of its result (`AgentDescribeArguments`, `AgentFindItemsResult`, `AgentSaveItemArguments`, `AgentConfirmationRequired`…). `AgentResourceDescription` is a resource as `describe` answers it to an agent: its fields, types, filters, sorts and actions, without what serves a UI. `@panneau/protocol/agents.schema.json` is their JSON Schema, which `createAgentsJsonSchema()` writes. A resource has an optional `description`, one sentence that says what it holds, and a definition an optional `agents` (`mcp.url`, `assistant`).
