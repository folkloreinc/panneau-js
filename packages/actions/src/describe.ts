import type { IntlShape } from 'react-intl';

import type { ActionItemResult, ActionResult } from '@panneau/protocol';
import type { ToastContent } from '@panneau/ui';

import { messages } from './messages';
import { getResultCounts } from './request';

/** The toast of a result: its message, or "done", the counts, and a tone that says how it went. */
export function describeResult(
    result: ActionResult,
    actionLabel: string,
    intl: IntlShape,
): Omit<ToastContent, 'action'> {
    const { succeeded, failed, skipped } = getResultCounts(result);
    const parts = [
        ...(succeeded !== null && (failed > 0 || skipped > 0)
            ? [intl.formatMessage(messages.succeededCount, { count: succeeded })]
            : []),
        ...(failed > 0 ? [intl.formatMessage(messages.failedCount, { count: failed })] : []),
        ...(skipped > 0 ? [intl.formatMessage(messages.skippedCount, { count: skipped })] : []),
    ];
    const tone: ToastContent['tone'] =
        failed > 0 ? (succeeded === 0 ? 'danger' : 'warning') : skipped > 0 ? 'warning' : 'success';
    return {
        title:
            result.message !== undefined && result.message !== ''
                ? result.message
                : intl.formatMessage(messages.done, { action: actionLabel }),
        ...(parts.length > 0 ? { description: intl.formatList(parts, { type: 'unit' }) } : {}),
        tone,
    };
}

/** Why an item didn't succeed: its message, or its reason (`forbidden`, `not_found`, `unchanged`). */
export function describeItemResult(entry: ActionItemResult, intl: IntlShape): string {
    if (entry.message !== undefined && entry.message !== '') {
        return entry.message;
    }
    switch (entry.reason) {
        case 'forbidden':
            return intl.formatMessage(messages.reasonForbidden);
        case 'not_found':
            return intl.formatMessage(messages.reasonNotFound);
        case 'unchanged':
            return intl.formatMessage(messages.reasonUnchanged);
        default:
            return intl.formatMessage(
                entry.status === 'failed' ? messages.statusFailed : messages.statusSkipped,
            );
    }
}
