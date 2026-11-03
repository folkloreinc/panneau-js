---
'@panneau/intl': patch
'@panneau/app': patch
---

The shell has a notification area for queued action runs (#180).

- `@panneau/app`: while the action runner follows runs, the sidebar has an "Actions" button, with the count of the runs in progress (an icon with a badge in the rail of icons and in the top bar of small screens). It opens a popover with their status and progress (`ActionRuns`), on every page, so runs stay in sight after the user leaves the list that started them. The list of runs at the top of the page is gone. New classes: `panneau-action-runs-button-*`. `panneau-app-layout-top-bar-search` is replaced by `panneau-app-layout-top-bar-end`, around the buttons at the end of the top bar.
- `@panneau/intl`: `appMessages.actionRuns` and `appMessages.actionRunsLabel`, in English and in French.
