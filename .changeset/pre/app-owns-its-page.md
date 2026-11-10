---
'@panneau/app': patch
'@panneau/ui': patch
---

The app owns its page (decision 0078): while `<Panneau>` is mounted, `body` has no margin, and `html` and `body` take the background and the color scheme of the app's root. The browser's default margin no longer frames the app in white, and a dark scheme no longer shows white under a short page or when the page bounces. The page's own inline styles come back when the app unmounts. `PanneauRoot` takes a `ref` to its element.
