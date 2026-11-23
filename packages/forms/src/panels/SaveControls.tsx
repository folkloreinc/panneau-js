import { CircleCheck } from 'lucide-react';
import { type ReactNode, createContext, useId } from 'react';

import type { Field } from '@panneau/protocol';
import { Button, Icon, Tooltip, isApplePlatform, usePanneauIntl } from '@panneau/ui';

import styles from '../Form.module.css';
import { cx } from '../cx';
import { messages } from '../messages';

export interface SaveState {
    /** What the status says: the failure of the last save, unsaved changes, or "Saved". */
    status: 'error' | 'unsaved' | 'saved' | null;
    isSubmitting: boolean;
    /**
     * Whether the form has something to save. An update without changes has none: its button is
     * disabled, and says why.
     */
    canSave: boolean;
    /** The form's `actions`, next to its button. */
    actions: ReactNode;
    /** The label of the submit button, or `null` without one. */
    submitLabel: ReactNode;
}

export interface SummaryState {
    /** Errors by path, in the order of their fields, after a failed save. Empty otherwise. */
    errors: Record<string, string[]>;
    fields: readonly Field[];
    onSelect: (path: string) => void;
}

/** What the `save` panel shows, from its `FormView` (decision 0075). */
export const SaveContext = createContext<SaveState | null>(null);

/** What the `errors` panel shows, from its `FormView` (decision 0075). */
export const SummaryContext = createContext<SummaryState | null>(null);

/**
 * The status of a form, its actions and its Save button: in its footer, or in the `save` panel of
 * its sidebar.
 */
export function SaveControls({ status, isSubmitting, canSave, actions, submitLabel }: SaveState) {
    const intl = usePanneauIntl();
    const apple = isApplePlatform();
    const modifier = apple ? '⌘' : 'Ctrl';
    const reasonId = useId();
    return (
        <>
            <span
                className={cx(styles.status, status === 'error' && styles.statusError)}
                role="status"
            >
                {status !== null ? (
                    // Keyed by the status: each new one comes in with a short fade (decision 0081).
                    <span key={status} className={styles.statusText}>
                        {status === 'error' ? (
                            intl.formatMessage(messages.saveFailed)
                        ) : status === 'unsaved' ? (
                            intl.formatMessage(messages.unsaved)
                        ) : (
                            <>
                                <Icon icon={CircleCheck} />
                                {intl.formatMessage(messages.saved)}
                            </>
                        )}
                    </span>
                ) : null}
            </span>
            {actions}
            {submitLabel !== null ? (
                <Tooltip
                    content={
                        canSave
                            ? intl.formatMessage(messages.saveShortcut, { modifier })
                            : intl.formatMessage(messages.nothingToSave)
                    }
                >
                    <Button
                        type="submit"
                        tone="accent"
                        isPending={isSubmitting}
                        aria-keyshortcuts={apple ? 'Meta+S Meta+Enter' : 'Control+S Control+Enter'}
                        aria-describedby={canSave ? undefined : reasonId}
                        // Disabled as a pending button is: it keeps its place in the tab order, and
                        // assistive technologies say why. Submitting it sends nothing (`FormView`).
                        render={
                            canSave
                                ? undefined
                                : (props) => (
                                      <button {...props} aria-disabled="true" data-disabled="" />
                                  )
                        }
                    >
                        {submitLabel ?? intl.formatMessage(messages.save)}
                    </Button>
                </Tooltip>
            ) : null}
            {submitLabel !== null && !canSave ? (
                <span id={reasonId} hidden>
                    {intl.formatMessage(messages.nothingToSave)}
                </span>
            ) : null}
        </>
    );
}
