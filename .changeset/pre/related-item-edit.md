---
'@panneau/fields': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Edit a related item in a panel, without leaving the form (#471, decision 0110): the card of a relation field has "Edit" on the items the user can update, which opens the item's form in the panel over the page that creates related items. Saving updates the item and its card at once, closes the panel and brings the focus back to the card; the form underneath keeps its values and its unsaved changes. In the app's forms, the link of a card opens the item's page in a new tab. `createRelationSource()` takes `editItem` and `linksInNewTab`; `RelationSource` has `edit()`, `canEdit()` and `edited()`; `useRelationReferences()` takes `resolveAll`. New messages: `panneau.fields.edit`, `panneau.fields.editRelation`, `panneau.fields.editRelationFailed`, `panneau.app.itemUpdateForbidden` and `panneau.app.itemGone`, in English and French.
