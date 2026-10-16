import { Select, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListColumn } from '../types';
import styles from './Toolbar.module.css';

export interface SortSelectProps {
    columns: readonly ListColumn[];
    sort: readonly string[];
    onChange: (sort: string[]) => void;
}

const DEFAULT = '';

/** The sort of a list without column headers (cards), by sortable column and direction. */
export function SortSelect({ columns, sort, onChange }: SortSelectProps) {
    const intl = usePanneauIntl();
    const sortable = columns.filter((column) => column.sortable === true);
    const label = (column: ListColumn) =>
        typeof column.label === 'string' ? column.label : column.id;
    const options = [
        { value: DEFAULT, label: intl.formatMessage(messages.defaultSort) },
        ...sortable.flatMap((column) => [
            {
                value: column.id,
                label: intl.formatMessage(messages.sortAscending, { column: label(column) }),
            },
            {
                value: `-${column.id}`,
                label: intl.formatMessage(messages.sortDescending, { column: label(column) }),
            },
        ]),
    ];
    const current = sort[0] ?? DEFAULT;
    return (
        <Select
            label={intl.formatMessage(messages.sortBy)}
            options={options}
            value={options.some((option) => option.value === current) ? current : DEFAULT}
            onChange={(value) =>
                onChange(value === null || value === DEFAULT ? [] : [String(value)])
            }
            className={styles.sort}
        />
    );
}
