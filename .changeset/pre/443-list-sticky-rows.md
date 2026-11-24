---
'@panneau/ui': patch
'@panneau/lists': patch
'@panneau/app': patch
---

Lists keep their header and their selection in view, open an item from anywhere on its row, and offer to create the first item (#443). `@panneau/lists`: the header of the table and the selection bar, with its actions, stick under the top of the window while the list scrolls, in every density; a table wider than the list scrolls in its own box, as high as the window, where its header sticks. A click on a row, a card or a tile outside its controls (checkbox, actions, cells edited in place, links) follows the link of its title, so ⌘-click, Ctrl-click and a middle click open it in a new tab; the title stays the only link and tab stop of the row, and text in a row can still be selected. In select mode, a click on a row selects its item. `ListView` takes `emptyAction`, a node or `{ label, href }`, shown in a list without items, filters or search. A selected row of the table reads darker than a hovered one, which still shows over it (#405). `@panneau/ui`: `--panneau-frame-top`, a semantic token (`0px`), the space the frame of the app takes at the top of the window, under which what sticks to the top stays. `@panneau/app`: the top bar of a small screen sets it, and an empty list of a resource the user can create in shows "New …", with the menu of its types.
