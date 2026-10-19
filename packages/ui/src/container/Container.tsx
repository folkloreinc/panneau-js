import type { HTMLAttributes } from 'react';

import { cx } from '../utils/cx';
import styles from './Container.module.css';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer';
    /** Maximum width, from the `--panneau-container-width-*` tokens, or `full`. Defaults to `lg`. */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Removes the horizontal padding. */
    flush?: boolean;
}

/**
 * A centered column with a maximum width. It is a size container: responsive props inside it follow
 * its width. Like any size container, it needs a width from its parent: in a row, give it one.
 */
export function Container({
    as: Element = 'div',
    size = 'lg',
    flush = false,
    className,
    ...props
}: ContainerProps) {
    return (
        <Element
            {...props}
            className={cx(
                'panneau-container',
                styles.container,
                size !== 'full' && styles[size],
                flush && styles.flush,
                className,
            )}
        />
    );
}
