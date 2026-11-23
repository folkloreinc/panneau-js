# 0106: Five tools for agents

- Status: proposed
- Date: 2026-11-23
- Amends: [0090](0090-agents-work-through-tools-as-their-user.md) (the tools, what describes a resource, and the order of delivery)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (AI agents (MCP))
- Laravel side: [laravel-panneau decision 0022](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/decisions/0022-agents-on-laravel-mcp-and-laravel-ai.md), amended by [its decision 0025](https://github.com/folkloreinc/laravel-panneau/blob/v5.x/docs/decisions/0025-five-tools-read-first.md)
- Changes: the protocol (the tools of its "Agents" section, and an optional `description` of a resource)

## Context

[0090](0090-agents-work-through-tools-as-their-user.md) gives agents nine tools. Nothing of it is built yet, and a review before the work starts found what to change first:

- **Nine tools leave little room.** Every tool costs the context of every conversation, and clients cap them. Uploads, aggregates and previews will want tools of their own later. Six of the nine are three pairs that differ by one argument: the resources and one resource, the search and a list, creating and updating.
- **`describe_resource` answers the fields twice:** the resource of the definition, made for a UI (layouts, columns, icons, placements), and `valuesSchema`, the same fields again as a JSON Schema.
- **An agent can't find the built-in actions.** `delete`, `restore` and `duplicate` exist on every resource without being declared ([Actions](../protocol.md#actions)), so the definition doesn't list them.
- **`get_action_run` has nothing to read.** `laravel-panneau` has no queued actions yet: a selection above its synchronous limit is refused.
- **Nothing says what a resource is for,** besides its label.
- **Groups and repeaters save whole,** and 0090 doesn't say so: an agent that sends one block of a field would drop the others.

## Decision

### Five tools

| Tool         | What it does                                                                                                                                                   | Replaces                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `describe`   | without `resource`, the resources the user can list; with `resource`, the description of that resource                                                         | `list_resources`, `describe_resource` |
| `find_items` | without `resource`, the global search; with `resource`, a page of its list                                                                                     | `search`, `list_items`                |
| `get_item`   | an item, with its `version` and its abilities; `fields` asks for some of its fields only                                                                       |                                       |
| `save_item`  | without `id`, creates an item from `values` (and its `type`, for a resource with types); with `id`, changes some `values` of the item, at the `version` it had | `create_item`, `update_item`          |
| `run_action` | as in 0090, and also the built-in `duplicate` of an item, which answers the copy                                                                               |                                       |

- **`describe` without `resource`** answers, for each resource: its id, its labels, its `description`, the abilities `viewAny` and `create`, and the context of the connection. Not its actions: they are in its description.
- **`find_items` without `resource`** takes `q` and `limit` only, and answers results grouped by resource, as `GET /search`. **With `resource`,** it takes `filter`, `q`, `sort`, `page` or `cursor`, `perPage` (50 at most) and `fields`, and answers the fields of the list's columns unless `fields` names others.
- **An argument of the other mode is an error,** not ignored: a `filter` without `resource`, a `version` without `id`. The problem says which argument, and why.
- **`save_item` with an `id` requires `version`,** as `update_item` did. It is still one item at a time.
- **`save_item` replaces the whole value of each field it sends.** Fields it doesn't send keep their value. A group or a repeater is never partial: changing one block sends every block of the field. The description of the tool says so. Changing a value by its path (`blocks.3.title`) can come later.
- **Annotations:** `describe`, `find_items` and `get_item` are `readOnlyHint`; `save_item` and `run_action` are `destructiveHint`. An update replaces values, so the tool that also creates is marked as destructive: clients that ask their user before a destructive tool also ask before a creation. That is the cost of one tool for both.
- **A read connection** lists `describe`, `find_items` and `get_item`.
- **`get_action_run` is out of this version.** It comes back with queued actions. Until then, a selection above the backend's synchronous limit is refused.

### One description of a resource

- **`describe` with a `resource` answers one compact shape, made for an agent.** It replaces both the resource of the definition and `valuesSchema`:
    - **fields:** name, type, label, help, localized, required, options, the resource of a relation, read-only;
    - **list:** filters and sorts;
    - **types,** for a resource with types;
    - **actions:** their fields, their scope, whether they destroy and whether they ask for a confirmation.
- **No layout, columns, icons or placements:** they serve a UI.
- **`parts`** (`fields`, `list`, `actions`) asks for some of it only.
- **It lists the built-in actions the user can run:** `delete`, `restore` and `duplicate`, next to the declared ones.
- **The backend still checks every rule when it saves.** The description says what a field takes, not all of its rules: a `422` keyed by paths tells the agent what to fix.

### A resource says what it is for

- **`description`, optional, on a resource of the definition:** one sentence that says what the resource holds and when to use it, in the user's language. It is for agents and for people: `describe` answers it, and the app can show it.

### The order of delivery

1. Reading, with a personal token: `describe`, `find_items` and `get_item`.
2. Writing: `save_item` and `run_action`, with their confirmations.
3. OAuth, and the connections of the account page.
4. The context in the URL of the connection.

The assistant inside Panneau comes after the MCP server.

### What doesn't change

The rest of 0090, read with the new names: every call as its user, connections that read or write, the confirmations of `run_action`, limits, what an agent did, content as data, and the assistant.

## Consequences

- A Panneau lists five tools, three for a read connection, and later tools have room.
- An agent reads a resource once, in a shape that names what it can run, built-in actions included. A resource with many fields costs less context, and less again with `parts` and `fields`.
- `valuesSchema` is gone before it existed: `@panneau/protocol` gets the schema of the description instead, with those of the five tools, and `description` on a resource.
- A long action can't run through a tool until queued actions exist.
- An agent that changes one block of a long field sends the whole field, at the cost of its size.
- `duplicate` leaves the "Not in this version" list of 0090; the rest of the list stays.
