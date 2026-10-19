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
import styles from './Stack.module.css';

export interface StackProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?:
        | 'div'
        | 'section'
        | 'article'
        | 'aside'
        | 'header'
        | 'footer'
        | 'nav'
        | 'main'
        | 'ul'
        | 'ol'
        | 'form';
    /** Space between items, from the space scale. Defaults to the `--panneau-stack-gap` token. */
    gap?: Responsive<Space>;
    /** Horizontal alignment of the items. Defaults to `stretch`. */
    align?: Responsive<'start' | 'center' | 'end' | 'stretch'>;
    /** Vertical distribution of the items, when the stack is taller than them. Defaults to `start`. */
    justify?: Responsive<Justification>;
}

/** Items one under the other, with space between them, like Bootstrap's `.vstack`. */
export function Stack({
    as: Element = 'div',
    gap,
    align,
    justify,
    className,
    style,
    ...props
}: StackProps) {
    return (
        <Element
            {...props}
            className={cx('panneau-stack', styles.stack, className)}
            style={withVariables(
                [
                    responsiveVariables('stack', 'gap', gap, space),
                    responsiveVariables('stack', 'align', align, String),
                    responsiveVariables('stack', 'justify', justify, justification),
                ],
                style,
            )}
        />
    );
}
