---
'@panneau/protocol': patch
---

The protocol describes a sixth tool of agents, `upload_file` (decision 0115, built by folkloreinc/laravel-panneau#304): `AgentUploadFileArguments` (`name`, and optionally `resource`, a media library, and `values`, never the `file`) and `AgentUploadFileResult` (`{ resource, name, method: "PUT", url, expiresIn }`), in `AGENT_TOOLS` (it writes), `agentToolSchemas` and `agents.schema.json`. The tool takes no file: the agent sends it as the body of one `PUT` to the signed `url`, which answers the new media. `AgentToolName` has one more name: code that maps every tool handles it.
