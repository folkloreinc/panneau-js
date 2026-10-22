---
'@panneau/core': minor
'@panneau/forms': minor
'@panneau/app': minor
---

Navigating the app shell no longer loses unsaved changes, and announces each page:

- **`@panneau/core`:** `createLeaveGuards()`, `LeaveGuardsProvider` and `useLeaveGuard()` let a router ask the forms below it before leaving a page.
- **`@panneau/forms`:** under a `LeaveGuardsProvider`, a form with unsaved changes (`guardUnsavedChanges`, on by default) asks in a dialog before the router leaves its page, not only before the page closes or reloads.
- **`@panneau/app`:**
    - links, "Go to…" and actions ask before leaving a form with unsaved changes, and so do the browser's back and forward buttons;
    - the tab is named after the page (`Ten walks for the fall · Articles · Northwind Journal`);
    - when the route changes, focus moves to the title of the new page and the page scrolls to the top. Opening the panel of an item focuses the panel, and closing it gives focus back to the item's link.
