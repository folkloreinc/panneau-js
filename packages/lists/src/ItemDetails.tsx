import { LoadingRegion, Skeleton, usePanneauIntl } from '@panneau/ui';

import styles from './ItemDetails.module.css';
import { cx } from './cx';
import { messages } from './messages';
import type { DisplayEntry, ListColumn, ListItem } from './types';
import { useRenderValue } from './useRenderValue';
import { getColumnValue } from './values';

/** Widths of the values of a skeleton, varied so they read as text. */
const WIDTHS = ['70%', '40%', '55%', '30%', '65%'];

/** A value of the details, or a group of values under its label. */
export interface ItemDetailsColumn extends ListColumn {
    /**
     * The values of a group (a `group` field): read in the value of the column, an object, and
     * listed under its label.
     */
    columns?: readonly ItemDetailsColumn[];
}

export interface ItemDetailsProps {
    /** The item. `undefined` while it loads: the labels, with a skeleton of each value. */
    item: ListItem | undefined;
    /** The values to show, with their label and display, in order. */
    columns: readonly ItemDetailsColumn[];
    /** Displays by name, over the built-in ones and those of the plugins. */
    displays?: Readonly<Record<string, DisplayEntry>>;
    'aria-label'?: string;
    className?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * The values of one item, each with its label, shown with the displays of the lists: for the
 * details of an item next to its list, or anywhere a read-only view of it is needed. A column with
 * `columns` is a group, whose values are listed under its label. While the item loads, it draws
 * the labels with a skeleton of each value (decision 0034).
 */
export function ItemDetails({
    item,
    columns,
    displays,
    'aria-label': ariaLabel,
    className,
}: ItemDetailsProps) {
    const intl = usePanneauIntl();
    const renderValue = useRenderValue(displays);
    const renderEntries = (
        entryItem: ListItem | undefined,
        entryColumns: readonly ItemDetailsColumn[],
    ) =>
        entryColumns.map((column, index) => {
            const label = <dt className={styles.label}>{column.label ?? column.id}</dt>;
            if (column.columns !== undefined) {
                // The values of a group are those of an item made of the value of the column.
                const value =
                    entryItem !== undefined
                        ? getColumnValue(entryItem, column, intl.locale)
                        : undefined;
                const groupItem =
                    entryItem !== undefined
                        ? { ...(isRecord(value) ? value : {}), id: entryItem.id }
                        : undefined;
                return (
                    <div key={column.id} className={cx(styles.entry, styles.group)}>
                        {label}
                        <dd className={styles.value}>
                            <dl className={cx(styles.details, styles.nested)}>
                                {renderEntries(groupItem, column.columns)}
                            </dl>
                        </dd>
                    </div>
                );
            }
            return (
                <div key={column.id} className={styles.entry}>
                    {label}
                    <dd className={styles.value}>
                        {entryItem !== undefined ? (
                            renderValue(entryItem, column)
                        ) : (
                            <Skeleton width={WIDTHS[index % WIDTHS.length]} />
                        )}
                    </dd>
                </div>
            );
        });
    const details = (
        <dl aria-label={ariaLabel} className={cx(styles.details, className)}>
            {renderEntries(item, columns)}
        </dl>
    );
    if (item === undefined) {
        return (
            <LoadingRegion label={intl.formatMessage(messages.loadingItem)}>
                <div inert aria-hidden="true">
                    {details}
                </div>
            </LoadingRegion>
        );
    }
    return details;
}
