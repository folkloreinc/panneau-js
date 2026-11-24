import type { ReactElement, ReactNode } from 'react';
import {
    Tooltip as AriaTooltip,
    type TooltipProps as AriaTooltipProps,
    TooltipTrigger,
} from 'react-aria-components';

import { usePortalContainer } from '../root/PanneauRoot';
import type { ShortcutKeys } from '../shortcuts/keys';
import { useShortcutHint } from '../shortcuts/useShortcut';
import { cx } from '../utils/cx';
import styles from './Tooltip.module.css';

export interface TooltipProps {
    /** Content of the tooltip. */
    content: ReactNode;
    /** The element that shows the tooltip on hover and focus: a focusable React Aria element. */
    children: ReactElement;
    placement?: AriaTooltipProps['placement'];
    /** Delay before showing, in milliseconds. Defaults to 600. */
    delay?: number;
    isDisabled?: boolean;
    /**
     * The keys of the shortcut that does the same, shown at the end of the tooltip (decision
     * 0112), in place of a hint on the element itself.
     */
    shortcut?: ShortcutKeys | undefined;
    className?: string;
}

/**
 * A tooltip on hover and keyboard focus, with the keys of a `shortcut` at its end. It only adds a description: never put information or
 * actions in it that aren't available otherwise, since touch screens don't show it.
 */
export function Tooltip({
    content,
    children,
    placement = 'top',
    delay = 600,
    isDisabled = false,
    shortcut,
    className,
}: TooltipProps) {
    const container = usePortalContainer();
    const hint = useShortcutHint()(shortcut);
    if (container === null) {
        return children;
    }
    return (
        <TooltipTrigger delay={delay} isDisabled={isDisabled}>
            {children}
            <AriaTooltip
                placement={placement}
                offset={6}
                className={cx('panneau-tooltip', styles.tooltip, className)}
                UNSTABLE_portalContainer={container}
            >
                {hint !== null ? (
                    <span className={styles.withShortcut}>
                        {content}
                        <kbd className={styles.shortcut}>{hint}</kbd>
                    </span>
                ) : (
                    content
                )}
            </AriaTooltip>
        </TooltipTrigger>
    );
}
