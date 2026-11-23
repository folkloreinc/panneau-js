# 0102: Going back to a list shows it as it was left

- Status: accepted
- Date: 2026-11-23
- Amends: [0042](0042-list-view-columns-and-remembered-view.md) (what a link back to a list opens)
- Issue: [#429](https://github.com/folkloreinc/panneau-js/issues/429)

## Context

Items open in their form ([0082](0082-items-open-in-their-form.md)), and the user goes back to their list from it: by the link above the title, the breadcrumbs ([0093](0093-breadcrumbs-in-the-page-header.md)), the browser's Back, or because the item was deleted. Every way but Back went to the bare path of the list, which opens its remembered view ([0042](0042-list-view-columns-and-remembered-view.md)): its filters, sort, page size, layout and columns, but not its page, cursor or search, which 0042 leaves out on purpose, as a query of the moment. The user who searched, or paged to the 4th page, found the list back at its start. Back kept the query, which is in the URL, but every page change scrolled to the top, Back included.

Two ways could carry the list's query to the form and back:

- **In the links**: the title and the `edit` action link to the form with the list's query string, and the form passes it on to its links back. The form's URL then holds a state that isn't its own, every link to a form would have to carry it (search, the palette, toasts, relation cards), and what is lost on the way is lost for good.
- **Remembered**: the list keeps its last query string, and links back to it use it. They don't need anything from the page they are on.

## Decision

- **Each list of a resource keeps its last query string in the tab** (`sessionStorage`, keyed like its remembered view: the app's base path, the user and the resource), as it shows it, on its route and on the show route of its items. A tab is one train of thought: another tab, or a new session, starts from the remembered view.
- **Links back to a list go to its last URL**: the link above the title of a page and the breadcrumbs, for the items of a resource and the pages under its list, and the page an item's form goes to once the item is deleted. They show the list as the user left it: filters, sort, page or cursor, search and layout.
- **The menus and the home page still open the bare list**, with its remembered view, as 0042 says: opening a list is not going back to it.
- **After a create, the app still goes to the bare list** ([0066](0066-a-create-goes-back-to-the-list.md)), with its remembered view: a page or a search of the moment would likely hide the new item, which the list is there to highlight.
- **The browser's Back and Forward restore the scroll** of the page they go to, as it was left: the window's and that of the main element of the layout. A list whose items come back from the cache shows them at once; one that loads gets its scroll once it is tall enough, within half a second. **Every other navigation starts at the top**, and focus moves to the title of the new page, as before, also on Back.

## Why remembered rather than in the links

It works the same for every way back, including those that aren't links from the list (the breadcrumbs of a page that a link from elsewhere opened, a delete), and keeps the form's URL its own. It costs a value per list in the tab's storage. The cursor of a list paged with cursors comes back, not the cursors before it: its "Previous" starts over from the first page, as on any link to a cursor.

## Consequences

- `@panneau/app`: the list page writes its query string to the tab's storage, and the parents of a page and the form's delete read it. The app's history keeps the scroll of each entry, and sets `history.scrollRestoration` to `manual` while the app runs.
- Nothing changes for the remembered view of 0042, nor for lists outside the app.
