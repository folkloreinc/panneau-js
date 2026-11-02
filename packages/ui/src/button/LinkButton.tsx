import { Link as AriaLink, type LinkProps as AriaLinkProps } from 'react-aria-components';

import { ButtonContent, type ButtonStyleProps, getButtonClassName } from './Button';

export interface LinkButtonProps
    extends ButtonStyleProps, Omit<AriaLinkProps, 'className' | 'style' | 'children'> {
    /** Where the link goes, through the app's router for a path of the admin. */
    href: string;
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
    children,
    className,
    ...props
}: LinkButtonProps) {
    return (
        <AriaLink
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
