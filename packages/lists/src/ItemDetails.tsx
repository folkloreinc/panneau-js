import { LoadingRegion, Skeleton, usePanneauIntl } from '@panneau/ui';

import styles from './ItemDetails.module.css';
import { cx } from './cx';
import { messages } from './messages';
import type { DisplayEntry, ListColumn, ListItem } from './types';
import { useRenderValue } from './useRenderValue';

/** Widths of the values of a skeleton, varied so they read as text. */
const WIDTHS = ['70%', '40%', '55%', '30%', '65%'];

export interface ItemDetailsProps {
    /** The item. `undefined` while it loads: the labels, with a skeleton of each value. */
    item: ListItem | undefined;
    /** The values to show, with their label and display, in order. */
    columns: readonly ListColumn[];
    /** Displays by name, over the built-in ones and those of the plugins. */
    displays?: Readonly<Record<string, DisplayEntry>>;
    'aria-label'?: string;
    className?: string;
}

/**
 * The values of one item, each with its label, shown with the displays of the lists: for the
 * details of an item next to its list, or anywhere a read-only view of it is needed. While the
 * item loads, it draws the labels with a skeleton of each value (decision 0034).
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
    const details = (
        <dl aria-label={ariaLabel} className={cx(styles.details, className)}>
            {columns.map((column, index) => (
                <div key={column.id} className={styles.entry}>
                    <dt className={styles.label}>{column.label ?? column.id}</dt>
                    <dd className={styles.value}>
                        {item !== undefined ? (
                            renderValue(item, column)
                        ) : (
                            <Skeleton width={WIDTHS[index % WIDTHS.length]} />
                        )}
                    </dd>
                </div>
            ))}
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
