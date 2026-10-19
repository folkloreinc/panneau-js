import type { HTMLAttributes } from 'react';

import { cx } from '../utils/cx';
import styles from './Heading.module.css';

/** The level of a heading element: `h1` to `h6`. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The visual size of a heading: 1 to 4, or a display size for hero text and stats. */
export type HeadingSize = 1 | 2 | 3 | 4 | 'display-1' | 'display-2';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    /** Level of the element, for the outline of the page. Defaults to 2. */
    level?: HeadingLevel;
    /**
     * Visual size, independent of the level, like Bootstrap's `.h1` and `.display-1`. Defaults to
     * the level, and to 4 for levels 5 and 6.
     */
    size?: HeadingSize;
}

/** A heading, styled by the heading tokens of the theme. */
export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
    const Element = `h${level}` as const;
    const visualSize = size ?? Math.min(level, 4);
    return (
        <Element
            {...props}
            className={cx(
                'panneau-heading',
                styles.heading,
                styles[`size-${visualSize}`],
                className,
            )}
        />
    );
}
