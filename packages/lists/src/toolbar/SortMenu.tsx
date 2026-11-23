import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Key } from 'react-aria-components';

import { Menu, MenuItem, MenuSection, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListColumn } from '../types';
import styles from './Toolbar.module.css';
import { ToolbarButton } from './ToolbarButton';

export interface SortMenuProps {
    columns: readonly ListColumn[];
    sort: readonly string[];
    onChange: (sort: string[]) => void;
}

/** The key of the default sort: not a column id, which never starts with a colon. */
const DEFAULT = ':default';

function labelOf(column: ListColumn): string {
    return typeof column.label === 'string' ? column.label : column.id;
}

interface SortOption {
    id: string;
    label: string;
    column: ListColumn | null;
    descending: boolean;
}

/** The sorts of a list: the default one, then each sortable column, ascending and descending. */
function useSortOptions({ columns, sort }: Pick<SortMenuProps, 'columns' | 'sort'>): {
    options: SortOption[];
    current: SortOption;
} {
    const intl = usePanneauIntl();
    const byDefault: SortOption = {
        id: DEFAULT,
        label: intl.formatMessage(messages.defaultSort),
        column: null,
        descending: false,
    };
    const options = [
        byDefault,
        ...columns
            .filter((column) => column.sortable === true)
            .flatMap((column) => [
                {
                    id: column.id,
                    label: intl.formatMessage(messages.sortAscending, { column: labelOf(column) }),
                    column,
                    descending: false,
                },
                {
                    id: `-${column.id}`,
                    label: intl.formatMessage(messages.sortDescending, { column: labelOf(column) }),
                    column,
                    descending: true,
                },
            ]),
    ];
    const current = options.find((option) => option.id === sort[0]) ?? byDefault;
    return { options, current };
}

function toSort(keys: 'all' | Set<Key>): string[] | null {
    if (keys === 'all') {
        return null;
    }
    const [key] = [...keys];
    return key === undefined ? null : key === DEFAULT ? [] : [String(key)];
}

/**
 * The sort of a list, as a menu of its sorts. Its button shows the column it sorts by, and an
 * arrow of its direction, or only its icon with the default sort: it is as wide as what it says.
 */
export function SortMenu({ columns, sort, onChange }: SortMenuProps) {
    const intl = usePanneauIntl();
    const { options, current } = useSortOptions({ columns, sort });
    const sortBy = intl.formatMessage(messages.sortBy);
    return (
        <MenuTrigger>
            <ToolbarButton
                icon={ArrowUpDown}
                label={
                    current.column !== null
                        ? intl.formatMessage(messages.sortedBy, { sort: current.label })
                        : sortBy
                }
                iconEnd={
                    current.column === null ? undefined : current.descending ? ArrowDown : ArrowUp
                }
            >
                {current.column !== null ? (
                    <span className={styles.sortValue}>{labelOf(current.column)}</span>
                ) : null}
            </ToolbarButton>
            <Menu
                aria-label={sortBy}
                placement="bottom end"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[current.id]}
                onSelectionChange={(keys) => {
                    const next = toSort(keys);
                    if (next !== null) {
                        onChange(next);
                    }
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.id} id={option.id}>
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </MenuTrigger>
    );
}

/** The sorts of a list as a section of a menu, such as the menu of a narrow toolbar. */
export function SortSection({ columns, sort, onChange }: SortMenuProps) {
    const intl = usePanneauIntl();
    const { options, current } = useSortOptions({ columns, sort });
    return (
        <MenuSection
            title={intl.formatMessage(messages.sortBy)}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[current.id]}
            onSelectionChange={(keys) => {
                const next = toSort(keys);
                if (next !== null) {
                    onChange(next);
                }
            }}
        >
            {options.map((option) => (
                <MenuItem key={option.id} id={option.id}>
                    {option.label}
                </MenuItem>
            ))}
        </MenuSection>
    );
}
