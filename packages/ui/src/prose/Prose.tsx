import type { HTMLAttributes } from 'react';

import { cx } from '../utils/cx';
import styles from './Prose.module.css';

export interface ProseProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?: 'div' | 'article' | 'section';
}

/**
 * Styles the elements of rich content (headings, paragraphs, lists, links, quotes, code, tables):
 * the output of an editor, Markdown, or a help page. Outside of it, Panneau styles no element.
 */
export function Prose({ as: Element = 'div', className, ...props }: ProseProps) {
    return <Element {...props} className={cx('panneau-prose', styles.prose, className)} />;
}
