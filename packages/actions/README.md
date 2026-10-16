# @panneau/actions

Runs the actions of lists and forms: parameters in a dialog, the action through a data adapter, its result, and queued runs. Why it is its own package: [decision 0023](../../docs/decisions/0023-action-runner.md).

```tsx
import { useQueryClient } from '@tanstack/react-query';

import { ActionRunnerProvider, ActionRuns, useActionRunner } from '@panneau/actions';
import { createRestAdapter } from '@panneau/data';
import { invalidateActionResult } from '@panneau/data/query';
import { ListView } from '@panneau/lists';
import { PanneauRoot } from '@panneau/ui';

const adapter = createRestAdapter({ baseUrl: '/panneau/api' });

function App() {
    const client = useQueryClient();
    return (
        <PanneauRoot>
            <ActionRunnerProvider
                adapter={adapter}
                onResult={(result, { resource, target }) =>
                    invalidateActionResult(client, resource, result, target.selection)
                }
                onNavigate={(to) => navigate(typeof to === 'string' ? to : routeUrl(to))}
            >
                <Pages />
                <ActionRuns />
            </ActionRunnerProvider>
        </PanneauRoot>
    );
}

function Pages() {
    const runAction = useActionRunner('pages');
    return (
        <ListView
            list={list}
            items={items}
            columns={columns}
            actions={actions}
            onAction={runAction}
        />
    );
}
```

| Export             | Content                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/actions` | `ActionRunnerProvider`, `useActionRunner()`, `ActionRuns` and `useActionRuns()`, the dialogs (`ParametersDialog`, `ResultsDialog`), and their helpers |

## What the runner does

`useActionRunner(resource)` returns a function that takes a list's `ListActionEvent` (or `{ action, scope: 'item', item }` for the item of a form). Lists confirm the action first, when it asks for it; then the runner:

- **`server` actions:**
    1. asks for the parameters (`fields`, in their `layout`) in a dialog, with the forms of `@panneau/forms`: client validation, then the `422` errors of the action endpoint on the fields;
    2. runs the action through the adapter, with the item or the selection (`ids`, or the list query with exceptions), or nothing for the resource;
    3. shows the result in a toast: its `message`, the counts of what didn't succeed, and a "Details" button that lists those items with their message or reason;
    4. calls `onResult` (refresh what it changed), opens the `download`, and goes to the `redirect`.
- **Queued runs** (`202`): a toast says that the action runs in the background, the runner checks the run every `pollInterval` until it ends, then shows its result as above. `ActionRuns` lists the runs, with their progress, a button to cancel them (when the adapter has `cancelActionRun()`), and one to dismiss them once they have ended.
- **`link` actions** go to their `url` (with `{id}`) or `route`, through `onNavigate`.
- **`client` actions** render the handler that their `component` names: one of `clientActions`, or of the plugins of `PanneauProvider` (`definePlugin({ actions: { 'share-dialog': ShareDialog } })`). It gets `ClientActionProps`, and ends with `onDone(result?)` or `onCancel()`.

The function resolves with what happened (`{ status: 'done', result }`, `{ status: 'queued', run }` or `{ status: 'navigated', to }`), with `false` when the user cancelled the parameters (a list then keeps its selection), and rejects when the action failed (a list then shows it in a toast).

## The adapter

The runner only needs the action methods of a `DataAdapter`: `runAction()`, `getActionRun()` and, to cancel runs, `cancelActionRun()`. `createRestAdapter()` of `@panneau/data` has them. A product with its own API implements those three, and errors with a `problem` for validation errors (`422`). The runner doesn't need TanStack Query.

## Where to put it

Inside `PanneauRoot` (dialogs and toasts render there), and above the router of an app, so that it follows runs from page to page. It only knows the runs that it started.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
