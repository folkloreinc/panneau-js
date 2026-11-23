# 0109: Duplicate an item, add one in between, and blocks titled from the definition

- Status: accepted
- Date: 2026-11-23
- Extends: [0068](0068-collapsed-items-and-lighter-controls.md) (the items of a `repeater`)
- Issue: [#463](https://github.com/folkloreinc/panneau-js/issues/463)

## Context

The blocks of a page are a `repeater` with typed blocks ([0068](0068-collapsed-items-and-lighter-controls.md) collapses them). People who build pages with them found it slow:

- an item can't be duplicated: a block like the one before it is filled again by hand;
- a new item always goes at the end, and is then moved up one place at a time;
- the menu of block types is a list of words, although a block type has an `icon` in the protocol, and nothing says what a type is for;
- a collapsed item is titled by its type, with an excerpt of its first text field. The definition can't say which field names an item: a person's name, a heading.

## Decision

**"Duplicate" is one of the tools of an item**, after its arrows and before "Remove". It adds a copy right after the item (deep, so that the copy shares nothing with it), with a key of its own, expanded, and the focus on its header. It is disabled at `max`. Four small icon buttons fit in the header, so the tools don't move into a menu.

**An item is added between two others** from a control in the gap above each item but the first: a round "+" on a line, named "Add an item between items 1 and 2". It shows on hover and while it has the focus, and always on touch screens (`@media (hover: none)`), as the controls of [0068](0068-collapsed-items-and-lighter-controls.md); hidden, it keeps its place in the order of tabs. For typed blocks it opens the same menu of types as "Add". The new item is expanded, and gets the focus on its header. There is no control at `max`, or in a list that can't be edited. "Add", under the list, still adds at the end.

**The menu of block types shows each type's icon and description.** `BlockType` gets `description`, under its label. The `icon` is a Lucide name, loaded with the `iconLoader` of `PanneauRoot` ([0036](0036-default-icon-loader.md)). When a type of the menu has an icon, a type without one keeps an empty place, so that the labels line up.

**The definition names what titles an item.** `settings.itemTitle` of a `repeater` (`RepeaterSettings`, checked by `validateDefinition()`), or `itemTitle` of a block type, which takes its place for blocks of that type, is a field name (`title`) or a template of field names in braces (`{first_name} {last_name} ({role})`):

- a localized value gives the locale of the interface, its language, or the first locale that has a text; a rich text gives its text without tags; a `select` gives the label of its option; a number its digits. Other values (lists, objects) give nothing;
- brackets left empty by a missing value are dropped;
- an item without any of the values gives no title: it keeps the label of its type, or "Item 2", and its excerpt.

The setting is additive: a client that doesn't know it shows the title it showed before.

**The repeater loads with its first use.** The built-in `repeater` entry, and the fallback of a compound field without its plugin, are a `lazyFieldEntry` like the other heavy types: the first page of an app (a list) doesn't load it, and a form shows the skeleton of the field until it has loaded. `summarizeCompound()` and `restParts()` live apart from `defineCompoundField()`, so that lists summarize compound values without loading the repeater. This keeps the initial JavaScript of a minimal app within its budget, with room for the controls above.

## Consequences

- `@panneau/protocol`: `RepeaterSettings` (`collapsible`, `itemTitle`), and `description` and `itemTitle` on `BlockType`.
- `@panneau/fields`: `RepeaterField` duplicates items and adds them in between; `RepeaterFieldEntry` passes the title of the definition. An `itemTitle` that gives `null` for an item now leaves it its excerpt. The built-in `repeater` is loaded with `import()`: tests that render one through `DefinitionField` or a form wait for it (`findBy…`), as for the other lazy types.
- `@panneau/intl`: "Duplicate item {index}" and "Add an item between items {before} and {after}", in English and French.
- `laravel-panneau` can describe a block type's `description` and `itemTitle`, and a repeater's `itemTitle`, in its builders.
