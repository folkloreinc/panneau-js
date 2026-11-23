---
'@panneau/lists': patch
'@panneau/intl': patch
'@panneau/app': patch
'@panneau/protocol': patch
---

Confirmations and toasts of actions name the item or the resource (decision 0062). The confirmation of the built-in `delete` names what it deletes in its title: "Delete “Spring contest”?", "Delete 3 articles?"; the confirmation of another action says it in its message: "“Archive” will apply to 3 articles.". `ConfirmDialog` takes `itemLabel` (the title of the item) and `labels` (the resource's singular and plural), and `ListView` takes `resourceLabel` for its confirmations: the app passes them, by the `itemTitle` and `label` of the resource. An action that fails from the header of an item names it: "“Archive” failed for “Spring contest”.". The mock backend's delete writes the message we want backends to write: "“Spring contest” deleted.", "Page deleted.", "3 pages deleted.", in place of "1 deleted.". New messages in `@panneau/intl`, in English and French: `confirmDeleteTitle` and `confirmMessageFor` of `listsMessages`.
