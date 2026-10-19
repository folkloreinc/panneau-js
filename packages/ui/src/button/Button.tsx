import type { CSSProperties, ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import { cx } from '../utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
    /** Defaults to `secondary`. */
    variant?: ButtonVariant;
    size?: 'sm' | 'md';
    /** Icon before the label. */
    icon?: IconComponent;
    /** Icon after the label. */
    iconEnd?: IconComponent;
    /** Takes the full width of its container. */
    fullWidth?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
}

/**
 * A button. With `isPending`, it shows a spinner, keeps its size and focus, and ignores presses
 * while assistive technologies announce the pending state.
 */
export function Button({
    variant = 'secondary',
    size = 'md',
    icon,
    iconEnd,
    fullWidth = false,
    isPending = false,
    children,
    className,
    ...props
}: ButtonProps) {
    return (
        <AriaButton
            {...props}
            isPending={isPending}
            className={cx(
                'panneau-button',
                styles.button,
                styles[variant],
                size === 'sm' && styles.sm,
                fullWidth && styles.fullWidth,
                isPending && styles.pending,
                className,
            )}
        >
            <span className={styles.content}>
                {icon !== undefined ? (
                    <Icon icon={icon} size={size === 'sm' ? 'sm' : 'md'} />
                ) : null}
                {children}
                {iconEnd !== undefined ? (
                    <Icon icon={iconEnd} size={size === 'sm' ? 'sm' : 'md'} />
                ) : null}
            </span>
            {isPending ? (
                <span className={styles.spinner}>
                    <Spinner size="sm" />
                </span>
            ) : null}
        </AriaButton>
    );
}

export { styles as buttonStyles };
