# 0093: Breadcrumbs in the page header, from two parents

- Status: proposed
- Date: 2026-11-19
- Issue: [#337](https://github.com/folkloreinc/panneau-js/issues/337)
- Builds on: [0092](0092-empty-states-avatars-tiles-and-other-primitives.md) (`Breadcrumbs`), [0034](0034-skeletons-while-content-loads.md) (skeletons), [0038](0038-pages-with-params.md) (pages with params), [0082](0082-items-open-in-their-form.md) (the item panel), [0084](0084-overviews.md) (dashboard pages)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

[0092](0092-empty-states-avatars-tiles-and-other-primitives.md) added `Breadcrumbs` to `@panneau/ui`, and left where it goes in the app to a decision of its own, with the "back" link of pages.

**The header of a page.** `PageHeader` of `@panneau/app` draws the page's only `h1`, its actions at the end, and an optional `back` link above the title: a muted, small link with a chevron, `{ href, label }`.

- The form of an item, the form of a new one and the page that chooses the type of a new one ([0077](0077-resource-types.md)) have it: "‹ Articles", to the list of their resource, labeled by its plural. It is the parent, not the history: an item opened from the search, the dashboard or a relation card still goes back to its list. A create goes there too once saved ([0066](0066-a-create-goes-back-to-the-list.md)), and the title of the tab is the page's title, then the parent's label.
- The list of a resource, the home page, dashboard pages, the account page and the pages of plugins have none. A plugin page can pass `back` itself.
- Error pages have their own "Back home" link, and auth pages "Back to log in".
- While an item loads, its form draws its skeleton, but its title reads "Edit article" until the item's title arrives: a text that changes, where [0034](0034-skeletons-while-content-loads.md) asks for a skeleton.

**What the app knows of parents.** The routes are flat ([0019](0019-app-entry.md)):

- `resources/{resource}` is the list, and `resources/{resource}/{id}` the item's panel beside it ([0028](0028-item-panel.md)), or its form when it opens there ([0082](0082-items-open-in-their-form.md));
- `resources/{resource}/create`, `…/create/{type}` and `…/{id}/edit` have the list as their only parent. The type's page is a step of a create, not a parent of the form after it;
- `pages/{page}` and `pages/{page}/{params…}` ([0038](0038-pages-with-params.md)) have no parent: a page with params is opened by an action or a link, and no menu lists it;
- `account` and the home page have no parent.

There are no nested resources: a relation links to its item's own route, in its own resource. So no page of the app has more than one parent today. One more is coming: an admin with an overview ([0084](0084-overviews.md)) leaves its logs out of the menus and reaches them from a dashboard page, "Activity". Their list has that page as its parent, which nothing in the definition says, and an item of the log has two: "Activity › Emails sent › To Ada Lovelace". The tree of pages in the [roadmap](../roadmap.md) will have deeper ones.

**What the shell already shows.**

- The sidebar marks the link of a resource as current on all of its pages, the list, the forms and the panel. The dock marks its tab, or the group or "More" that holds it ([0076](0076-a-dock-in-place-of-the-sidebar.md)).
- Groups of the menus have a label but no page.
- The current context ([0045](0045-current-context.md)) is in the sidebar, or in the bar at the top with the dock, with its picker.
- The name of the site links to the home page, at the top of the sidebar or of the bar.
- Below the `lg` width of the root (64rem), the sidebar is a drawer behind a button, and the bar at the top shows the name of the site only.

A trail of "Home › Content › Articles › Ten walks for the fall" would repeat all of that, and the title under it.

## Decision

### The parents of a page

The app derives them from the route and the definition, from the top:

| Page                                                       | Parents                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| An item's form, a new item, the page that chooses its type | the parents of its resource, then its list                          |
| A resource's list                                          | its `parent` page, and that page's parents, when it names one       |
| A page of `pages`                                          | its `parent` page or resource, and their parents, when it names one |
| The home page, the account page                            | none                                                                |

- **`parent`, a new optional key of a resource and of a page**, names a page of `pages` (`"parent": "activity"`). A page can also name a resource, whose list is then its parent (`"parent": { "resource": "jobs" }`), such as the page of a job with params. The chain stops at a page or resource that the user can't view, that doesn't exist, or that it already went through.
- **The page that chooses a type is a step, not a parent**: the form of a new feature has the list of articles as its parent, as today.
- **Never a crumb:** the home page, the groups of the menus, and the context. The sidebar and the dock already show them.
- **When a resource or a page isn't in the menus, its nearest parent that is takes the current state** in the sidebar and in the dock. The list of emails sent, out of the menus, keeps "Activity" current.

### What the header draws

**One parent: the back link, as today.** "‹ Articles" above "Ten walks for the fall". A trail of the list and the item would only say again what the link and the title say.

**Two parents or more: `Breadcrumbs` in place of the back link**, above the title, at its size and in its muted color:

```
Activity › Emails sent › To Ada Lovelace
To Ada Lovelace                                  [Resend] [⋯]
```

- The trail ends with the current page, as `Breadcrumbs` does: not a link, `aria-current="page"`. When the line is too short, its label is cut with an ellipsis first: the title under it is whole.
- **`maxItems` is 4**: the first parent, "…" with a menu of the folded ones, the nearest parent and the current page. Only the tree of pages will reach it.
- **Below 48rem of the root, the back link to the nearest parent**, "‹ Emails sent", in place of the trail: a trail wraps on a phone and pushes the title down, and the nearest parent is where the user goes from there. The link is a plain link, as today, without the `nav` of the trail.

### Labels

- **A page:** its `label`. **A resource:** its plural label, capitalized, as the back link has it. **A new item:** "New article", as its title.
- **An item:** its title (`itemTitle`), else its id.
- **While the item loads, its crumb and its title are a skeleton** of a line of text ([0034](0034-skeletons-while-content-loads.md)), with the list and the other parents already drawn: `Breadcrumbs` takes a `label` left `undefined` as loading. "Edit article" is only the title of an item that loaded without one.

### `PageHeader`

```tsx
<PageHeader
    title={title}
    parents={[
        { href: '/pages/activity', label: 'Activity' },
        { href: '/resources/emails', label: 'Emails sent' },
    ]}
/>
```

- **`parents`** (`{ href, label }[]`, from the top) draws the back link or the trail by the rules above. The current page's crumb is `title`, or `crumbLabel` when the title isn't a string.
- **Without `parents`, the header takes those of the current route**, so the page of a plugin with a `parent` in the definition gets its back link with no code. `parents={[]}` draws none.
- **`back` stays**, as `parents={[back]}`, and is deprecated.
- The title of the tab follows the trail: the page, then its parents, nearest first (`To Ada Lovelace · Emails sent · Activity · Northwind`).

### No crumbs in panels and dialogs

- **The item panel** ([0028](0028-item-panel.md), [0082](0082-items-open-in-their-form.md)) is beside its list, whose header is above it, and its close button goes back to the list. Its title stays its heading. The show route draws the header of the list, with the list's parents.
- **Dialogs, popovers and the "Go to…" palette** are not pages: none of them shows where it is.
- **Error pages** keep "Back home", and auth pages "Back to log in".

## Not decided here

- **The ancestors of an item in a tree** (the roadmap's tree of pages): the backend would give them with the item, and they would go between the list and the item, "Pages › About us › The team". The trail and `maxItems` above are ready for them.
- **The parents of a page with params** from its params, such as the job of a log: a page names a resource, not one of its items.
- **Going back through the history** (where the user came from) rather than to the parent. The browser's button does that ([0084](0084-overviews.md)).

## Consequences

- `@panneau/protocol`: `parent` on resources and pages, in the types, the JSON Schema, the checks (a page or a resource of the definition) and the mock example. `laravel-panneau` gains `->parent()` on `Resource` and `Page`.
- `@panneau/ui`: `Breadcrumbs` draws a `Skeleton` for an item whose `label` is `undefined`, in a `LoadingRegion`, and cuts the current page's label before the others.
- `@panneau/app`:
    - a `getPageParents()` helper from the route and the definition, used by the shell and by `PageHeader`;
    - `PageHeader` takes `parents` and `crumbLabel`, draws the back link or `Breadcrumbs` by the number of parents and the width of the root, and deprecates `back`;
    - the forms, the type's page and the plugin pages take their parents from it; the title of the tab follows them;
    - the title of an item's form, and its crumb, are a skeleton while the item loads;
    - `isCurrent()` marks the nearest parent in the menus when the route's own resource or page isn't there.
- Stories and tests: a page with one parent, with two, with four or more (folded), on a narrow root, and while its item loads, with the checks of `aria-busy` and of `aria-current`.
- Nothing changes for definitions without `parent`: their pages keep their back link, or none.
