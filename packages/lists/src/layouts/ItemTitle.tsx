import type { ReactNode } from 'react';
import { Link } from 'react-aria-components';

import styles from './link.module.css';

/**
 * The title of an item, as a link to it when the list has one. Links go through React Aria, so an
 * app's `RouterProvider` handles them with its router.
 */
export function ItemTitle({
    href,
    current = false,
    children,
}: {
    href: string | null;
    /** The item is the one shown next to the list: its link is the current page. */
    current?: boolean;
    children: ReactNode;
}) {
    if (href === null) {
        return children;
    }
    return (
        <Link className={styles.link} href={href} aria-current={current ? 'page' : undefined}>
            {children}
        </Link>
    );
}
