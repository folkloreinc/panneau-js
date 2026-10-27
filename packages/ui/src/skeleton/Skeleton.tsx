import type { CSSProperties } from 'react';

import { cx } from '../utils/cx';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
    /**
     * `text` (the default): a line of text, or several with `lines`. `rect`: a block, as wide as
     * its container unless `width` says otherwise. `circle`: an avatar or an icon.
     */
    shape?: 'text' | 'rect' | 'circle';
    /** Lines of text, the last one shorter. Only for `text`. Defaults to 1. */
    lines?: number;
    /** A length, in pixels for a number. For `circle`, its diameter. */
    width?: number | string;
    /** A length, in pixels for a number. Lines of text take the height of a line. */
    height?: number | string;
    /** The shape of a `rect` without a height: `16 / 9` as `'16 / 9'`, or a number. */
    aspectRatio?: number | string;
    className?: string;
    style?: CSSProperties;
}

/**
 * A placeholder of content that loads, in its shape: a line of text, a block or a circle
 * (decision 0034). It is hidden from assistive technologies: the region that loads says it, with
 * `LoadingRegion`. It pulses, unless the user prefers reduced motion, with the colors of the theme.
 */
export function Skeleton({
    shape = 'text',
    lines = 1,
    width,
    height,
    aspectRatio,
    className,
    style,
}: SkeletonProps) {
    const size: CSSProperties = {
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined && shape !== 'text' ? { height } : {}),
        ...(aspectRatio !== undefined && shape === 'rect' ? { aspectRatio } : {}),
        ...style,
    };
    if (shape === 'text' && lines > 1) {
        return (
            <span
                aria-hidden="true"
                className={cx('panneau-skeleton', styles.lines, className)}
                style={size}
            >
                {Array.from({ length: lines }, (_, index) => (
                    <span key={index} className={cx(styles.block, styles.line)} />
                ))}
            </span>
        );
    }
    return (
        <span
            aria-hidden="true"
            className={cx(
                'panneau-skeleton',
                styles.block,
                shape === 'text' ? styles.line : shape === 'circle' ? styles.circle : styles.rect,
                className,
            )}
            style={size}
        />
    );
}
