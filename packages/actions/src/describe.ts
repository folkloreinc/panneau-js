import type { IntlShape } from 'react-intl';

import type { ActionItemResult, ActionResult, Item, Resource } from '@panneau/protocol';
import type { ToastContent } from '@panneau/ui';

import { messages } from './messages';
import { getResultCounts } from './request';
import type { ActionTarget } from './types';

/**
 * The title of an item: the value of the resource's `itemTitle` field, in the locale when it is
 * localized. `null` without one.
 */
export function getItemTitle(
    item: Partial<Item> | undefined,
    itemTitle: string | undefined,
    locale: string,
): string | null {
    const value = itemTitle !== undefined ? item?.[itemTitle] : undefined;
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object') {
        const localized = (value as Record<string, unknown>)[locale];
        const first = localized ?? Object.values(value)[0];
        return typeof first === 'string' ? first : null;
    }
    return null;
}

/**
 * What an action applied to, for its toast: the item by its title ("“Spring contest”"), or the
 * count of items with the resource's labels ("3 entries"). `null` when there is nothing to name:
 * an item without a title, a selection without a count, or a resource the definition doesn't
 * have.
 */
export function describeSubject(
    target: ActionTarget,
    resource: Pick<Resource, 'label' | 'itemTitle'> | undefined,
    intl: IntlShape,
    count: number | null = null,
): string | null {
    if (target.scope === 'item' || target.item !== undefined) {
        const title = getItemTitle(
            target.item as Partial<Item> | undefined,
            resource?.itemTitle,
            intl.locale,
        );
        return title !== null && title !== ''
            ? intl.formatMessage(messages.subjectItem, { title })
            : null;
    }
    const total = count ?? target.count ?? null;
    if (resource === undefined || total === null) {
        return null;
    }
    return intl.formatMessage(messages.subjectCount, {
        count: total,
        singular: resource.label.singular,
        plural: resource.label.plural,
    });
}

/** Whether an item of a result was skipped because something else uses it (`in_use`). */
export function isInUse(entry: ActionItemResult): boolean {
    return entry.status === 'skipped' && entry.reason === 'in_use';
}

/**
 * What the toast says of the items skipped as `in_use`: the item by its title when it is the only
 * one and `itemTitle` is known, or their count. `null` when there are none.
 */
function describeInUse(count: number, intl: IntlShape, itemTitle: string | null): string | null {
    if (count === 0) {
        return null;
    }
    return count === 1 && itemTitle !== null && itemTitle !== ''
        ? intl.formatMessage(messages.inUseItem, { title: itemTitle })
        : intl.formatMessage(messages.inUseCount, { count });
}

/**
 * The toast of a result: its message, or "done" with what it was done to (`subject`), the counts,
 * and a tone that says how it went. Items skipped as `in_use` are explained, by the title of the
 * item (`itemTitle`) when it is the only one: when every item is, that is the title of the toast.
 */
export function describeResult(
    result: ActionResult,
    actionLabel: string,
    intl: IntlShape,
    subject: string | null = null,
    itemTitle: string | null = null,
): Omit<ToastContent, 'action'> {
    const { succeeded, failed, skipped } = getResultCounts(result);
    const inUse = Math.min(skipped, (result.results ?? []).filter(isInUse).length);
    const inUseText = describeInUse(inUse, intl, itemTitle);
    if (inUseText !== null && (succeeded ?? 0) === 0 && failed === 0 && skipped === inUse) {
        // Nothing was done: the toast says why.
        return { title: inUseText, tone: 'warning' };
    }
    const parts = [
        ...(succeeded !== null && (failed > 0 || skipped > 0)
            ? [intl.formatMessage(messages.succeededCount, { count: succeeded })]
            : []),
        ...(failed > 0 ? [intl.formatMessage(messages.failedCount, { count: failed })] : []),
        ...(skipped > inUse
            ? [intl.formatMessage(messages.skippedCount, { count: skipped - inUse })]
            : []),
    ];
    const description = [
        ...(parts.length > 0 ? [intl.formatList(parts, { type: 'unit' })] : []),
        ...(inUseText !== null ? [inUseText] : []),
    ].join('. ');
    const tone: ToastContent['tone'] =
        failed > 0 ? (succeeded === 0 ? 'danger' : 'warning') : skipped > 0 ? 'warning' : 'success';
    return {
        title:
            result.message !== undefined && result.message !== ''
                ? result.message
                : subject !== null
                  ? intl.formatMessage(messages.doneFor, { action: actionLabel, subject })
                  : intl.formatMessage(messages.done, { action: actionLabel }),
        ...(description !== '' ? { description } : {}),
        tone,
    };
}

/**
 * Why an item didn't succeed: its message, or its reason (`forbidden`, `not_found`, `unchanged`,
 * `in_use`).
 */
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
        case 'in_use':
            return intl.formatMessage(messages.reasonInUse);
        default:
            return intl.formatMessage(
                entry.status === 'failed' ? messages.statusFailed : messages.statusSkipped,
            );
    }
}
