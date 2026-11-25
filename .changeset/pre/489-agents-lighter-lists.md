---
'@panneau/protocol': patch
---

Agents read lighter lists, and an example of compound values (#489): the items of `find_items` leave out `abilities` (`AgentListItem`, which `AgentFindItemsResult` now holds), and `get_item` still gives them. The HTTP list and search keep `abilities` required. A field described to an agent (`AgentField`) has an optional `example`, the value `save_item` takes, for the fields whose value isn't a plain scalar (a `money`, a `daterange`, an `address`, a `link`).
