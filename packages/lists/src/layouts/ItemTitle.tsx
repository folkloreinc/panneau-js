import { type ReactNode, useEffect, useRef } from 'react';
import { Link } from 'react-aria-components';

import styles from './link.module.css';

/**
 * How long the pointer rests on the link of an item before the list calls `onItemIntent`: a
 * pointer crossing rows calls nothing.
 */
export const INTENT_DELAY = 100;

/**
 * The title of an item, as a link to it when the list has one. Links go through React Aria, so an
 * app's `RouterProvider` handles them with its router.
 */
export function ItemTitle({
    href,
    current = false,
    onIntent,
    children,
}: {
    href: string | null;
    /** The item is the one shown next to the list: its link is the current page. */
    current?: boolean;
    /**
     * The user is about to open the item: the pointer rested on its link for `INTENT_DELAY`, or
     * the link got the focus. Hover from touch doesn't count.
     */
    onIntent?: (() => void) | undefined;
    children: ReactNode;
}) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancel = () => {
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    };
    useEffect(() => {
        const pending = timer;
        return () => {
            if (pending.current !== null) {
                clearTimeout(pending.current);
            }
        };
    }, []);
    if (href === null) {
        return children;
    }
    const intentProps =
        onIntent !== undefined
            ? {
                  // React Aria's hover ignores the emulated hover of touch.
                  onHoverStart: () => {
                      cancel();
                      timer.current = setTimeout(() => {
                          timer.current = null;
                          onIntent();
                      }, INTENT_DELAY);
                  },
                  onHoverEnd: cancel,
                  onFocus: () => {
                      cancel();
                      onIntent();
                  },
              }
            : {};
    return (
        <Link
            className={styles.link}
            href={href}
            aria-current={current ? 'page' : undefined}
            {...intentProps}
        >
            {children}
        </Link>
    );
}
