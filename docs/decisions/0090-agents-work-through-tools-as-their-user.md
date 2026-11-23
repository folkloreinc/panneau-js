# 0090: AI agents work in a Panneau through tools of the protocol, as their user

- Status: proposed, amended by [0106](0106-five-tools-for-agents.md): five tools instead of nine, one description of a resource, and the order of delivery
- Date: 2026-11-18
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (AI agents (MCP))
- Laravel side: [laravel-panneau decision 0022](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/decisions/0022-agents-on-laravel-mcp-and-laravel-ai.md)
- Changes: the protocol (an `agents` part of the definition, the tools, the endpoints of the assistant and of connections), and the account page ([0050](0050-account-page.md))

## Context

People who manage content want to hand an AI assistant part of the work: find the items that mention something, fix a typo everywhere, fill or translate fields, publish a selection, say how many items match. They use two kinds of assistants:

- **outside AI clients** (chat apps, code editors, agents of their own), which connect to services through the [Model Context Protocol](https://modelcontextprotocol.io) (MCP);
- **an assistant inside Panneau**, next to the page they are on, which knows what "this item" and "these items" are.

Both need the same thing: operations on resources, run as the user, with their abilities. Panneau already has them. The definition describes, for the current user, the resources, their fields, rules, filters, actions and abilities ([0004](0004-definitions-are-data.md)), and the HTTP API runs every operation through the backend's policies, the resource's scope, validation, `If-Match`, dry runs and undo.

The HTTP API isn't made for agents, though:

- it signs in with the session of the app (a cookie, CSRF), which an outside client doesn't have;
- its shape serves a UI: query strings, many endpoints, and confirmations that the app shows before it calls them, not the API;
- an agent works faster and on more items than a person, makes mistakes with confidence, and reads content written by others, which can carry instructions meant for it (prompt injection).

The roadmap left the tools, their names and their limits to a decision.

## Decision

### One set of tools, in the protocol

- **Nine tools, the same for every Panneau.** Each one names its resource in its arguments, rather than one tool per resource and operation:

    | Tool                | What it does                                                                                                                                      | Like                                      |
    | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
    | `list_resources`    | the resources the user can list, with their labels, abilities and actions, and the context of the connection                                      | `GET /definition`                         |
    | `describe_resource` | a resource of the definition (fields, types, filters, sorts, actions and their fields) and `valuesSchema`, the JSON Schema of the values it takes | `GET /definition`                         |
    | `search`            | the global search, with `q`, `resources` and `limit`                                                                                              | `GET /search`                             |
    | `list_items`        | a page of a list: `filter`, `q`, `sort`, `page` or `cursor`, `perPage` (50 at most) and `fields`                                                  | `GET /resources/{resource}`               |
    | `get_item`          | an item, with its `version` and its abilities                                                                                                     | `GET /resources/{resource}/{id}`          |
    | `create_item`       | creates an item from `values` (and its `type`, for a resource with types)                                                                         | `POST /resources/{resource}`              |
    | `update_item`       | changes some `values` of an item, at the `version` the agent read                                                                                 | `PATCH /resources/{resource}/{id}`        |
    | `run_action`        | runs an action on items, a query selection or the resource, with `values`, `dryRun` and `confirmation`; also the built-in `delete` and `restore`  | `POST /resources/{resource}/actions/{id}` |
    | `get_action_run`    | the status and the result of a queued run                                                                                                         | `GET /actions/runs/{run}`                 |

    One tool per resource would type each resource's values in its tool's schema, but a backend with 30 resources would list over 150 tools: they cost the context of every conversation, some clients cap them, and the agent can't tell resources apart any better. The agent reads a resource with `describe_resource` when it needs it.

- **An optional part of version 1 of the protocol** ("Additive within a version"). `docs/protocol.md` gets an "Agents" section. `@panneau/protocol` gets the JSON Schemas of the arguments and the results of each tool, and of the parts of the assistant's stream, so another backend serves the same tools under the same names. The names, their arguments and their results change like the rest of the protocol.
- **The shapes of the protocol.** Tools answer in the shapes the HTTP API already uses: items as `GET /resources/{resource}/{id}` serializes them, plus `version` (their `ETag`) and `abilities`; lists with their pagination; action results ([Actions](../protocol.md#actions-1)); and errors as problems ([0006](0006-validation-and-errors.md)), returned as tool errors. A `422` keyed by paths lets the agent fix its values; a resource or an item the user can't see is not found, whatever the reason. Each result is structured content, with the same JSON as text for clients that only read text.
- **`valuesSchema`** is the JSON Schema of the values that `create_item` and `update_item` take, built from the fields the user can edit: the type of each field's value, an object keyed by locale for a localized field, the options of a choice as an `enum`, and the rules that JSON Schema can say (`required`, `min`, `max`, `pattern`). The backend still checks every rule when it saves.
- **Labels in the user's language.** Labels and messages are in the user's interface language, as in the definition. Values of localized fields are in every locale, as in the API.

### As the user, and nothing more

- **Every call runs as the user who connected**, with the definition built for them: the backend's policies, the resource's scope, the abilities of fields (values with `view: false` left out, read-only fields refused) and the context. An agent can't do anything its user can't do in the app.
- **A connection reads, or reads and writes.** On a read connection, `create_item`, `update_item` and `run_action` aren't listed, and the backend refuses them.
- **Outside clients connect over MCP** (Streamable HTTP), at the URL that `agents.mcp.url` of the definition gives. They sign in as the MCP specification says, with OAuth 2.1: the user signs in to Panneau as usual, then allows the client, read only or read and write. For clients without OAuth, the user makes a personal token on the account page, shown once.
- **The context is in the URL of the connection,** as it is a prefix of the routes of the app ([0045](0045-current-context.md)): `{mcp url}/{name}/{value}/…`, and a `fixed` param comes from the request as usual. A connection reaches the context it was made for. A `context` argument on every tool was set aside: it would repeat in every call, and let one connection reach every context of its user.
- **The account page lists the connections** ([0050](0050-account-page.md)), with `agents.mcp` in the definition: each client and token, read or read and write, when it was last used, and a button that revokes it. `GET /account/connections`, `POST /account/connections/tokens` (`{ "name", "write" }`, which answers the token once) and `DELETE /account/connections/{id}`.

### Writes are careful

- **`update_item` takes the `version` the agent read.** It is required, unlike `If-Match` in the HTTP API: an agent works from a read that may be old, while a person edits the same item. A conflict is the `412` problem, with the current item, and the agent reads it again.
- **One item at a time** for `create_item` and `update_item`. Changes to many items go through actions, which have dry runs, confirmations, limits and undo.
- **What the app confirms, the tools confirm too.** A first call of `run_action` doesn't run the action, and answers `{ "status": "confirmation_required", "message", "preview", "confirmation" }`, when:
    - the action has a `confirm`, or is `destructive` and not `undoable` (the built-in `delete` of a resource without a trash);
    - its selection is a query rather than ids;
    - or its selection has more than `UNDO_LIMIT` (100) items.

    `message` is the action's confirmation message, `preview` the result of its dry run when the action has one (how many items would change, and which would be skipped), or else the count of its selection. The agent shows it to its user. The second call sends `confirmation`, and runs exactly what was previewed: the same user, resource, action, selection and values, within 5 minutes. The token is signed by the backend, which keeps no state for it.

- **Undoable actions run at once,** as in the app ([0063](0063-undo-instead-of-a-confirmation.md)), and their result has its `undo`: the agent undoes them with `run_action`.
- **Annotations of MCP:** the five reading tools are `readOnlyHint`; `update_item` and `run_action` are `destructiveHint` (one tool runs every action, and the confirmation stops the dangerous ones); none is `openWorldHint`. Clients that ask their user before a destructive tool do so.
- **Limits:** 50 items per page of `list_items`, the backend's synchronous limit for selections (above it, the run is queued, or refused), and a number of calls per user and minute (a `429` problem with `retryAfter`).

### Content is data, not instructions

The values of items are written by other people, or imported from outside. An agent that reads them can be told by them to do something else. Panneau limits what that can do, rather than trying to detect it:

- the agent has only its user's abilities, and a read connection can't write;
- what can't be undone, and what applies to many items, waits for a confirmation;
- no tool reaches outside the Panneau: none fetches a URL or sends a message;
- in the assistant inside Panneau, the confirmation is a click of the user, not a call of the model (below).

An outside client can have other tools (the web, email) next to Panneau's: that is out of Panneau's reach. The documentation tells users to connect such clients read only.

### What an agent did is known

- **Writes through a tool are marked as made by an agent**: the backend knows the user and the connection (the client's name, or the token's), and records them where it records changes: the history of an item will say "Ada, through Claude" when revisions come. A backend can log every call.

### The assistant inside Panneau

- **`agents.assistant: true`** in the definition: the shell has an "Ask the assistant" button, also in the "Go to…" palette ([0029](0029-go-to-palette.md)), which opens a panel beside every page: the aside of [0074](0074-asides-next-to-lists-and-forms.md), which the browser remembers open or closed.
- **The same tools, as the user of the session.** The backend runs the model, with its own provider and keys; the app never talks to a model.
- **It knows the page.** Each message carries where the user is: the route, the resource, the item and its version, the query of the list and the selection. "Translate this page" and "publish these three" mean what the user sees.
- **The conversation streams.** `POST /assistant/conversations/{conversation}/messages` (`new` for a new conversation) answers Server-Sent Events in the UI message stream protocol of the AI SDK, an open format that the app reads with a small reader of its own: text as it comes, each tool call with its tool and resource, and Panneau's own parts. `GET /assistant/conversations` lists the user's recent conversations, `GET` and `DELETE /assistant/conversations/{conversation}` show and delete one. Only their user sees them, and the backend keeps them for a set time.
- **Confirmations are cards.** When a tool needs a confirmation, the stream sends a `data-panneau-confirmation` part to the app, not the token to the model. The panel shows a card with the message and the preview, and "Run" and "Cancel". The click sends `{ "confirm": "…" }` (or `{ "cancel": "…" }`) as the next message: the backend runs the action, adds its result to the conversation, and the model goes on.
- **The page follows the changes.** After a write, the app refetches the items or the list as an action result's `refresh` says, and an undoable result has its toast with "Undo". A form open on an item that the assistant changed gets the version conflict when it saves, as with a change by another person ([0008](0008-realtime-and-concurrency.md)).
- **In `@panneau/app`,** loaded when the definition has `agents.assistant`, so that other backends don't load it.

### Not in this version

- uploads (a `media` field takes the reference of a media that `list_items` found in a media library), `duplicate`, aggregates, dashboards and previews;
- the resources and prompts of MCP, and its elicitation for confirmations, which clients don't all support;
- an agent working without a user, on a schedule.

## Consequences

- An outside client and the assistant inside Panneau do the same things, the same way, with the same rights: what a tool can do is what the API does for the user.
- An agent can't change what a person is editing without a conflict, nor delete or change many items without a confirmation its user sees.
- `@panneau/protocol` gets the schemas of the tools, of the `agents` part of the definition and of the stream; the conformance kit can call the tools of a backend later. `@panneau/app` gets the panel of the assistant, its confirmation cards and the connections of the account page.
- `laravel-panneau` serves the tools with `laravel/mcp` and the assistant with `laravel/ai`, from the same operations as its controllers ([its decision 0022](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/decisions/0022-agents-on-laravel-mcp-and-laravel-ai.md)).
- The quality of an agent's work depends on the labels and help of the fields: a resource that describes its fields well is easier for people and for agents.
