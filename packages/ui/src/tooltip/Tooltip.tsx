import type { ReactElement, ReactNode } from 'react';
import {
    Tooltip as AriaTooltip,
    type TooltipProps as AriaTooltipProps,
    TooltipTrigger,
} from 'react-aria-components';

import { usePortalContainer } from '../root/PanneauRoot';
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
    className?: string;
}

/**
 * A tooltip on hover and keyboard focus. It only adds a description: never put information or
 * actions in it that aren't available otherwise, since touch screens don't show it.
 */
export function Tooltip({
    content,
    children,
    placement = 'top',
    delay = 600,
    isDisabled = false,
    className,
}: TooltipProps) {
    const container = usePortalContainer();
    if (container === null) {
        return children;
    }
    return (
        <TooltipTrigger delay={delay} isDisabled={isDisabled}>
            {children}
            <AriaTooltip
                data-panneau="tooltip"
                placement={placement}
                offset={6}
                className={cx(styles.tooltip, className)}
                UNSTABLE_portalContainer={container}
            >
                {content}
            </AriaTooltip>
        </TooltipTrigger>
    );
}
