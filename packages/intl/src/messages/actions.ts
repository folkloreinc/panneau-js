import { defineMessage } from '../message';

/**
 * The messages of `@panneau/actions`, with their English text, which is also the default one.
 * French is in `../fr/actions.ts`.
 */
export const actionsMessages = {
    cancel: defineMessage({ id: 'panneau.actions.cancel', defaultMessage: 'Cancel' }),
    /** The labels of the built-in item actions, which backends don't label (decision 0040). */
    show: defineMessage({ id: 'panneau.actions.show', defaultMessage: 'View' }),
    edit: defineMessage({ id: 'panneau.actions.edit', defaultMessage: 'Edit' }),
    duplicate: defineMessage({ id: 'panneau.actions.duplicate', defaultMessage: 'Duplicate' }),
    delete: defineMessage({ id: 'panneau.actions.delete', defaultMessage: 'Delete' }),
    duplicated: defineMessage<{ title: string }>({
        id: 'panneau.actions.duplicated',
        defaultMessage: '“{title}” is duplicated.',
    }),
    done: defineMessage<{ action: string }>({
        id: 'panneau.actions.done',
        defaultMessage: '“{action}” is done.',
    }),
    doneFor: defineMessage<{ action: string; subject: string }>({
        id: 'panneau.actions.doneFor',
        defaultMessage: '“{action}” is done for {subject}.',
    }),
    failedFor: defineMessage<{ action: string; subject: string }>({
        id: 'panneau.actions.failedFor',
        defaultMessage: '“{action}” failed for {subject}.',
    }),
    cancelledFor: defineMessage<{ action: string; subject: string }>({
        id: 'panneau.actions.cancelledFor',
        defaultMessage: '“{action}” was cancelled for {subject}.',
    }),
    /** The button of a toast that undoes what was done (decision 0063). */
    undo: defineMessage({ id: 'panneau.actions.undo', defaultMessage: 'Undo' }),
    undone: defineMessage<{ action: string }>({
        id: 'panneau.actions.undone',
        defaultMessage: '“{action}” is undone.',
    }),
    undoneFor: defineMessage<{ action: string; subject: string }>({
        id: 'panneau.actions.undoneFor',
        defaultMessage: '“{action}” is undone for {subject}.',
    }),
    undoFailed: defineMessage<{ action: string }>({
        id: 'panneau.actions.undoFailed',
        defaultMessage: '“{action}” could not be undone.',
    }),
    /** What an action applied to, in its toast: one item by its title. */
    subjectItem: defineMessage<{ title: string }>({
        id: 'panneau.actions.subjectItem',
        defaultMessage: '“{title}”',
    }),
    /** What an action applied to, in its toast: a count of items, with the resource's labels. */
    subjectCount: defineMessage<{ count: number; singular: string; plural: string }>({
        id: 'panneau.actions.subjectCount',
        defaultMessage: '{count, plural, one {# {singular}} other {# {plural}}}',
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
