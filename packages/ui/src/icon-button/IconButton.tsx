import type { CSSProperties } from 'react';

import { Button, type ButtonProps } from '../button/Button';
import type { IconComponent } from '../icon/Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { cx } from '../utils/cx';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<
    ButtonProps,
    'icon' | 'iconEnd' | 'children' | 'fullWidth' | 'aria-label'
> {
    icon: IconComponent;
    /** Accessible label, also shown as a tooltip. */
    label: string;
    /** Shows the label in a tooltip on hover and focus. Defaults to true. */
    showTooltip?: boolean;
    className?: string;
    style?: CSSProperties;
}

/** A square button with only an icon. Its label is announced and shown as a tooltip. */
export function IconButton({
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    showTooltip = true,
    className,
    ...props
}: IconButtonProps) {
    const button = (
        <Button
            {...props}
            variant={variant}
            size={size}
            icon={icon}
            aria-label={label}
            className={cx(
                'panneau-icon-button',
                styles.iconButton,
                size === 'sm' && styles.sm,
                className,
            )}
        />
    );
    if (!showTooltip) {
        return button;
    }
    return <Tooltip content={label}>{button}</Tooltip>;
}
