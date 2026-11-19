import type { ReactNode } from 'react';
import { Group } from 'react-aria-components';

import { cx } from '../utils/cx';
import styles from './ButtonGroup.module.css';

export interface ButtonGroupProps {
    /**
     * `Button`, `LinkButton` and `IconButton`, or a `MenuTrigger` around one of them: a button and
     * an icon button that opens a menu make a split button.
     */
    children?: ReactNode;
    /** Names the group. */
    label?: string | undefined;
    /** Defaults to `horizontal`. */
    orientation?: 'horizontal' | 'vertical';
    className?: string | undefined;
}

/**
 * Buttons attached to each other: one border between two of them, rounded corners only at the
 * ends. For actions; `SegmentedControl` is for choosing a value.
 */
export function ButtonGroup({
    children,
    label,
    orientation = 'horizontal',
    className,
}: ButtonGroupProps) {
    return (
        <Group
            aria-label={label}
            data-orientation={orientation}
            className={cx(
                'panneau-button-group',
                styles.buttonGroup,
                orientation === 'vertical' && styles.vertical,
                className,
            )}
        >
            {children}
        </Group>
    );
}
