import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-aria-components';

import { appMessages } from '@panneau/intl';
import { Breadcrumbs, Heading, Icon, Skeleton, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { usePageParents } from '../pageRoute';
import type { PageParent } from '../parents';
import styles from './pages.module.css';

export interface PageLayoutProps {
    /**
     * The width of the page: `default` for lists, the home page and forms with a sidebar,
     * `narrow` for other forms and details. The page is centered in the window either way.
     */
    width?: 'default' | 'narrow';
    className?: string;
    children?: ReactNode;
}

/**
 * The column of a page of the app, as resource pages have it: its width, and the space between
 * its header and its sections. For the pages of plugins, with a `PageHeader` first.
 */
export function PageLayout({ width = 'default', className, children }: PageLayoutProps) {
    return (
        <div className={cx(styles.page, width === 'narrow' && styles.narrow, className)}>
            {children}
        </div>
    );
}

export interface PageHeaderProps {
    /** The title, in the page's only `h1`. */
    title: ReactNode;
    /**
     * The parents of the page, from the top (decision 0093): a link to the nearest one above the
     * title, or with two or more, the breadcrumbs of all of them and of the page, from 48rem of the
     * root. Defaults to the parents of the route the app renders; `[]` shows none.
     */
    parents?: readonly PageParent[];
    /** The label of the page in its breadcrumbs, when `title` isn't a string. */
    crumbLabel?: string;
    /** The title loads, such as the title of an item: it is a skeleton, and its crumb too. */
    isLoading?: boolean;
    /** Buttons and links at the end of the header. */
    actions?: ReactNode;
}

/** The most crumbs in the header: the first parent, "…", the nearest parent and the page. */
const MAX_CRUMBS = 4;

/**
 * The header of a page: its title, its parents above it, and its actions at the end, as the pages
 * of resources have it. One parent is a link to it. Two or more are breadcrumbs, from 48rem of the
 * root, and a link to the nearest one below (decision 0093).
 */
export function PageHeader({
    title,
    parents,
    crumbLabel,
    isLoading = false,
    actions,
}: PageHeaderProps) {
    const intl = usePanneauIntl();
    const routeParents = usePageParents();
    const list = parents ?? routeParents;
    const nearest = list.at(-1);
    const label =
        crumbLabel ??
        (typeof title === 'string' || typeof title === 'number' ? String(title) : undefined);
    // A page without a label of its own shows the link to its nearest parent at every width.
    const hasTrail = list.length > 1 && (isLoading || label !== undefined);
    const backLink =
        nearest !== undefined ? (
            <Link href={nearest.href} className={cx(styles.back, hasTrail && styles.narrowOnly)}>
                <Icon icon={ChevronLeft} size="sm" />
                {nearest.label ?? (
                    <>
                        <Skeleton width="6rem" />
                        <span className={styles.hidden}>
                            {intl.formatMessage(appMessages.loading)}
                        </span>
                    </>
                )}
            </Link>
        ) : null;
    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                {hasTrail ? (
                    <Breadcrumbs
                        className={styles.wideOnly}
                        maxItems={MAX_CRUMBS}
                        items={[
                            ...list.map((parent) => ({
                                id: parent.href,
                                label: parent.label,
                                href: parent.href,
                            })),
                            { id: 'panneau-current-page', label: isLoading ? undefined : label },
                        ]}
                    />
                ) : null}
                {backLink}
                <Heading level={1}>
                    {isLoading ? (
                        <>
                            <Skeleton width="16rem" className={styles.titleSkeleton} />
                            <span className={styles.hidden}>
                                {intl.formatMessage(appMessages.loading)}
                            </span>
                        </>
                    ) : (
                        title
                    )}
                </Heading>
            </div>
            {actions !== undefined ? <div className={styles.headerActions}>{actions}</div> : null}
        </header>
    );
}
