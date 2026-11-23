---
'@panneau/actions': patch
'@panneau/media': patch
'@panneau/app': patch
---

Ask before losing unsaved changes in three more places, with the dialog and the words of leaving a form page ("Leave without saving?", "Stay" keeps the values). Closing the parameters of an action (Escape, a click outside, Cancel) and closing the media picker with changed details of a media now ask first; closing them unchanged doesn't. The parameters of an action are also guarded when the page is reloaded or left through the app's router. The profile form of the account page is now a form of `@panneau/forms`: it says when it has unsaved changes, asks before the page is left with them, saves with ⌘ Enter (Ctrl Enter elsewhere), and checks that the name and the email are filled in before sending them.
