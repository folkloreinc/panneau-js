---
'@panneau/ui': minor
'@panneau/forms': patch
'@panneau/fields': patch
'@panneau/intl': patch
'@panneau/app': patch
---

Forms on phones (#501). Below 56rem, the sidebar of a form comes before its fields, collapsed to one line that names its panels (`Publication · Files`), with the error badge of its fields; it opens on a revealed field or an error, and has no box of its own, so its fields are as wide as the form's (decision 0075, amended). `AsideLayout` takes `narrow="before"` and `onBeforeChange`, and `Aside` takes `summary`, `summaryEnd`, `isExpanded` and `onExpandedChange`. The switch of a localized field stays on the line of its label: the label wraps first, and "Copy from …" is only its icon in a narrow field. A narrow repeater puts the tools of an item in a menu ("Actions for item 1"), so that its title keeps the room of its header. On a phone, the save bar of the app's form page is fixed at the bottom of the screen, from edge to edge, on the background of the page's card.
