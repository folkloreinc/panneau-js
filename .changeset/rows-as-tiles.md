---
'@panneau/fields': minor
'@panneau/app': minor
'@panneau/media': minor
---

Rows that show one thing are drawn with `Tile` and `TileGroup` (decision 0092): the chosen items of a relation field, the items of the dashboard's list widgets, the passkeys of the account page, and the chosen files of a media field. A row with a link is a link as a whole. Their own stable classes are removed: `.panneau-relation-field-card`, `-card-actions`, `-card-description`, `-card-label`, `-card-text`, `-cards`, `-link` and `-option-thumbnail`; `.panneau-dashboard-item`, `-item-description` and `-item-text`; `.panneau-pages-passkey`, `-passkey-name` and `-passkeys`; `.panneau-media-field-item` and `-thumbnail`. Restyle them with the tile's tokens and its `.panneau-tile` and `.panneau-tile-group` classes.
