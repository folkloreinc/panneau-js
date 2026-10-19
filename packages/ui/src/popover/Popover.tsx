import type { ReactNode } from 'react';
import {
    Popover as AriaPopover,
    type PopoverProps as AriaPopoverProps,
    Dialog,
} from 'react-aria-components';

import { usePortalContainer } from '../root/PanneauRoot';
import { cx } from '../utils/cx';
import styles from './Popover.module.css';

export interface PopoverProps extends Omit<
    AriaPopoverProps,
    'className' | 'style' | 'children' | 'UNSTABLE_portalContainer'
> {
    children?: ReactNode;
    /** Accessible label of the popover's dialog, when it has no heading. */
    'aria-label'?: string;
    className?: string;
    dialogClassName?: string;
}

/**
 * A popover with free content, inside a `PopoverTrigger` with its button as the first child. Its
 * content is a non-modal dialog: focus moves into it and comes back to the button when it closes.
 */
export function Popover({
    children,
    'aria-label': ariaLabel,
    className,
    dialogClassName,
    offset = 6,
    ...props
}: PopoverProps) {
    const container = usePortalContainer();
    if (container === null) {
        return null;
    }
    return (
        <AriaPopover
            {...props}
            offset={offset}
            className={cx('panneau-popover', styles.popover, className)}
            UNSTABLE_portalContainer={container}
        >
            <Dialog aria-label={ariaLabel} className={cx(styles.dialog, dialogClassName)}>
                {children}
            </Dialog>
        </AriaPopover>
    );
}

/** The popover surface without a dialog, for listboxes and menus. */
export function PopoverSurface({
    children,
    className,
    offset = 6,
    ...props
}: Omit<PopoverProps, 'aria-label' | 'dialogClassName'>) {
    const container = usePortalContainer();
    if (container === null) {
        return null;
    }
    return (
        <AriaPopover
            {...props}
            offset={offset}
            className={cx('panneau-popover', styles.popover, className)}
            UNSTABLE_portalContainer={container}
        >
            {children}
        </AriaPopover>
    );
}

export { DialogTrigger as PopoverTrigger } from 'react-aria-components';
