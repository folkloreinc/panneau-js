import type { HTMLAttributes } from 'react';

import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Text.module.css';

/** A size of the font scale of the theme. */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** A font role of the theme. */
export type TextFamily = 'body' | 'heading' | 'display' | 'mono';

export interface TextProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `p`. */
    as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em';
    /** Font size, from the scale of the theme. Inherited by default. */
    size?: TextSize;
    /** Inherited by default. */
    weight?: 'normal' | 'medium' | 'bold';
    /** Font role. Inherited by default. */
    family?: TextFamily;
    /** Colors the text with a tone (`success`, `danger`…), readable on surfaces. */
    tone?: Tone;
    /** The muted text color, for secondary information. */
    muted?: boolean;
    /** Digits of equal width, so that numbers line up: stats, dates, ids. */
    numeric?: boolean;
    /** Keeps the text on one line, cut with an ellipsis. */
    truncate?: boolean;
}

/** Text in the sizes, weights and font roles of the theme. */
export function Text({
    as: Element = 'p',
    size,
    weight,
    family,
    tone,
    muted = false,
    numeric = false,
    truncate = false,
    className,
    ...props
}: TextProps) {
    return (
        <Element
            {...props}
            className={cx(
                'panneau-text',
                styles.text,
                size !== undefined && styles[`size-${size}`],
                weight !== undefined && styles[`weight-${weight}`],
                family !== undefined && styles[`family-${family}`],
                tone !== undefined && toneClass(tone),
                tone !== undefined && styles.toned,
                muted && styles.muted,
                numeric && styles.numeric,
                truncate && styles.truncate,
                className,
            )}
        />
    );
}
