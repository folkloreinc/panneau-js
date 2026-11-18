---
'@panneau/protocol': minor
'@panneau/media': minor
'@panneau/codemods': patch
---

Image fields without transforms (decision 0087). A `media` or `image` field can say that its values keep no transform for one use: `"transforms": false`, which `laravel-panneau` writes for `transforms(false)`. An `image` field without transforms has no Edit action, no editor and no crop step: it shows each image as the media is, and drops the `transform` of the values it sends. `ImageField` and `ImageOptions` take `transforms`, which `getImageOptions()` reads. `lintDefinition()` reports `ratios` and the `crop` rule on a field without transforms. The codemods pass `transforms` to `ImageField`.
