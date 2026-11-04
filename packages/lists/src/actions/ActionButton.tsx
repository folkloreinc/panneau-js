import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { Button, LinkButton, Tooltip, usePanneauIntl } from '@panneau/ui';

import styles from './Actions.module.css';
import { type ActionIcons, getActionIcon, getActionTone } from './icons';

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
    /**
     * Only the icon, in the color of the action, with the label as its accessible name and
     * tooltip, as rows show their actions (decision 0060). An action without an icon keeps its
     * label.
     */
    iconOnly?: boolean;
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
    iconOnly = false,
    'aria-label': ariaLabel,
}: ActionButtonProps) {
    const intl = usePanneauIntl();
    const icon = getActionIcon(action, icons);
    const label = getActionLabel(action, intl);
    const destructive = action.destructive === true;
    // In rows, the color of the action, tinted (decision 0060); beside the buttons of a toolbar,
    // outlined (solid when it destroys).
    const inRow = size === 'sm';
    const tone = inRow ? getActionTone(action) : destructive ? 'danger' : 'neutral';
    const appearance = inRow ? 'subtle' : destructive ? 'solid' : 'outline';
    const onlyIcon = iconOnly && icon !== undefined;
    const name = ariaLabel ?? (onlyIcon ? label : undefined);
    const button =
        href !== null ? (
            <LinkButton
                href={href}
                size={size}
                tone={tone}
                appearance={appearance}
                {...(icon !== undefined ? { icon } : {})}
                external={isExternal(href)}
                aria-label={name}
                className={onlyIcon ? styles.iconOnly : undefined}
            >
                {onlyIcon ? null : label}
            </LinkButton>
        ) : (
            <Button
                size={size}
                tone={tone}
                appearance={appearance}
                {...(icon !== undefined ? { icon } : {})}
                isPending={isPending}
                isDisabled={isDisabled}
                aria-label={name}
                className={onlyIcon ? styles.iconOnly : undefined}
                onPress={onPress}
            >
                {onlyIcon ? null : label}
            </Button>
        );
    return onlyIcon ? <Tooltip content={name ?? label}>{button}</Tooltip> : button;
}
