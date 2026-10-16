import { getItemValues, isEqual } from '@panneau/core';
import type { Field, Item } from '@panneau/protocol';
import { Button, Dialog, usePanneauIntl } from '@panneau/ui';

import styles from './ConflictDialog.module.css';
import { messages } from './messages';

export interface ConflictDialogProps {
    isOpen: boolean;
    /** The fields of the form, for their labels. */
    fields: readonly Field[];
    /** The values in the form. */
    values: Record<string, unknown>;
    /** The current item, as the backend sent it with the `412`. */
    current: Item | null;
    /** Drops the local changes and continues from the current item. */
    onReload: () => void;
    /** Saves the local values over the current version. */
    onOverwrite: () => void;
    isPending?: boolean;
    className?: string;
}

type Formatter = (value: unknown, field?: Field) => string;

function useFormatValue(): Formatter {
    const intl = usePanneauIntl();
    const format: Formatter = (value, field) => {
        const options = field?.options;
        if (options !== undefined) {
            const labels = (Array.isArray(value) ? value : [value]).map(
                (entry: unknown) =>
                    options.find((option) => option.value === entry)?.label ?? entry,
            );
            if (value !== null && value !== undefined) {
                return labels.map((label) => format(label)).join(', ');
            }
        }
        if (value === null || value === undefined || value === '') {
            return intl.formatMessage(messages.empty);
        }
        if (typeof value === 'boolean') {
            return intl.formatMessage(value ? messages.yes : messages.no);
        }
        if (typeof value === 'string' || typeof value === 'number') {
            const text = String(value);
            return text.length > 120 ? `${text.slice(0, 117)}…` : text;
        }
        if (Array.isArray(value)) {
            const labels = value.map((entry: unknown) =>
                entry !== null && typeof entry === 'object' && 'label' in entry
                    ? String((entry as { label: unknown }).label)
                    : null,
            );
            return labels.every((label) => label !== null)
                ? labels.join(', ')
                : intl.formatMessage(messages.itemCount, { count: value.length });
        }
        if (typeof value === 'object') {
            const record = value as Record<string, unknown>;
            if (typeof record.label === 'string') {
                return record.label;
            }
            return Object.entries(record)
                .map(([key, entry]) => `${key}: ${format(entry)}`)
                .join(' · ');
        }
        return String(value);
    };
    return format;
}

/**
 * The dialog of a version conflict (decision 0008): someone else saved the item since the form
 * loaded it. It shows the values that differ, and lets the user load the current version or save
 * theirs over it.
 */
export function ConflictDialog({
    isOpen,
    fields,
    values,
    current,
    onReload,
    onOverwrite,
    isPending = false,
    className,
}: ConflictDialogProps) {
    const intl = usePanneauIntl();
    const format = useFormatValue();
    const theirs =
        current !== null
            ? getItemValues(
                  current,
                  fields.map((field) => field.name),
              )
            : null;
    const changed =
        theirs !== null
            ? fields.filter(
                  (field) => !isEqual(values[field.name] ?? null, theirs[field.name] ?? null),
              )
            : [];
    return (
        <Dialog
            isOpen={isOpen}
            role="alertdialog"
            isDismissable={false}
            isKeyboardDismissDisabled
            title={intl.formatMessage(messages.conflictTitle)}
            size="lg"
            className={className}
            footer={
                <>
                    <Button onPress={onReload} isDisabled={isPending}>
                        {intl.formatMessage(messages.loadCurrent)}
                    </Button>
                    <Button variant="danger" onPress={onOverwrite} isPending={isPending}>
                        {intl.formatMessage(messages.overwrite)}
                    </Button>
                </>
            }
        >
            <div className={styles.body}>
                <p>{intl.formatMessage(messages.conflictMessage)}</p>
                {theirs === null ? (
                    <p className={styles.muted}>{intl.formatMessage(messages.conflictUnknown)}</p>
                ) : changed.length > 0 ? (
                    <section aria-labelledby="panneau-conflict-changes">
                        <h3 id="panneau-conflict-changes" className={styles.heading}>
                            {intl.formatMessage(messages.conflictChanges)}
                        </h3>
                        <dl className={styles.changes}>
                            {changed.map((field) => (
                                <div key={field.name} className={styles.change}>
                                    <dt className={styles.label}>{field.label ?? field.name}</dt>
                                    <dd className={styles.version}>
                                        <span className={styles.which}>
                                            {intl.formatMessage(messages.yours)}
                                        </span>
                                        {format(values[field.name], field)}
                                    </dd>
                                    <dd className={styles.version}>
                                        <span className={styles.which}>
                                            {intl.formatMessage(messages.current)}
                                        </span>
                                        {format(theirs[field.name], field)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ) : null}
            </div>
        </Dialog>
    );
}
