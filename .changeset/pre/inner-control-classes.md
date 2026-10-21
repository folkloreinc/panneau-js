---
'@panneau/ui': patch
---

`TextArea`, `Checkbox` and `Switch` no longer style their wrapper with the rules of their inner control. The inner element had the class named after the component (`panneau-text-area`, `panneau-checkbox`, `panneau-switch`), which is also the root class of the component, so a text area's wrapper got the padding of the textarea, and a checkbox's wrapper was laid out and dimmed like the checkbox itself. The inner element is now `panneau-text-area-control`, `panneau-checkbox-control` and `panneau-switch-control`, and the class named after a component only names its root.
