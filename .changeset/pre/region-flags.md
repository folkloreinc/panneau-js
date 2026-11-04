---
'@panneau/fields': minor
'@panneau/lists': minor
---

Flags of regions ([decision 0059](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0059-flags-of-regions.md)).

- **The provinces and territories of Canada and the states, district and territories of the United States have their flags**, as countries do: small images from Wikimedia Commons, which load the first time a region of their country shows. The regions of other countries have none.
- `@panneau/fields`: `RegionField` shows the flag of the selected region and of each option. `@panneau/fields/region` exports `RegionFlag`, `useRegionFlags()`, `loadRegionFlags()`, `getRegionFlag()` and `REGION_FLAG_COUNTRIES`.
- `@panneau/lists`: the `region` display shows the flag before the name of the region.
- The flags are data URLs: a Content Security Policy needs `img-src data:`.
