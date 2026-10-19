import type { HTMLAttributes } from 'react';

import {
    type Responsive,
    type Space,
    responsiveVariables,
    space,
    withVariables,
} from '../layout/responsive';
import { cx } from '../utils/cx';
import styles from './Grid.module.css';
import itemStyles from './GridItem.module.css';

export interface GridProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?: 'div' | 'section' | 'ul' | 'ol' | 'dl';
    /** Number of equal columns: `3`, or `{ base: 1, md: 2, lg: 3 }`. Defaults to 1. */
    columns?: Responsive<number>;
    /**
     * Minimum width of a cell (`'16rem'`): as many columns as fit, like `repeat(auto-fit, ...)`.
     * It replaces `columns`.
     */
    minItemWidth?: string;
    /** Space between cells, from the space scale. Defaults to the `--panneau-grid-gap` token. */
    gap?: Responsive<Space>;
    /** Vertical alignment of the cells in their row. Defaults to `stretch`. */
    align?: Responsive<'start' | 'center' | 'end' | 'stretch'>;
}

/** Cells in columns: a fixed number per breakpoint, or as many as fit. */
export function Grid({
    as: Element = 'div',
    columns,
    minItemWidth,
    gap,
    align,
    className,
    style,
    ...props
}: GridProps) {
    return (
        <Element
            {...props}
            className={cx(
                'panneau-grid',
                styles.grid,
                minItemWidth !== undefined && styles.auto,
                className,
            )}
            style={withVariables(
                [
                    responsiveVariables('grid', 'columns', columns, (count) =>
                        String(Math.max(1, Math.floor(count))),
                    ),
                    minItemWidth !== undefined
                        ? { '--_panneau-grid-min-item-width': minItemWidth }
                        : {},
                    responsiveVariables('grid', 'gap', gap, space),
                    responsiveVariables('grid', 'align', align, String),
                ],
                style,
            )}
        />
    );
}

export interface GridItemProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?: 'div' | 'section' | 'article' | 'li';
    /** Columns the cell spans: a number, or `full` for the whole row. Defaults to 1. */
    span?: Responsive<number | 'full'>;
}

/** A cell of a `Grid` that spans several columns, per breakpoint. */
export function GridItem({ as: Element = 'div', span, className, style, ...props }: GridItemProps) {
    return (
        <Element
            {...props}
            className={cx('panneau-grid-item', itemStyles['grid-item'], className)}
            style={withVariables(
                [
                    responsiveVariables('grid-item', 'span', span, (value) =>
                        value === 'full' ? '1 / -1' : `span ${Math.max(1, Math.floor(value))}`,
                    ),
                ],
                style,
            )}
        />
    );
}
