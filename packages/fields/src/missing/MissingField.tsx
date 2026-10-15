import { usePanneauIntl } from '@panneau/ui';

import { cx } from '../shared/cx';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import styles from './MissingField.module.css';

/**
 * The slot of a field type that no plugin provides, such as `richtext` and `media` until Phase 2:
 * it keeps the field's place in the form and names the missing type. The value is left as is.
 */
export function MissingFieldEntry({ field, className }: FieldEntryProps) {
    const intl = usePanneauIntl();
    return (
        <div className={cx(styles.missing, className)} data-field-type={field.type}>
            {field.label !== undefined ? <span className={styles.label}>{field.label}</span> : null}
            <p className={styles.notice} role="note">
                {intl.formatMessage(messages.missingPlugin, { type: field.type })}
            </p>
        </div>
    );
}
