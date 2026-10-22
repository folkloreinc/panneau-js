# 0028: The show route opens an item's details in a panel next to its list

- Status: accepted
- Date: 2026-10-22
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), Phase 2 (app shell)

## Context

[0019](0019-app-entry.md) reserves `{basePath}/resources/{resource}/{id}` for the show page of an item. The first app shell ([#87](https://github.com/folkloreinc/panneau-js/pull/87)) rendered the edit form there, as a placeholder. A full page to read an item would take the user away from its list, though they mostly come from it and go back to it.

The roadmap listed three directions: a link to the item on the site, a preview in a dialog, or a panel on the right of the list.

## Decision

- **The show route is the list of the resource with a panel on its right**, which holds the details of the item. It is the same page as the list: the list keeps its state (query, page, selection) while the panel opens, closes or shows another item.
- **Titles in the list link to the show route**, with the list's query string, so the panel opens without losing it. The row of the item shown is marked (`currentItemId` of `ListView`), and the link of its title is the current page (`aria-current`).
- **The panel shows:**
    - the title of the item (its `itemTitle`);
    - a link to edit it, unless the item says it can't be updated (`abilities.update: false`);
    - the `link` actions of the resource that apply to the item, such as its page on the site (`"kind": "link", "url": "https://example.com/{slug}"`). External links open in a new tab;
    - its values, with the displays of the lists (`ItemDetails` of `@panneau/lists`), except groups and repeaters, which only the form shows;
    - **its preview, when the resource has one** (`features.preview`, [0009](0009-preview-drafts-revisions.md)), in a first tab, before the values:
        - `{ "mode": "component", "component": "page" }`: a component that a plugin registers in its `previews` (`PreviewProps`: the item, its resource, the locale). It renders anything richer than the values: the page as the site shows it, its blocks or partials, charts;
        - `{ "mode": "iframe" }`: the item's page on the site, from the short-lived URL of `POST /resources/{resource}/{id}/preview` (`previewItem()` of the data adapter, optional), with a link to open it in a new tab.
- **Closing** (its button, or Escape) goes back to the list, with its query. Focus moves to the panel when it opens or shows another item.
- **Layout:** beside the list from the `xl` width of the root (80rem), in the flow of the page. Below it, over the list, on its right, the whole width on a phone. **A button widens it**, for previews (half of the page by default), and the browser remembers it, like the tab. Its widths, background, radius and shadow are component tokens (`--panneau-item-panel-*`).
- **"A link to the item on the site" is a `link` action**, which the protocol already has: no new property.

## Not decided here

- **Previews of unsaved values** in the form, live through `postMessage` ([0009](0009-preview-drafts-revisions.md)): the panel previews the saved item. The props and the endpoint already take values, for the form's preview of 5.x.
- **Server actions** (publish, delete) stay in the list's rows and menus for now. Running them from the panel needs the confirmation of the list to move to the action runner.
- **A resource whose show route goes straight to the site**, without the panel, would need a property of the protocol: to decide when a project needs it.

## Consequences

- The edit page is only reached through its own link (in the panel, or in a row action).
- `@panneau/core` has a `previews` kind of plugin components and `PreviewProps`. `@panneau/data` has `previewItem()` (optional on adapters) and `useItemPreview()`. The mock backend of the protocol answers the preview route, with a `previewUrl` option.
- `@panneau/lists` exports `ItemDetails`, and `ListView` takes `currentItemId`. Layouts get `isCurrent`, which custom layouts can ignore.
- Every list page renders the panel when the route has an id, so a link to an item can be shared.
