---
'@panneau/ui': minor
'@panneau/fields': minor
'@panneau/intl': minor
---

Date shortcuts. `DateField` (and `DatePicker`) take `shortcuts`: small buttons under the control that fill it with a date, such as today, yesterday, or a date the app works out from other values of the form (a year after the start). Each shortcut has a `label` and a `value` (an ISO date for `DateField`, a `DateValue` for `DatePicker`); a `null` value disables its button, for a date that can't be worked out yet. The buttons are a group named "Shortcuts" (`panneau.ui.dateShortcuts`, in English and French), and are disabled with the field.
