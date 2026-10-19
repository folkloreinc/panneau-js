import type { HTMLAttributes } from 'react';

import {
    type Justification,
    type Responsive,
    type Space,
    justification,
    responsiveVariables,
    space,
    withVariables,
} from '../layout/responsive';
import { cx } from '../utils/cx';
import styles from './Inline.module.css';

export interface InlineProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'ul' | 'ol' | 'span';
    /** Space between items, from the space scale. Defaults to the `--panneau-inline-gap` token. */
    gap?: Responsive<Space>;
    /** Vertical alignment of the items. Defaults to `center`. */
    align?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
    /** Horizontal distribution of the items. Defaults to `start`. */
    justify?: Responsive<Justification>;
    /** Items wrap to the next line when they don't fit. Defaults to `true`. */
    wrap?: boolean;
}

/** Items side by side, wrapping when they don't fit, like Bootstrap's `.hstack`. */
export function Inline({
    as: Element = 'div',
    gap,
    align,
    justify,
    wrap = true,
    className,
    style,
    ...props
}: InlineProps) {
    return (
        <Element
            {...props}
            className={cx('panneau-inline', styles.inline, !wrap && styles.nowrap, className)}
            style={withVariables(
                [
                    responsiveVariables('inline', 'gap', gap, space),
                    responsiveVariables('inline', 'align', align, String),
                    responsiveVariables('inline', 'justify', justify, justification),
                ],
                style,
            )}
        />
    );
}
