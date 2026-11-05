import { type ReactNode, useEffect, useEffectEvent, useRef, useState } from 'react';

import { usePanneau } from '@panneau/core';
import { getActionLabel } from '@panneau/intl';
import type { ActionResult, ActionRun, RouteReference } from '@panneau/protocol';
import { usePanneauIntl, useToast } from '@panneau/ui';

import { ParametersDialog } from './ParametersDialog';
import { ResultsDialog } from './ResultsDialog';
import { ActionRunnerContext, type ActionRunnerContextValue } from './context';
import { describeResult, describeSubject, getItemTitle, isInUse } from './describe';
import { messages } from './messages';
import { buildActionRequest, getLinkTarget, getResultCounts, isFinished } from './request';
import type {
    ActionAdapter,
    ActionDownload,
    ActionOutcome,
    ActionResultContext,
    ActionTarget,
    ClientActionHandler,
    FollowedRun,
} from './types';

export interface ActionRunnerProviderProps {
    /** Runs the actions: a `DataAdapter`, or any object with its action methods. */
    adapter: ActionAdapter;
    children?: ReactNode;
    /**
     * Called with every result: of an action that finished at once, and of a queued run when it
     * finishes. Refresh what it changed here. With `@panneau/data/query`:
     * `invalidateActionResult(client, resource, result, target.selection)`.
     */
    onResult?: (result: ActionResult, context: ActionResultContext) => unknown;
    /**
     * Goes to the `redirect` of a result, or to the URL or route of a `link` action. Defaults to
     * `window.location.assign()` for URLs; routes need it.
     */
    onNavigate?: (to: string | RouteReference) => void;
    /** Opens the `download` of a result. Defaults to a link to its URL, clicked. */
    onDownload?: (download: ActionDownload) => void;
    /** Handlers of `client` actions by their `component`, over those of the plugins. */
    clientActions?: Readonly<Record<string, ClientActionHandler>>;
    /** Milliseconds between two checks of a queued run. Defaults to 2000. */
    pollInterval?: number;
    /** Locales of localized parameters. Defaults to the definition's. */
    locales?: readonly string[];
}

interface Pending {
    resource: string;
    target: ActionTarget;
    resolve: (outcome: ActionOutcome | false) => void;
}

interface ClientPending extends Pending {
    Handler: ClientActionHandler;
}

function navigateTo(to: string | RouteReference) {
    if (typeof to === 'string') {
        window.location.assign(to);
    } else {
        console.warn(
            `[panneau] An action goes to the route "${to.route}": give ActionRunnerProvider an onNavigate.`,
        );
    }
}

function openDownload(download: ActionDownload) {
    const link = document.createElement('a');
    link.href = download.url;
    if (download.filename !== undefined) {
        link.download = download.filename;
    }
    link.rel = 'noopener';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
}

/**
 * Runs the actions that lists and forms hand over ([decision 0023]): it asks for their parameters
 * in a dialog, runs them through the adapter, shows their result (a toast, and the items that
 * didn't succeed), follows queued runs until they end, refreshes through `onResult`, follows
 * redirects and opens downloads. Put it inside `PanneauRoot`, and above the router of an app, so
 * that runs are followed from page to page. `useActionRunner(resource)` runs an action.
 */
export function ActionRunnerProvider({
    adapter,
    children,
    onResult,
    onNavigate = navigateTo,
    onDownload = openDownload,
    clientActions,
    pollInterval = 2000,
    locales,
}: ActionRunnerProviderProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const { definition, plugins } = usePanneau();
    const [parameters, setParameters] = useState<Pending | null>(null);
    const [client, setClient] = useState<ClientPending | null>(null);
    const [details, setDetails] = useState<{ label: string; result: ActionResult } | null>(null);
    const [runs, setRuns] = useState<readonly FollowedRun[]>([]);
    // Runs whose end was already shown, so that a late poll doesn't show it twice.
    const notified = useRef(new Set<string>());
    // How many lists of runs are on screen (the popover of the runs): their user sees a run end.
    const watchers = useRef(0);

    /** What the action applied to, by the item's title or the count of items. */
    const subjectOf = (resource: string, target: ActionTarget, count: number | null = null) =>
        describeSubject(
            target,
            definition?.resources.find((candidate) => candidate.id === resource),
            intl,
            count,
        );

    /** The title of the item of an `item` action, to name it. */
    const itemTitleOf = (resource: string, target: ActionTarget) => {
        if (target.item === undefined) {
            return null;
        }
        const itemTitle = definition?.resources.find(
            (candidate) => candidate.id === resource,
        )?.itemTitle;
        return getItemTitle(target.item, itemTitle, intl.locale);
    };

    /** One toast per action and target: running it again replaces it. */
    const toastKey = (resource: string, target: ActionTarget) =>
        `panneau-action:${resource}:${target.action.id}:${target.item?.id ?? 'selection'}`;

    const finish = async (
        resource: string,
        target: ActionTarget,
        result: ActionResult,
        { queued = false }: { queued?: boolean } = {},
    ) => {
        await onResult?.(result, { resource, target });
        const counts = getResultCounts(result);
        const itemTitle = itemTitleOf(resource, target);
        const content = describeResult(
            result,
            getActionLabel(target.action, intl),
            intl,
            subjectOf(resource, target, counts.succeeded),
            itemTitle,
        );
        const entries = result.results ?? [];
        // The toast already names an item that is in use: its details would only repeat it.
        const hasDetails =
            entries.length > 0 &&
            !(
                entries.length === 1 &&
                entries[0] !== undefined &&
                isInUse(entries[0]) &&
                itemTitle !== null
            );
        const download = result.download ?? null;
        if (download !== null) {
            onDownload(download);
        }
        const redirect = result.redirect ?? null;
        // A queued run that ends in the open list of runs is seen there, unless its result says
        // more than its status: a message, items that didn't succeed, a download.
        const saysMore = (result.message ?? '') !== '' || hasDetails || download !== null;
        if (queued && watchers.current > 0 && !saysMore) {
            if (redirect !== null) {
                onNavigate(redirect);
            }
            return;
        }
        // "Undo" lives in the toast only (decision 0063): a queued run, which finished later, isn't
        // undone.
        const undo = !queued ? (result.undo ?? null) : null;
        toasts.show(
            {
                ...content,
                ...(undo !== null
                    ? {
                          action: {
                              label: intl.formatMessage(messages.undo),
                              onAction: () => void runUndo(resource, target, undo),
                          },
                      }
                    : hasDetails
                      ? {
                            action: {
                                label: intl.formatMessage(messages.details),
                                onAction: () =>
                                    setDetails({
                                        label: getActionLabel(target.action, intl),
                                        result,
                                    }),
                            },
                        }
                      : download !== null
                        ? {
                              action: {
                                  label: intl.formatMessage(messages.download),
                                  onAction: () => onDownload(download),
                              },
                          }
                        : {}),
            },
            { key: toastKey(resource, target) },
        );
        if (redirect !== null) {
            onNavigate(redirect);
        }
    };

    /**
     * Runs the undo of a result: an action of the same resource, on the items it lists, as any
     * action. A short toast then says it was undone, in place of the first one.
     */
    const runUndo = async (
        resource: string,
        target: ActionTarget,
        undo: NonNullable<ActionResult['undo']>,
    ) => {
        const label = getActionLabel(target.action, intl);
        const key = { key: toastKey(resource, target) };
        const declared = definition?.resources
            .find((candidate) => candidate.id === resource)
            ?.actions?.find((action) => action.id === undo.action);
        const undoTarget: ActionTarget = {
            action: declared ?? { id: undo.action, kind: 'server', scope: ['selection'] },
            scope: 'selection',
            selection: { ids: undo.items },
            count: undo.items.length,
        };
        await adapter
            .runAction(resource, undo.action, {
                selection: { ids: undo.items },
                values: undo.params ?? {},
            })
            .then(async (response) => {
                if (response.run !== undefined) {
                    follow(resource, undoTarget, response.run);
                    return;
                }
                await onResult?.(response.result, { resource, target: undoTarget });
                const subject = subjectOf(resource, target, undo.items.length);
                toasts.show(
                    {
                        title:
                            subject !== null
                                ? intl.formatMessage(messages.undoneFor, {
                                      action: label,
                                      subject,
                                  })
                                : intl.formatMessage(messages.undone, { action: label }),
                    },
                    key,
                );
            })
            .catch((error: unknown) => {
                toasts.show(
                    {
                        title: intl.formatMessage(messages.undoFailed, { action: label }),
                        ...(error instanceof Error && error.message !== ''
                            ? { description: error.message }
                            : {}),
                        tone: 'danger',
                    },
                    key,
                );
            });
    };

    // No toast when a run starts: the runs button of the shell shows it, and its popover follows
    // it. The toast comes when the run ends.
    const follow = (resource: string, target: ActionTarget, run: ActionRun) => {
        setRuns((current) => [
            ...current.filter((entry) => entry.run.id !== run.id),
            { run, resource, target },
        ]);
    };

    const ended = async (entry: FollowedRun) => {
        const { run, resource, target } = entry;
        if (notified.current.has(run.id)) {
            return;
        }
        notified.current.add(run.id);
        if (run.result !== undefined) {
            await finish(resource, target, run.result, { queued: true });
            return;
        }
        const action = getActionLabel(target.action, intl);
        const subject = subjectOf(resource, target);
        const key = { key: toastKey(resource, target) };
        if (run.status === 'cancelled') {
            toasts.show(
                {
                    title:
                        subject !== null
                            ? intl.formatMessage(messages.cancelledFor, { action, subject })
                            : intl.formatMessage(messages.cancelled, { action }),
                },
                key,
            );
        } else if (run.status === 'failed') {
            toasts.show(
                {
                    title:
                        subject !== null
                            ? intl.formatMessage(messages.failedFor, { action, subject })
                            : intl.formatMessage(messages.failed, { action }),
                    tone: 'danger',
                },
                key,
            );
        } else if (watchers.current === 0) {
            toasts.show(
                {
                    title:
                        subject !== null
                            ? intl.formatMessage(messages.doneFor, { action, subject })
                            : intl.formatMessage(messages.done, { action }),
                    tone: 'success',
                },
                key,
            );
        }
    };

    const execute = async (
        resource: string,
        target: ActionTarget,
        values: Record<string, unknown> = {},
    ): Promise<ActionOutcome> => {
        const response = await adapter.runAction(
            resource,
            target.action.id,
            buildActionRequest(target, values),
        );
        if (response.run !== undefined) {
            follow(resource, target, response.run);
            return { status: 'queued', run: response.run };
        }
        await finish(resource, target, response.result);
        return { status: 'done', result: response.result };
    };

    const run = (resource: string, target: ActionTarget): Promise<ActionOutcome | false> => {
        const { action } = target;
        if (action.kind === 'link') {
            const to = getLinkTarget(target);
            if (to === null) {
                return Promise.reject(new Error(`The action "${action.id}" has no URL or route.`));
            }
            onNavigate(to);
            return Promise.resolve({ status: 'navigated', to });
        }
        if (action.kind === 'client') {
            const name = action.component ?? '';
            const Handler =
                (clientActions !== undefined && Object.hasOwn(clientActions, name)
                    ? clientActions[name]
                    : undefined) ?? (plugins.actions.get(name) as ClientActionHandler | undefined);
            if (Handler === undefined) {
                return Promise.reject(
                    new Error(`No handler for the client action "${action.id}" (${name}).`),
                );
            }
            return new Promise((resolve) => setClient({ resource, target, resolve, Handler }));
        }
        if ((action.fields ?? []).length > 0) {
            return new Promise((resolve) => setParameters({ resource, target, resolve }));
        }
        return execute(resource, target);
    };

    const cancelRun = async (id: string) => {
        if (adapter.cancelActionRun === undefined) {
            throw new Error('The adapter cannot cancel runs.');
        }
        await adapter.cancelActionRun(id);
        const updated = await adapter.getActionRun(id);
        setRuns((current) =>
            current.map((entry) => (entry.run.id === id ? { ...entry, run: updated } : entry)),
        );
        const entry = runs.find((candidate) => candidate.run.id === id);
        if (entry !== undefined && isFinished(updated.status)) {
            await ended({ ...entry, run: updated });
        }
    };

    const dismissRun = (id: string) =>
        setRuns((current) => current.filter((entry) => entry.run.id !== id));

    const onRunEnded = useEffectEvent((entry: FollowedRun) => ended(entry));

    // Checks the unfinished runs, one interval after the last change of the runs.
    useEffect(() => {
        const active = runs.filter((entry) => !isFinished(entry.run.status));
        if (active.length === 0) {
            return undefined;
        }
        let stopped = false;
        const timer = setTimeout(() => {
            void Promise.all(
                active.map(async (entry) => {
                    try {
                        const next = await adapter.getActionRun(entry.run.id);
                        if (stopped) {
                            return;
                        }
                        setRuns((current) =>
                            current.map((candidate) =>
                                candidate.run.id === next.id
                                    ? { ...candidate, run: next }
                                    : candidate,
                            ),
                        );
                        if (isFinished(next.status)) {
                            await onRunEnded({ ...entry, run: next });
                        }
                    } catch {
                        // Checked again at the next interval.
                        if (!stopped) {
                            setRuns((current) => [...current]);
                        }
                    }
                }),
            );
        }, pollInterval);
        return () => {
            stopped = true;
            clearTimeout(timer);
        };
    }, [runs, adapter, pollInterval]);

    const watchRuns = () => {
        watchers.current += 1;
        return () => {
            watchers.current -= 1;
        };
    };

    const value: ActionRunnerContextValue = {
        adapter,
        run,
        runs,
        cancelRun,
        dismissRun,
        watchRuns,
    };

    const ClientHandler = client?.Handler;
    return (
        <ActionRunnerContext value={value}>
            {children}
            {parameters !== null ? (
                <ParametersDialog
                    action={parameters.target.action}
                    count={parameters.target.count}
                    locales={locales}
                    onSubmit={(values) => execute(parameters.resource, parameters.target, values)}
                    onDone={(outcome) => {
                        setParameters(null);
                        parameters.resolve(outcome);
                    }}
                    onCancel={() => {
                        setParameters(null);
                        parameters.resolve(false);
                    }}
                />
            ) : null}
            {client !== null && ClientHandler !== undefined ? (
                <ClientHandler
                    action={client.target.action}
                    resource={client.resource}
                    target={client.target}
                    onDone={(result) => {
                        setClient(null);
                        if (result === undefined) {
                            client.resolve({ status: 'done', result: {} });
                            return;
                        }
                        void finish(client.resource, client.target, result).then(() =>
                            client.resolve({ status: 'done', result }),
                        );
                    }}
                    onCancel={() => {
                        setClient(null);
                        client.resolve(false);
                    }}
                />
            ) : null}
            {details !== null ? (
                <ResultsDialog
                    label={details.label}
                    result={details.result}
                    onClose={() => setDetails(null)}
                />
            ) : null}
        </ActionRunnerContext>
    );
}
