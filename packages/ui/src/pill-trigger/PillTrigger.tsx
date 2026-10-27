import { ChevronDown } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

import { Icon } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './PillTrigger.module.css';

export interface PillTriggerProps extends Omit<
    AriaButtonProps,
    'className' | 'style' | 'children'
> {
    /** The current value, shown inline. */
    children?: ReactNode;
    /** Leading media, such as an avatar or an image, clipped to a circle by default. */
    media?: ReactNode;
    /** Defaults to `md`, the height of a control. */
    size?: 'sm' | 'md';
    className?: string;
    style?: CSSProperties;
}

/**
 * A compact rounded button that shows a current value, with an optional leading media and a
 * chevron: the trigger of a `Menu` (in a `MenuTrigger`) or a `Popover` (in a `PopoverTrigger`).
 * Its accessible name is its value: give it an `aria-label` that contains the value when the
 * value alone doesn't say what it picks.
 */
export function PillTrigger({
    children,
    media,
    size = 'md',
    className,
    ...props
}: PillTriggerProps) {
    return (
        <AriaButton
            {...props}
            className={cx(
                'panneau-pill-trigger',
                styles.pillTrigger,
                size === 'sm' && styles.sm,
                className,
            )}
        >
            {media !== undefined && media !== null ? (
                <span className={styles.media}>{media}</span>
            ) : null}
            <span className={styles.value}>{children}</span>
            <Icon icon={ChevronDown} size="sm" className={styles.chevron} />
        </AriaButton>
    );
}
