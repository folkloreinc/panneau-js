import type { ReactNode } from 'react';

import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Badge.module.css';

/** @deprecated Use `Tone`. */
export type BadgeTone = Tone;

/** How a badge uses its tone. */
export type BadgeAppearance = 'subtle' | 'solid' | 'outline';

/**
 * Named variants of `Badge`, registered by a theme (`components.badge.variants`). Declare them
 * here so that `variant="tag"` type-checks.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended by projects
export interface BadgeVariants {}

export interface BadgeProps {
    /** Defaults to `neutral`. */
    tone?: Tone;
    /** Defaults to `subtle`. */
    appearance?: BadgeAppearance;
    /** A named variant of the theme. */
    variant?: keyof BadgeVariants & string;
    children?: ReactNode;
    /**
     * Accessible text, when the visible content isn't enough on its own (a count of errors: "2
     * errors"). The visible content is then hidden from assistive technologies.
     */
    label?: string;
    className?: string;
}

/** A short status or a count. */
export function Badge({
    tone = 'neutral',
    appearance = 'subtle',
    variant,
    children,
    label,
    className,
}: BadgeProps) {
    return (
        <span
            className={cx(
                'panneau-badge',
                styles.badge,
                toneClass(tone),
                styles[appearance],
                variant !== undefined && `panneau-badge-variant-${variant}`,
                className,
            )}
        >
            {label !== undefined ? (
                <>
                    <span aria-hidden="true">{children}</span>
                    <span className={styles.visuallyHidden}>{label}</span>
                </>
            ) : (
                children
            )}
        </span>
    );
}
