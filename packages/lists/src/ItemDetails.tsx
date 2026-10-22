import styles from './ItemDetails.module.css';
import { cx } from './cx';
import type { DisplayEntry, ListColumn, ListItem } from './types';
import { useRenderValue } from './useRenderValue';

export interface ItemDetailsProps {
    item: ListItem;
    /** The values to show, with their label and display, in order. */
    columns: readonly ListColumn[];
    /** Displays by name, over the built-in ones and those of the plugins. */
    displays?: Readonly<Record<string, DisplayEntry>>;
    'aria-label'?: string;
    className?: string;
}

/**
 * The values of one item, each with its label, shown with the displays of the lists: for the
 * details of an item next to its list, or anywhere a read-only view of it is needed.
 */
export function ItemDetails({
    item,
    columns,
    displays,
    'aria-label': ariaLabel,
    className,
}: ItemDetailsProps) {
    const renderValue = useRenderValue(displays);
    return (
        <dl aria-label={ariaLabel} className={cx(styles.details, className)}>
            {columns.map((column) => (
                <div key={column.id} className={styles.entry}>
                    <dt className={styles.label}>{column.label ?? column.id}</dt>
                    <dd className={styles.value}>{renderValue(item, column)}</dd>
                </div>
            ))}
        </dl>
    );
}
