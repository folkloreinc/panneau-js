# 0062: Toasts at the bottom, one per thing, and only when the page doesn't say it

- Status: proposed
- Date: 2026-11-04
- Issue: [#229](https://github.com/folkloreinc/panneau-js/issues/229)

## Context

Toasts showed at the top right of the screen, where the page keeps its header and its actions, and far from where the user just clicked: the Save button of a form is at the bottom. They said that something happened, not what, nor what to do next ("Saved", "“Export” is done"). They piled up: a toast with an action never closed by itself, five could show at once, and saving three times showed "Saved" three times. Some said what the page already showed: a form that saved loses its "Unsaved changes", and a queued run already shows in the runs button of the sidebar.

## Decision

### Where

- **At the bottom, centered**, by default. They rise above what sticks to the bottom of the page, such as the footer of a form: that element calls `useToastOffset(ref)`, and its height becomes the `--panneau-toast-offset` of the region.
- `PanneauRoot` takes a `toastPlacement`, for a project that wants them elsewhere: `bottom` (the default), `bottom-end` or `top-end`.
- On a phone, they take the whole width, at the bottom (or the top with `top-end`).
- They appear from below (from above at the top), without motion when the system asks for less.

### How many

- **One toast per thing.** `show(content, { key })`: a toast with the key of one already shown replaces it instead of adding another. "Saved" shows once, however many saves; running the same action on the same items again replaces its toast.
- **At most three visible.** The others wait for a place. The older ones fold behind the newest, peeking out, and unfold on hover or focus, which also pauses their timers.

### What they say

- **What was done to what**: "“Spring contest” created", "“Publish” is done for 3 pages", or the `message` of the action's result, which the backend writes with its own verbs ("3 entries archived").
- **The next step, when there is one**, as their action: "Open" the result, "Details" of the items that didn't succeed, "Download", "Undo" ([#230](https://github.com/folkloreinc/panneau-js/issues/230)). "Show" the items an action changed (the list filtered on them) needs a filter of lists on ids, which the protocol doesn't have yet: it comes with it.
- **Quiet, as the tones ask** ([#226](https://github.com/folkloreinc/panneau-js/issues/226)): a success or an info has the neutral look, with its icon in its color. Only warnings and errors have a colored edge.

### How long

- About **5 seconds**, longer for a longer text (about 200 words a minute, up to 10 seconds).
- About **10 seconds with an action**, instead of never: an action that must be reached later belongs in the page or in the runs popover, not in a toast that stays.
- **No timeout for an error** (`danger`): the user must read it and close it.
- Timers pause while the region is hovered or focused. `getToastTimeout(content)` gives the default; `timeout` in the options sets another.

### When

A toast says what the page doesn't:

- **A toast** for what happened out of sight (a run that finished, a change made from a menu, an item created before the page changed), for what can be undone, and for an error that has no place in the page (the network, a logout that failed).
- **No toast where the page shows the result.** A form that saves says "Saved" in its footer, next to its button, where "Unsaved changes" was, until its values change; a failed save says so there and in its alert. A form without a footer still gets a "Saved" toast. An error of a field or a cell stays on it.
- **No "queued" toast.** The runs button of the sidebar shows a run that starts, with its badge, and its popover follows it. A toast comes when the run ends, unless the user is looking at the open popover and the result says nothing more than its status.

## Consequences

- `ToastOptions` has a `key`, and `show()` returns it. Toasts with an action close after about 10 seconds: code that relied on them staying puts its action in the page.
- `FormView` takes `saved`, for a form that starts over from the item it just saved (a new `key`): the app's edit page passes it, so that "Saved" survives the new version. `showSavedToast` now only applies to forms without a footer.
- `ActionRunnerProvider` names the item (by the `itemTitle` of its resource) or the count of items in its toasts, and shows one toast per action and target.
- `@panneau/forms` depends on `lucide-react`, for the icon of "Saved".
