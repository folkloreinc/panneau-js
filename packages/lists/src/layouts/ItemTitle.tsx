import type { ReactNode } from 'react';
import { Link } from 'react-aria-components';

import styles from './link.module.css';

/**
 * The title of an item, as a link to it when the list has one. Links go through React Aria, so an
 * app's `RouterProvider` handles them with its router.
 */
export function ItemTitle({ href, children }: { href: string | null; children: ReactNode }) {
    if (href === null) {
        return children;
    }
    return (
        <Link className={styles.link} href={href}>
            {children}
        </Link>
    );
}
