---
'@panneau/ui': minor
'@panneau/intl': minor
'@panneau/lists': minor
'@panneau/app': minor
---

Empty states, avatars, tiles, button groups and breadcrumbs (decision 0092). `@panneau/ui` exports `EmptyState` (an icon, a title, a description and actions, in two sizes), `Avatar` and `AvatarGroup` (a picture, or initials on a tint of a chart color picked from the name, with a ring in a tone and a status in words for a state of the person), `Tile` and `TileGroup` (a media, a title, a description and actions, and the whole tile a link with `href`), `ButtonGroup` (attached buttons, and split buttons with a `MenuTrigger`) and `Breadcrumbs` (with the middle crumbs folded into a menu by `maxItems`), with their component tokens. `TextArea` takes a `header` and a `footer`, drawn inside its box. `@panneau/intl` has their messages, in English and French. Empty lists and lists without a match, and widgets of the dashboard without data, show an `EmptyState`; the user's menu shows the user's initials in the color of their name.
