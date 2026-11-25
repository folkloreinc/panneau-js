# 0115: A sixth tool for agents, `upload_file`

- Status: accepted
- Date: 2026-11-25
- Amends: [0106](0106-five-tools-for-agents.md) (the tools: six instead of five)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (AI agents (MCP))
- Laravel side: [laravel-panneau decision 0032](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/decisions/0032-upload-file-tool.md), built in [laravel-panneau#304](https://github.com/folkloreinc/laravel-panneau/pull/304)
- Changes: the protocol (a sixth tool in its "Agents" section, `AGENT_TOOLS` and `agents.schema.json`)

## Context

An agent can't add a file with the five tools of [0106](0106-five-tools-for-agents.md). A `media` field takes the id of a media, and a media is created with a file: no tool carries one. An agent that made an image had no way to send it, and its user added the file by hand for the agent to link it afterwards. 0106 kept room for this: "uploads, aggregates and previews will want tools of their own later".

Two ways to carry the file were looked at first, and set aside:

- **The file in the arguments of a tool, in base64.** The model then writes the file, token by token: slow, costly, bounded by its context, and wrong as soon as one character is. An agent has the file on a disk, and a way to make an HTTP request: it should send the file, not spell it.
- **The direct uploads of the browser** ([0025](0025-presigned-uploads.md)). An upload is a temporary file that waits for a save, not where reusable files live: those are the media of a library ([0026](0026-media-libraries.md)). The agent would have a second task, creating the media from its upload, and the tools would only work on backends with direct uploads.

`laravel-panneau` built the tool first, as an extension (its decision 0032). This record makes it part of the protocol, as built.

## Decision

- **A sixth tool, `upload_file`.** Its arguments:
    - `name`, required: the name of the file, with its extension, 255 characters at most;
    - `resource`: the id of a media library, a resource of kind `media`. Not needed when the user can create in one library only;
    - `values`: the other fields of the media, by field, as in `save_item`. Never its `file`: that is an error.
- **The tool takes no file. It answers where to send it:** `{ "resource", "name", "method": "PUT", "url", "expiresIn" }`. `url` is a temporary signed URL of the backend, valid for `expiresIn` seconds.
- **The agent sends the file itself,** as the whole body of one `PUT` to `url` (`curl -T cover.png "$url"`). The request answers `201` with the new media, as `get_item` gives it, or a problem: `400` for an empty body, `403` for a signature that is invalid or expired, `413` for a body that is too large, `422` when the library refuses the file or the values.
- **The signature is the authentication.** The request takes no token: a model has no easy way to put the token of its connection in a command, and shouldn't hold it. The URL says nothing a client reads or builds: what it was made for (the user, the library, the name, the values) is the backend's to encode.
- **The file becomes a media as the user,** as a file added in the app: the policies of the library, its `accept` and `maxSize`, and its other rules apply.
- **The `id` of the media is then the value of a `media` field** in `save_item`.
- **It is a tool that writes.** It writes nothing itself, but its URL creates: `AGENT_TOOLS` marks it so, and a read connection doesn't list it.
- **The `PUT` is not in `openapi.json`.** That document describes the HTTP API at `api.baseUrl`, which the app calls; the MCP server isn't in it either. The URL is whatever the tool answers: a backend puts it where it wants, and no client builds it. `agents.schema.json` has the arguments and the result of the tool, and the "Agents" section of the protocol describes the request.
- **No remote URL.** A tool that fetched an address for the agent would make the backend request an address chosen by a model, itself steered by content it read.
- **The protocol stays at version 1.** A tool more is additive: an agent reads the tools from the server, and a backend without `upload_file` serves five.

## Known limits

- **The URL can be used again until it expires.** Each `PUT` within its life creates a media: the agent sends the file once. Whoever holds the URL can add files to that library as that user, of the types the library takes, until it expires, and can read nothing with it. Revoking the connection doesn't revoke the URLs it already got.
- **A plain file field outside a library isn't covered.** A `file` or `image` field of a resource, whose value is an upload of the browser, still can't be set by an agent. The files of agents go to a library, and the fields that take them are `media` fields.
- **An agent that can't make an HTTP request with a file as its body** can't use the tool. It couldn't have read a file into base64 either.
- **One request.** No multipart and no resuming: a large file is one long `PUT`, within the limits of the backend.

## Consequences

- A Panneau lists six tools, three for a read connection.
- An agent with a write connection adds media to the libraries its user can create in, and links them in `media` fields.
- `@panneau/protocol` gets `AgentUploadFileArguments` and `AgentUploadFileResult`, `upload_file` in `AGENT_TOOLS` and `agentToolSchemas`, and both schemas in `agents.schema.json`.
- A backend has one request that no token guards. Its safety is its signature and its short life, and the checks the backend makes again when the file arrives.
- The mock backend and the conformance kit don't serve or check the tools of agents: nothing changes there.
