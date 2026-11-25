---
'@panneau/ui': patch
'@panneau/fields': patch
'@panneau/editor': patch
'@panneau/app': patch
---

Follow-ups of forms on phones (#503). Before a form on a narrow screen, a sidebar whose button names a single panel (`Publication`) no longer repeats the title of that panel, nor collapses it a second time. The legend of a repeater keeps one line: "Expand all" and "Collapse all" are at its end, only an icon in a narrow field (the class `panneau-repeater-field-bar` is gone). What floats in fields (the "+" between two items of a repeater, the toolbar of the rich text editor, the overlay of a file drop zone) stays under the top bar of the app as the page scrolls, and the toolbar of the rich text editor sticks under that bar. The footer of the form in the related item panel goes from edge to edge of the panel, down to its bottom, on its background.
