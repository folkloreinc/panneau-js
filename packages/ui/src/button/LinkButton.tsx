import type { CSSProperties, ReactNode } from 'react';
import { Link as AriaLink, type LinkProps as AriaLinkProps } from 'react-aria-components';

import { ButtonContent, type ButtonStyleProps, getButtonClassName } from './Button';

export interface LinkButtonProps
    extends ButtonStyleProps, Omit<AriaLinkProps, 'className' | 'style' | 'children'> {
    /** Where the link goes, through the app's router for a path of the admin. */
    href: string;
    /**
     * Leaves the admin: opens in a new tab, without access to the admin (`target="_blank"`,
     * `rel="noopener noreferrer"`). Absolute URLs aren't external by themselves: a sign-in
     * provider opens in the same tab.
     */
    external?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
}

/**
 * A link that looks like a `Button`: the same tones, appearances, sizes and states. It goes
 * through React Aria, so an app's router handles it.
 */
export function LinkButton({
    tone,
    appearance,
    variant,
    size = 'md',
    icon,
    iconEnd,
    fullWidth = false,
    external = false,
    children,
    className,
    ...props
}: LinkButtonProps) {
    return (
        <AriaLink
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...props}
            className={getButtonClassName({
                tone,
                appearance,
                variant,
                size,
                fullWidth,
                className,
            })}
        >
            <ButtonContent icon={icon} iconEnd={iconEnd} size={size}>
                {children}
            </ButtonContent>
        </AriaLink>
    );
}
