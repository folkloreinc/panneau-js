---
'@panneau/actions': patch
'@panneau/media': patch
---

Ask before losing unsaved changes when closing the parameters of an action or the media picker, with the dialog and the words of leaving a form page ("Leave without saving?", "Stay" keeps the values). Closing them unchanged doesn't ask. The parameters of an action are also guarded when the page is reloaded or left through the app's router.
