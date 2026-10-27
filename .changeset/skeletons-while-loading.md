---
'@panneau/lists': minor
'@panneau/forms': minor
'@panneau/media': minor
'@panneau/app': minor
'@panneau/intl': minor
---

Skeletons instead of spinners while content loads (#121, decision 0034), drawn by the components themselves, so a product that uses them without the app gets them too:

- `ListView`: while `items` is `undefined`, rows of its columns in its layout, as many as the page size, up to 10.
- `ItemDetails`: `item` can be `undefined` while it loads, for the labels with a skeleton of each value.
- `Form` and `FormView`: `isLoading` draws the layout of the form, and for each field its label and a block of its height, from its type. The app's edit page uses it while the item loads.
- The media picker draws its cards with `Skeleton`, and its own skeleton CSS is gone.
- The app: the item panel draws its title, actions and details, the preview a block in its frame, and the boot the shell with its sidebar and a page header, instead of a centered spinner.
- New messages, in English and French: `lists.loading`, `lists.loadingItem`, `forms.loading`, `app.previewLoading`.
