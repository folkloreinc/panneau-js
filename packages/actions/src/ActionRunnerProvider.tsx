import { type ReactNode, useEffect, useEffectEvent, useRef, useState } from 'react';

import { usePlugins } from '@panneau/core';
import type { ActionResult, ActionRun, RouteReference } from '@panneau/protocol';
import { usePanneauIntl, useToast } from '@panneau/ui';

import { ParametersDialog } from './ParametersDialog';
import { ResultsDialog } from './ResultsDialog';
import { ActionRunnerContext, type ActionRunnerContextValue } from './context';
import { describeResult } from './describe';
import { messages } from './messages';
import { buildActionRequest, getLinkTarget, isFinished } from './request';
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
    const plugins = usePlugins();
    const [parameters, setParameters] = useState<Pending | null>(null);
    const [client, setClient] = useState<ClientPending | null>(null);
    const [details, setDetails] = useState<{ label: string; result: ActionResult } | null>(null);
    const [runs, setRuns] = useState<readonly FollowedRun[]>([]);
    // Runs whose end was already shown, so that a late poll doesn't show it twice.
    const notified = useRef(new Set<string>());

    const finish = async (resource: string, target: ActionTarget, result: ActionResult) => {
        await onResult?.(result, { resource, target });
        const content = describeResult(result, target.action.label, intl);
        const hasDetails = (result.results ?? []).length > 0;
        const download = result.download ?? null;
        if (download !== null) {
            onDownload(download);
        }
        toasts.show({
            ...content,
            ...(hasDetails
                ? {
                      action: {
                          label: intl.formatMessage(messages.details),
                          onAction: () => setDetails({ label: target.action.label, result }),
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
        });
        const redirect = result.redirect ?? null;
        if (redirect !== null) {
            onNavigate(redirect);
        }
    };

    const follow = (resource: string, target: ActionTarget, run: ActionRun) => {
        setRuns((current) => [
            ...current.filter((entry) => entry.run.id !== run.id),
            { run, resource, target },
        ]);
        toasts.show({
            title: intl.formatMessage(messages.queued, { action: target.action.label }),
            description: intl.formatMessage(messages.queuedDescription),
            tone: 'info',
        });
    };

    const ended = async (entry: FollowedRun) => {
        const { run, resource, target } = entry;
        if (notified.current.has(run.id)) {
            return;
        }
        notified.current.add(run.id);
        if (run.result !== undefined) {
            await finish(resource, target, run.result);
        } else if (run.status === 'cancelled') {
            toasts.show({
                title: intl.formatMessage(messages.cancelled, { action: target.action.label }),
            });
        } else if (run.status === 'failed') {
            toasts.show({
                title: intl.formatMessage(messages.failed, { action: target.action.label }),
                tone: 'danger',
            });
        } else {
            toasts.show({
                title: intl.formatMessage(messages.done, { action: target.action.label }),
                tone: 'success',
            });
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

    const value: ActionRunnerContextValue = { adapter, run, runs, cancelRun, dismissRun };

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
