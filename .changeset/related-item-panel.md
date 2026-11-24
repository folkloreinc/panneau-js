---
'@panneau/fields': patch
'@panneau/app': patch
---

Create a related item without leaving the form (decision 0110). In the app, a relation field offers "Create “text”" when the user can create in the related resource: it opens a panel over the page with the whole create form of that resource (its type first, when it has types), with the text as its title. Saving adds the new item to the field, closes the panel and brings the focus back to the field, and the form underneath keeps its unsaved values. Closing the panel with unsaved changes asks first, and ⌘ S saves the panel's form, not the page's. Inside the panel, relation fields don't offer to create, and their cards open in a new tab. `createRelationSource()` takes `createItem`, which creates the item somewhere else (such as that panel) and resolves with it; a source with `linksInNewTab` opens the links of its cards in a new tab; a resource whose types all forbid creation offers no "Create …".
