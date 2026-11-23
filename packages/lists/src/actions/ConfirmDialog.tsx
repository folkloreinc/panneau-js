import { Suspense, lazy } from 'react';

import { asksConfirmation } from '@panneau/core';

import type { ListActionEvent, ListActionPreview } from '../types';

// The dialog loads when a confirmation first opens: lists and the header of an item render
// `ConfirmDialog` on every page, closed, and the first page doesn't need its code (#346).
const ConfirmDialogContent = lazy(async () => ({
    default: (await import('./ConfirmDialogContent')).ConfirmDialogContent,
}));

/**
 * Whether an action needs a confirmation: it asks for one, or it is undoable but runs on more items
 * than an undo can put back (`asksConfirmation()`, decision 0063), or some selected items are
 * skipped.
 */
export function needsConfirmation(event: ListActionEvent): boolean {
    return asksConfirmation(event.action, event.count) || event.skipped.length > 0;
}

/** The dry run of a query selection: in progress, or done with the backend's count. */
export type ConfirmPreview = { status: 'loading' } | ({ status: 'done' } & ListActionPreview);

export interface ConfirmDialogProps {
    /** The action to confirm, or `null` when the dialog is closed. */
    event: ListActionEvent | null;
    /**
     * What the backend told about a query selection. Its count of skipped items replaces the
     * count of the current page; while it loads, the dialog says so and can't be confirmed.
     */
    preview?: ConfirmPreview | null;
    /**
     * The label of the item of an `item` action (its title), to name it: "Delete “Spring
     * contest”?". Without it, the dialog counts items.
     */
    itemLabel?: string | undefined;
    /**
     * The labels of the items' resource, to name what a selection holds: "Delete 3 articles?".
     * Without them, the dialog counts items.
     */
    labels?: { readonly singular: string; readonly plural: string } | undefined;
    onConfirm: (event: ListActionEvent) => void;
    onCancel: () => void;
}

/**
 * Asks before running an action (decision 0017): the action's `confirm` title and message (an ICU
 * message with `{count}`), or default ones that name the item (`itemLabel`) or the items of a
 * selection (`labels`), and how many selected items will be skipped: those of the current page that
 * don't allow it, or the backend's count for every item matching a query. It opens with the focus
 * on "Cancel" for a destructive action, and on the confirming button otherwise (decision 0095).
 * Its code loads when it first opens.
 */
export function ConfirmDialog({ event, ...props }: ConfirmDialogProps) {
    if (event === null) {
        return null;
    }
    return (
        <Suspense fallback={null}>
            <ConfirmDialogContent event={event} {...props} />
        </Suspense>
    );
}
