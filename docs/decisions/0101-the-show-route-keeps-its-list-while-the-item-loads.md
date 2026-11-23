# 0101: The show route keeps its list while the item loads

- Status: accepted
- Date: 2026-11-23
- Amends: [0082](0082-items-open-in-their-form.md) (what the show route shows while an item that may open in its form loads)
- Issue: [#422](https://github.com/folkloreinc/panneau-js/issues/422)

## Context

[0082](0082-items-open-in-their-form.md) sends the show route of an item that can be updated to its form, and keeps those that can't in the panel. Until the item had loaded, the app couldn't tell which, so the page showed nothing, rather than the list and its panel for an instant.

The list and the show route render the same page ([0028](0028-item-panel.md)), so that the list keeps its state while the panel opens. Showing nothing while the item loaded broke that for the items that open in the panel by default, those that can't be updated: clicking one emptied the page, then rendered the list again with the panel, its rows new elements. Scroll, hover and focus in the list were lost. Loading a link to an item showed an empty page until it loaded.

## Decision

- **While the item loads, the show route shows its list and the panel's skeleton**, as it does for a resource with `"open": "panel"`. The list stays mounted, with its query and its scroll; only the panel mounts, and unmounts when it closes.
- **Once the item says it opens in its form, the app goes there**, replacing the entry of the history, as before. A link to such an item can show the list and the panel's skeleton for the time of the request: an empty page told the user less.

## Consequences

- `@panneau/app`: opening and closing an item from its list neither renders the list again nor fetches it again, whatever the `open` of its resource.
