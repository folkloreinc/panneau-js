import { defineMessage } from '../message';

/**
 * The messages of `@panneau/actions`, with their English text, which is also the default one.
 * French is in `../fr/actions.ts`.
 */
export const actionsMessages = {
    cancel: defineMessage({ id: 'panneau.actions.cancel', defaultMessage: 'Cancel' }),
    done: defineMessage<{ action: string }>({
        id: 'panneau.actions.done',
        defaultMessage: '“{action}” is done.',
    }),
    failed: defineMessage<{ action: string }>({
        id: 'panneau.actions.failed',
        defaultMessage: '“{action}” failed.',
    }),
    cancelled: defineMessage<{ action: string }>({
        id: 'panneau.actions.cancelled',
        defaultMessage: '“{action}” was cancelled.',
    }),
    succeededCount: defineMessage<{ count: number }>({
        id: 'panneau.actions.succeededCount',
        defaultMessage: '{count, plural, one {# item done} other {# items done}}',
    }),
    failedCount: defineMessage<{ count: number }>({
        id: 'panneau.actions.failedCount',
        defaultMessage: '{count, plural, one {# failed} other {# failed}}',
    }),
    skippedCount: defineMessage<{ count: number }>({
        id: 'panneau.actions.skippedCount',
        defaultMessage: '{count, plural, one {# skipped} other {# skipped}}',
    }),
    details: defineMessage({ id: 'panneau.actions.details', defaultMessage: 'Details' }),
    download: defineMessage({ id: 'panneau.actions.download', defaultMessage: 'Download' }),
    resultsTitle: defineMessage<{ action: string }>({
        id: 'panneau.actions.resultsTitle',
        defaultMessage: '“{action}”: items not done',
    }),
    close: defineMessage({ id: 'panneau.actions.close', defaultMessage: 'Close' }),
    item: defineMessage<{ id: string }>({
        id: 'panneau.actions.item',
        defaultMessage: 'Item {id}',
    }),
    statusFailed: defineMessage({ id: 'panneau.actions.statusFailed', defaultMessage: 'Failed' }),
    statusSkipped: defineMessage({
        id: 'panneau.actions.statusSkipped',
        defaultMessage: 'Skipped',
    }),
    reasonForbidden: defineMessage({
        id: 'panneau.actions.reasonForbidden',
        defaultMessage: 'Not allowed',
    }),
    reasonNotFound: defineMessage({
        id: 'panneau.actions.reasonNotFound',
        defaultMessage: 'Not found',
    }),
    reasonUnchanged: defineMessage({
        id: 'panneau.actions.reasonUnchanged',
        defaultMessage: 'Unchanged',
    }),
    queued: defineMessage<{ action: string }>({
        id: 'panneau.actions.queued',
        defaultMessage: '“{action}” is running in the background.',
    }),
    queuedDescription: defineMessage({
        id: 'panneau.actions.queuedDescription',
        defaultMessage: 'You will be notified when it ends.',
    }),
    runs: defineMessage({ id: 'panneau.actions.runs', defaultMessage: 'Actions in progress' }),
    progress: defineMessage<{ progress: number; total: number }>({
        id: 'panneau.actions.progress',
        defaultMessage: '{progress, number} of {total, number}',
    }),
    runQueued: defineMessage({ id: 'panneau.actions.runQueued', defaultMessage: 'Waiting' }),
    runRunning: defineMessage({ id: 'panneau.actions.runRunning', defaultMessage: 'Running' }),
    runSucceeded: defineMessage({ id: 'panneau.actions.runSucceeded', defaultMessage: 'Done' }),
    runPartial: defineMessage({
        id: 'panneau.actions.runPartial',
        defaultMessage: 'Done, with errors',
    }),
    runFailed: defineMessage({ id: 'panneau.actions.runFailed', defaultMessage: 'Failed' }),
    runCancelled: defineMessage({
        id: 'panneau.actions.runCancelled',
        defaultMessage: 'Cancelled',
    }),
    cancelRun: defineMessage<{ action: string }>({
        id: 'panneau.actions.cancelRun',
        defaultMessage: 'Cancel “{action}”',
    }),
    dismissRun: defineMessage<{ action: string }>({
        id: 'panneau.actions.dismissRun',
        defaultMessage: 'Dismiss “{action}”',
    }),
};
