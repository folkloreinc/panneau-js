import type { CSSProperties, ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Button.module.css';

/** How a button uses its tone, like Bootstrap's `.btn-*` and `.btn-outline-*`. */
export type ButtonAppearance = 'solid' | 'outline' | 'subtle' | 'ghost';

/**
 * Named variants of `Button`, registered by a theme (`components.button.variants`). Declare them
 * here so that `variant="pill"` type-checks:
 *
 * ```ts
 * declare module '@panneau/ui' {
 *     interface ButtonVariants {
 *         pill: true;
 *     }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended by projects
export interface ButtonVariants {}

/**
 * The variants of the first alpha, kept as aliases of a tone and an appearance: `primary` is
 * accent solid, `secondary` neutral outline, `ghost` neutral ghost, `danger` danger solid.
 *
 * @deprecated Use `tone` and `appearance`.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const ALIASES: Record<ButtonVariant, { tone: Tone; appearance: ButtonAppearance }> = {
    primary: { tone: 'accent', appearance: 'solid' },
    secondary: { tone: 'neutral', appearance: 'outline' },
    ghost: { tone: 'neutral', appearance: 'ghost' },
    danger: { tone: 'danger', appearance: 'solid' },
};

function isAlias(variant: string): variant is ButtonVariant {
    return Object.hasOwn(ALIASES, variant);
}

/** The look of a button, shared by `Button` and `LinkButton`. */
export interface ButtonStyleProps {
    /** Defaults to `neutral`. */
    tone?: Tone;
    /** Defaults to `outline` for the neutral tone, and `solid` for the others. */
    appearance?: ButtonAppearance;
    /** A named variant of the theme, or one of the deprecated aliases (`primary`…). */
    variant?: ButtonVariant | (keyof ButtonVariants & string);
    size?: 'sm' | 'md';
    /** Icon before the label. */
    icon?: IconComponent;
    /** Icon after the label. */
    iconEnd?: IconComponent;
    /** Takes the full width of its container. */
    fullWidth?: boolean;
}

export interface ButtonProps
    extends ButtonStyleProps, Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
}

/** The class names of a button from its style props, for `Button` and `LinkButton`. */
export function getButtonClassName({
    tone,
    appearance,
    variant,
    size = 'md',
    fullWidth = false,
    className,
}: Pick<ButtonStyleProps, 'tone' | 'appearance' | 'variant' | 'size' | 'fullWidth'> & {
    className?: string | undefined;
}): string {
    const alias = variant !== undefined && isAlias(variant) ? ALIASES[variant] : undefined;
    const resolvedTone = tone ?? alias?.tone ?? 'neutral';
    const resolvedAppearance =
        appearance ?? alias?.appearance ?? (resolvedTone === 'neutral' ? 'outline' : 'solid');
    return cx(
        'panneau-button',
        styles.button,
        toneClass(resolvedTone),
        styles[resolvedAppearance],
        variant !== undefined && alias === undefined && `panneau-button-variant-${variant}`,
        size === 'sm' && styles.sm,
        fullWidth && styles.fullWidth,
        className,
    );
}

/** The icons and label of a button. */
export function ButtonContent({
    icon,
    iconEnd,
    size = 'md',
    children,
}: Pick<ButtonStyleProps, 'icon' | 'iconEnd' | 'size'> & { children?: ReactNode }) {
    return (
        <span className={styles.content}>
            {icon !== undefined ? <Icon icon={icon} size={size === 'sm' ? 'sm' : 'md'} /> : null}
            {children}
            {iconEnd !== undefined ? (
                <Icon icon={iconEnd} size={size === 'sm' ? 'sm' : 'md'} />
            ) : null}
        </span>
    );
}

/**
 * A button. With `isPending`, it shows a spinner, keeps its size and focus, and ignores presses
 * while assistive technologies announce the pending state.
 */
export function Button({
    tone,
    appearance,
    variant,
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
            className={getButtonClassName({
                tone,
                appearance,
                variant,
                size,
                fullWidth,
                className: cx(isPending && styles.pending, className),
            })}
        >
            <ButtonContent icon={icon} iconEnd={iconEnd} size={size}>
                {children}
            </ButtonContent>
            {isPending ? (
                <span className={styles.spinner}>
                    <Spinner size="sm" />
                </span>
            ) : null}
        </AriaButton>
    );
}

export { styles as buttonStyles };
