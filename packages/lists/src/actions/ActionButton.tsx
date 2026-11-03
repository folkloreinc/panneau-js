import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { Button, LinkButton, usePanneauIntl } from '@panneau/ui';

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

/** Whether a link leaves the admin: it opens in a new tab. */
function isExternal(href: string): boolean {
    return /^https?:\/\//.test(href);
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
    const intl = usePanneauIntl();
    const icon = getActionIcon(action, icons);
    const label = getActionLabel(action, intl);
    // Small actions sit in rows, as ghost buttons; others beside the buttons of a toolbar.
    const variant = action.destructive === true ? 'danger' : size === 'sm' ? 'ghost' : 'secondary';
    if (href !== null) {
        return (
            <LinkButton
                href={href}
                size={size}
                variant={variant}
                {...(icon !== undefined ? { icon } : {})}
                external={isExternal(href)}
                aria-label={ariaLabel}
            >
                {label}
            </LinkButton>
        );
    }
    return (
        <Button
            size={size}
            variant={variant}
            {...(icon !== undefined ? { icon } : {})}
            isPending={isPending}
            isDisabled={isDisabled}
            aria-label={ariaLabel}
            onPress={onPress}
        >
            {label}
        </Button>
    );
}
