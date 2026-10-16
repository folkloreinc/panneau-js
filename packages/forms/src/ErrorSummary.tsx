import type { Ref } from 'react';

import type { Field } from '@panneau/protocol';
import { Alert, usePanneauIntl } from '@panneau/ui';

import styles from './Form.module.css';
import { describePath } from './describe';
import { messages } from './messages';

export interface ErrorSummaryProps {
    /** Errors by dot path, in the order to list them. */
    errors: Record<string, string[]>;
    /** The fields of the form, for the names of the paths. */
    fields: readonly Field[];
    /** Called with a path when its link is pressed. */
    onSelect: (path: string) => void;
    ref?: Ref<HTMLDivElement>;
    className?: string;
}

/**
 * The errors of a form, listed at the top after a failed submit: each one links to its field.
 * Assistive technologies announce it when it appears.
 */
export function ErrorSummary({ errors, fields, onSelect, ref, className }: ErrorSummaryProps) {
    const intl = usePanneauIntl();
    const entries = Object.entries(errors).filter(([, list]) => list.length > 0);
    if (entries.length === 0) {
        return null;
    }
    return (
        <Alert
            ref={ref}
            tone="danger"
            role="alert"
            tabIndex={-1}
            className={className ?? styles.summary}
            title={intl.formatMessage(messages.summaryTitle, { count: entries.length })}
        >
            <ul className={styles.summaryList}>
                {entries.map(([path, list]) => {
                    const name = describePath(fields, path);
                    return (
                        <li key={path}>
                            <button
                                type="button"
                                className={styles.summaryLink}
                                onClick={() => onSelect(path)}
                            >
                                {name}
                            </button>
                            {`: ${list.join(' ')}`}
                        </li>
                    );
                })}
            </ul>
        </Alert>
    );
}
