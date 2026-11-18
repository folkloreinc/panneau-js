---
'@panneau/protocol': minor
'@panneau/lists': minor
'@panneau/app': minor
---

Actions in their tones (decision 0091). An action can declare a `tone`, a tone of the theme, which colors its icon in rows and outlines its button in the header of an item (its form and its panel). Without one, the built-in actions keep their colors (`show` `info`, `edit` `accent`, `restore` `success`), a `link` whose URL leaves the admin, such as the page of an item on the site, is `info`, and the others stay `neutral`; an action that destroys is always `danger`. In the header of an item, an action with a tone is outlined in it, without a fill, and the neutral ones stay secondary buttons. `getActionTone()` is exported by `@panneau/lists`. The toolbar and the selection don't change.
