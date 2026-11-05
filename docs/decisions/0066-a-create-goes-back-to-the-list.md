# 0066: A create goes back to the list, which shows the new item

- Status: proposed
- Date: 2026-11-05
- Changes: the toast after a create ([0062](0062-toasts.md)), and the page that opens after it

## Context

Creating an item opened its edit page, with a toast: "“Brochure.pdf” created". People who tried it found the flow odd:

- **The page wasn't where they wanted to be.** Most items are created, then found again in their list: a PDF added to the files, a category, an author. The edit page of the new item, with the same form they just filled, said nothing new, and they went back to the list themselves.
- **The toast was in the way.** It said what the page couldn't, since the page had changed, but it stayed 5 seconds, and it floated high on the screen: it rose above the footer of the form ([0062](0062-toasts.md)) even when that footer didn't stick to the bottom, as on a short form, where it ends after the last field, in the middle of the screen.

[0062](0062-toasts.md) already says that a toast is for what the page doesn't show. A list can show the new item.

## Decision

- **After a create, the app goes back to the list of the resource**, in place of the create page, which Back would open again empty. Pickers and dialogs that create items (the "Create “…”" of a relation, the media picker) keep their own flow: they stay where they are, with the new item chosen.
- **The list highlights the new item**: once it shows it, it scrolls it into view (without smooth scrolling when the system asks for less motion), and gives it a subtle background, the accent's subtle color, which fades out after about 3 seconds. Without motion, the background shows, then goes, without the fade. The item is marked `data-highlighted`, in every layout, for themes and tests.
- **The page shows it, so no toast.** A list that doesn't show the new item, because of its filters, its sort or its page, says it was created in a toast, with "Open" (where its title goes). Errors stay where they belong: on the fields of the form, in its footer and its alert ([0062](0062-toasts.md)).
- **Toasts rise above what sticks to the bottom only while it sticks there.** `useToastOffset()` measures how much of the bottom of the viewport the element covers, as the page scrolls and resizes, rather than its height: the footer of a short form, after its last field, leaves the toasts at the bottom.

## Consequences

- `@panneau/lists`: `ListView` takes `highlightedItemId`. Layouts get `isHighlighted(item)`: the built-in ones give its element the class of the highlight and `data-highlighted`. A plugin's layout can do the same.
- `@panneau/app`: the create page goes back to the list, which highlights the item, or shows a toast with "Open" when it doesn't show it. The item is passed in memory, not in the URL or the history: a reload or Back doesn't highlight it again.
- `@panneau/ui`: `useToastOffset()` follows what the element covers of the viewport.
- People who want to keep editing the new item open it from the list, where it is highlighted. A resource that needs its edit page after a create (to add blocks, say) is a case to watch: a definition could ask for it later.
