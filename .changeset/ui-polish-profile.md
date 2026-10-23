---
'@panneau/ui': patch
'@panneau/app': minor
'@panneau/protocol': minor
'@panneau/intl': minor
---

Small fixes to the interface, and a link to the user's profile:

- **`@panneau/ui`:**
    - a text before or after the value of a `TextInput` (`prefix`, `suffix`) reads with it, without a gap: `/episodes/ete-a-montreal`, as in the slug field. Icons and other elements keep their space;
    - `DatePicker` with a time (`granularity` `hour`, `minute` or `second`): the calendar has a field for the time, and stays open after a day is picked (`shouldCloseOnSelect` defaults to `false`). The calendar is as wide as its content, its month buttons lose the divider of the field's button, and the space of `10/15/2026, 9:30 AM` is back;
    - the description of an option (`Select`, `ComboBox`, `Menu`) is smaller, under its label, and an option with one has more room (`--panneau-list-box-item-padding-y-described`).
- **`@panneau/app`:**
    - on a small screen too, the page is on a panel inset from the edges, with rounded corners, as on a large one. The shell's `inset`, `panel-border`, `panel-radius` and `panel-shadow` tokens apply at every width;
    - the user in the sidebar links to their profile: their item in the resource of users, when the definition has it.
- **`@panneau/protocol`:** `user.resource` names the resource of users. Without it, clients look for a resource `users`.
- **`@panneau/intl`:** the label of the profile link, in English and French.
