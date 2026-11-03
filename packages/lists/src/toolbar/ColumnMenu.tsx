import { ArrowDown, ArrowUp, Columns3 } from 'lucide-react';

import { Button, Checkbox, IconButton, Popover, PopoverTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListColumn } from '../types';
import styles from './Toolbar.module.css';

export interface ColumnMenuProps {
    /** Every column of the list, in the order of the definition. */
    columns: readonly ListColumn[];
    /** The columns shown, in their order. */
    shown: readonly ListColumn[];
    /** Shows these columns, by id, in this order. */
    onChange: (ids: string[]) => void;
    /** Back to the columns of the definition, or `null` while they are shown. */
    onReset: (() => void) | null;
}

function labelOf(column: ListColumn): string {
    return typeof column.label === 'string' ? column.label : column.id;
}

/**
 * A button that opens the columns of a list: a checkbox to show or hide each one, buttons to
 * move the shown ones, and a reset to the columns of the definition (decision 0042).
 */
export function ColumnMenu({ columns, shown, onChange, onReset }: ColumnMenuProps) {
    const intl = usePanneauIntl();
    const ids = shown.map((column) => column.id);
    // The shown columns first, in their order, then the others, where showing one adds it.
    const ordered = [...shown, ...columns.filter((column) => !shown.includes(column))];
    const move = (index: number, offset: number) => {
        const next = [...ids];
        const [id] = next.splice(index, 1);
        if (id !== undefined) {
            next.splice(index + offset, 0, id);
            onChange(next);
        }
    };
    return (
        <PopoverTrigger>
            <Button icon={Columns3}>{intl.formatMessage(messages.columns)}</Button>
            <Popover placement="bottom end" aria-label={intl.formatMessage(messages.columns)}>
                <div className={styles.columns}>
                    <ul className={styles.columnList}>
                        {ordered.map((column) => {
                            const index = ids.indexOf(column.id);
                            const isShown = index !== -1;
                            const label = labelOf(column);
                            return (
                                <li key={column.id} className={styles.column}>
                                    <Checkbox
                                        isSelected={isShown}
                                        // The last column shown stays: a list shows something.
                                        isDisabled={
                                            column.hideable === false ||
                                            (isShown && ids.length === 1)
                                        }
                                        onChange={(selected) =>
                                            onChange(
                                                selected
                                                    ? [...ids, column.id]
                                                    : ids.filter((id) => id !== column.id),
                                            )
                                        }
                                        className={styles.columnLabel}
                                    >
                                        {label}
                                    </Checkbox>
                                    {isShown ? (
                                        <span className={styles.columnMoves}>
                                            <IconButton
                                                icon={ArrowUp}
                                                size="sm"
                                                label={intl.formatMessage(messages.moveColumnUp, {
                                                    column: label,
                                                })}
                                                showTooltip={false}
                                                isDisabled={index === 0}
                                                onPress={() => move(index, -1)}
                                            />
                                            <IconButton
                                                icon={ArrowDown}
                                                size="sm"
                                                label={intl.formatMessage(messages.moveColumnDown, {
                                                    column: label,
                                                })}
                                                showTooltip={false}
                                                isDisabled={index === ids.length - 1}
                                                onPress={() => move(index, 1)}
                                            />
                                        </span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                    <Button
                        size="sm"
                        appearance="ghost"
                        isDisabled={onReset === null}
                        onPress={() => onReset?.()}
                    >
                        {intl.formatMessage(messages.resetColumns)}
                    </Button>
                </div>
            </Popover>
        </PopoverTrigger>
    );
}
