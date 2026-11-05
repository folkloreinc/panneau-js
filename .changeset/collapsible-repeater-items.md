---
'@panneau/fields': minor
---

Lighter forms (decision 0068):

- **Repeater items collapse under their title.** Each item's header is a button (`aria-expanded`) with its number, its title and, while collapsed, its first text. Items the list had when it showed start collapsed, an added item starts expanded, and the state of each item follows it as items move. "Expand all" and "Collapse all" open or close every item. An item that gets an error expands by itself, and its header says it has errors. `RepeaterField` takes `collapsible` (`false` keeps every item expanded, as the `collapsible: false` setting of the `repeater` type does) and `invalidPaths`, which the `repeater` entry and compound fields pass from the form.
- **A slug is a permalink.** The start of its URL is an addon in front of the input, without its scheme, cut at its start when it is long, and it stays while the slug is typed. The URL of the page is an icon link that opens it in a new window, in place of the URL under the input. A slug that doesn't apply (the home page) says that its address can't be changed.
