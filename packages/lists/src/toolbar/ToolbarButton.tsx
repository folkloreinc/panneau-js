import type { ReactNode } from 'react';

import { Button, type IconComponent, Tooltip } from '@panneau/ui';

import { cx } from '../cx';
import styles from './Toolbar.module.css';

export interface ToolbarButtonProps {
    icon: IconComponent;
    /** The name of the button. Without `children`, its only text: shown in a tooltip. */
    label: string;
    /**
     * Text shown next to the icon, where the button says something its icon doesn't ("Done", the
     * current sort). The button's name is then `label` when given, which includes it.
     */
    children?: ReactNode;
    iconEnd?: IconComponent | undefined;
    appearance?: 'outline' | 'solid';
    isPending?: boolean;
    onPress?: () => void;
}

/**
 * A button of a list's toolbar: only its icon, with its label as its name and tooltip (#424), or
 * its icon and a text when it shows a state. One element in both cases, so that the focus stays on
 * it when it changes.
 */
export function ToolbarButton({
    icon,
    label,
    children,
    iconEnd,
    appearance = 'outline',
    isPending,
    onPress,
}: ToolbarButtonProps) {
    const hasText = children !== undefined && children !== null && children !== false;
    return (
        <Tooltip content={label} isDisabled={hasText}>
            <Button
                icon={icon}
                {...(iconEnd !== undefined ? { iconEnd } : {})}
                appearance={appearance}
                aria-label={label}
                {...(isPending !== undefined ? { isPending } : {})}
                {...(onPress !== undefined ? { onPress } : {})}
                className={cx(!hasText && styles.iconOnly)}
            >
                {hasText ? children : null}
            </Button>
        </Tooltip>
    );
}
