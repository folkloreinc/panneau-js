import { Link } from 'react-aria-components';

import type { Action } from '@panneau/protocol';
import { Button, Icon } from '@panneau/ui';

import { cx } from '../cx';
import styles from './Actions.module.css';
import { type ActionIcons, getActionIcon } from './icons';

export interface ActionButtonProps {
    action: Action;
    /** Icons of actions by id, over the icon the action names. */
    icons?: ActionIcons | undefined;
    /** The link of a `link` action. Links go through React Aria, so an app's router handles them. */
    href: string | null;
    onPress: () => void;
    isPending?: boolean;
    isDisabled?: boolean;
    size?: 'sm' | 'md';
    /** Accessible label, when the label alone isn't enough (`Edit Ada Lovelace`). */
    'aria-label'?: string;
}

/** An action as a button, or as a link for a `link` action with a URL. */
export function ActionButton({
    action,
    icons,
    href,
    onPress,
    isPending = false,
    isDisabled = false,
    size = 'sm',
    'aria-label': ariaLabel,
}: ActionButtonProps) {
    const icon = getActionIcon(action, icons);
    if (href !== null) {
        return (
            <Link
                href={href}
                aria-label={ariaLabel}
                className={cx(styles.link, size === 'md' && styles.linkMd)}
            >
                {icon !== undefined ? <Icon icon={icon} size="sm" /> : null}
                {action.label}
            </Link>
        );
    }
    return (
        <Button
            size={size}
            variant={action.destructive === true ? 'danger' : size === 'sm' ? 'ghost' : 'secondary'}
            {...(icon !== undefined ? { icon } : {})}
            isPending={isPending}
            isDisabled={isDisabled}
            aria-label={ariaLabel}
            onPress={onPress}
        >
            {action.label}
        </Button>
    );
}
