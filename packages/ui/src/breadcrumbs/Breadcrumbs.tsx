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
import { cx } from '../utils/cx';
import styles from './Breadcrumbs.module.css';

/** A page in `Breadcrumbs`. */
export interface BreadcrumbItem {
    id: string | number;
    label: string;
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
 * `maxItems`, the middle ones fold into a menu.
 */
export function Breadcrumbs({ items, maxItems, label, className }: BreadcrumbsProps) {
    const intl = usePanneauIntl();
    const name = label ?? intl.formatMessage(messages.breadcrumbs);
    const crumbs = getCrumbs(items, maxItems);
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
                                                {item.label}
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
                                <span className={styles.label} title={crumb.item.label}>
                                    {crumb.item.label}
                                </span>
                            </Link>
                            {separator}
                        </AriaBreadcrumb>
                    );
                })}
            </AriaBreadcrumbs>
        </nav>
    );
}
