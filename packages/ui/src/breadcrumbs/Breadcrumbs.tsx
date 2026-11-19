import { ChevronRight, Ellipsis } from 'lucide-react';
import {
    Breadcrumb as AriaBreadcrumb,
    Breadcrumbs as AriaBreadcrumbs,
    Link,
} from 'react-aria-components';

import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { Skeleton } from '../skeleton/Skeleton';
import { cx } from '../utils/cx';
import styles from './Breadcrumbs.module.css';

/** A page in `Breadcrumbs`. */
export interface BreadcrumbItem {
    id: string | number;
    /** `undefined` while it loads, such as the title of an item: the crumb is a skeleton. */
    label: string | undefined;
    /** Where the crumb goes, through the app's router. The last one, the current page, has none. */
    href?: string | undefined;
}

export interface BreadcrumbsProps {
    /** The pages from the top to the current one, which is last. */
    items: readonly BreadcrumbItem[];
    /**
     * The most crumbs shown: the first one, a "…" button with a menu of the folded ones, and the
     * last ones. At least 3. All of them by default.
     */
    maxItems?: number | undefined;
    /** Names the navigation. Defaults to "Breadcrumbs". */
    label?: string | undefined;
    className?: string | undefined;
}

type Crumb = { kind: 'item'; item: BreadcrumbItem } | { kind: 'folded'; items: BreadcrumbItem[] };

function getCrumbs(items: readonly BreadcrumbItem[], maxItems: number | undefined): Crumb[] {
    const max = maxItems !== undefined ? Math.max(3, Math.floor(maxItems)) : Infinity;
    if (items.length <= max) {
        return items.map((item) => ({ kind: 'item', item }));
    }
    const [first, ...rest] = items;
    const tail = rest.slice(rest.length - (max - 2));
    const folded = rest.slice(0, rest.length - tail.length);
    return [
        ...(first !== undefined ? [{ kind: 'item', item: first } as const] : []),
        { kind: 'folded', items: folded },
        ...tail.map((item) => ({ kind: 'item', item }) as const),
    ];
}

/**
 * Where a page is among its parents: a link to each one, and the current page last. With
 * `maxItems`, the middle ones fold into a menu. A crumb whose label loads is a skeleton, and says
 * that it loads to screen readers: the region of the page that loads announces it (decision 0034).
 * When the line is too short, the label of the current page is cut first.
 */
export function Breadcrumbs({ items, maxItems, label, className }: BreadcrumbsProps) {
    const intl = usePanneauIntl();
    const name = label ?? intl.formatMessage(messages.breadcrumbs);
    const crumbs = getCrumbs(items, maxItems);
    const loading = intl.formatMessage(messages.loading);
    return (
        <nav aria-label={name} className={cx('panneau-breadcrumbs', styles.breadcrumbs, className)}>
            <AriaBreadcrumbs aria-label={name} className={styles.list}>
                {crumbs.map((crumb, index) => {
                    const last = index === crumbs.length - 1;
                    const separator = last ? null : (
                        <span className={styles.separator}>
                            <Icon icon={ChevronRight} size="sm" />
                        </span>
                    );
                    if (crumb.kind === 'folded') {
                        return (
                            <AriaBreadcrumb
                                id="panneau-folded"
                                key="folded"
                                className={styles.item}
                            >
                                <MenuTrigger>
                                    <IconButton
                                        icon={Ellipsis}
                                        label={intl.formatMessage(messages.moreBreadcrumbs)}
                                        size="sm"
                                    />
                                    <Menu>
                                        {crumb.items.map((item) => (
                                            <MenuItem key={item.id} id={item.id} href={item.href}>
                                                {item.label ?? loading}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </MenuTrigger>
                                {separator}
                            </AriaBreadcrumb>
                        );
                    }
                    return (
                        <AriaBreadcrumb
                            id={crumb.item.id}
                            key={crumb.item.id}
                            className={styles.item}
                        >
                            <Link href={last ? undefined : crumb.item.href} className={styles.link}>
                                {crumb.item.label !== undefined ? (
                                    <span className={styles.label} title={crumb.item.label}>
                                        {crumb.item.label}
                                    </span>
                                ) : (
                                    <>
                                        <Skeleton width="8rem" className={styles.skeleton} />
                                        <span className={styles.hidden}>{loading}</span>
                                    </>
                                )}
                            </Link>
                            {separator}
                        </AriaBreadcrumb>
                    );
                })}
            </AriaBreadcrumbs>
        </nav>
    );
}
