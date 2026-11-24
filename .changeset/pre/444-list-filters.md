---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/lists': patch
'@panneau/intl': patch
'@panneau/app': patch
---

List filters say which are active, keep the secondary ones in "More filters", and fit a phone. A filter control with a value is marked, in the tones of what is selected (`--panneau-selected-*`), with a button that clears it. A filter of the definition shows first in the toolbar with `"primary": true`; the others are behind a "More filters" button, with the count of those that are active, and without any `primary`, the first 3 show first. A filter with a value keeps its chip under the toolbar. In a narrow list (a phone), every filter is behind one "Filters" button with the count of the active ones, which opens them in a sheet, next to the search. The page sizes of a list are a setting of the resource: `perPageOptions` of its list, 10, 20, 50 and 100 by default, which `resolveList()` of `@panneau/core` now gives (`DEFAULT_PER_PAGE_OPTIONS`) and the app offers. A page size the browser remembers for a list that it no longer offers falls back to the list's `perPage`.
