---
'@panneau/ui': minor
'@panneau/core': minor
'@panneau/lists': minor
'@panneau/app': patch
'@panneau/editor': patch
'@panneau/fields': patch
'@panneau/forms': patch
'@panneau/media': patch
---

One copy of the shared helpers. A protocol-relative link (`//example.com`) opens in a new tab from a row and from the header of an item, as it does from the editor: every package decides with `isExternalUrl()` of `@panneau/protocol/runtime`. `@panneau/lists`: `ActionButton` is public, and takes `inHeader` (the color of the action, outlined, with the icon of an external link), which the actions of an item in `@panneau/app` now use. `getActionHref()` is no longer public: use `fillActionUrl()` of `@panneau/core`. `@panneau/ui`: `cx()` is public, the one `cx` of every package. `@panneau/core`: `ruleMessages` holds the English messages of the rules by the keys of `@panneau/intl` (`panneau.forms.rule.<key>`), `crop` included, and `formatRuleFailure()` uses them: numbers are formatted (`1,200`) and lists take a serial comma (`YouTube, Vimeo, or Spotify`). `@panneau/media`: the picker's own `formatDuration` is now `formatPlaybackTime`, apart from `formatDuration()` of `@panneau/fields/duration`.
