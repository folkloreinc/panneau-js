import { type ReactNode, useId } from 'react';

import { cx } from '../utils/cx';
import styles from './Card.module.css';

export interface CardProps {
    /** Title in the header. */
    title?: ReactNode;
    /** Heading level of the title. Defaults to 2. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Content at the end of the header: actions, a status. */
    actions?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    /** Element of the card: `section` (default) with a title, `div` otherwise. */
    as?: 'section' | 'div' | 'article';
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
}

/** A surface that groups related content, with an optional header and footer. */
export function Card({
    title,
    headingLevel = 2,
    actions,
    children,
    footer,
    as,
    className,
    headerClassName,
    bodyClassName,
    footerClassName,
}: CardProps) {
    const titleId = useId();
    const hasTitle = title !== undefined && title !== null;
    const Element = as ?? (hasTitle ? 'section' : 'div');
    const Heading = `h${headingLevel}` as const;
    return (
        <Element
            className={cx(styles.card, className)}
            aria-labelledby={hasTitle && Element !== 'div' ? titleId : undefined}
        >
            {hasTitle || (actions !== undefined && actions !== null) ? (
                <header className={cx(styles.header, headerClassName)}>
                    {hasTitle ? (
                        <Heading id={titleId} className={styles.title}>
                            {title}
                        </Heading>
                    ) : (
                        <span />
                    )}
                    {actions}
                </header>
            ) : null}
            <div className={cx(styles.body, bodyClassName)}>{children}</div>
            {footer !== undefined && footer !== null ? (
                <footer className={cx(styles.footer, footerClassName)}>{footer}</footer>
            ) : null}
        </Element>
    );
}
