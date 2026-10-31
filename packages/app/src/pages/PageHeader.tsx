import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-aria-components';

import { Heading, Icon } from '@panneau/ui';

import { cx } from '../cx';
import styles from './pages.module.css';

export interface PageLayoutProps {
    /**
     * The width of the page: `default` for lists and the home page, `narrow` for forms and
     * details. The page is centered in the window either way.
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
    /** A link to the parent page, above the title. */
    back?: { href: string; label: string };
    /** Buttons and links at the end of the header. */
    actions?: ReactNode;
}

/**
 * The header of a page: its title, a link to its parent page above it, and its actions at the end,
 * as the pages of resources have it.
 */
export function PageHeader({ title, back, actions }: PageHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                {back !== undefined ? (
                    <Link href={back.href} className={styles.back}>
                        <Icon icon={ChevronLeft} size="sm" />
                        {back.label}
                    </Link>
                ) : null}
                <Heading level={1}>{title}</Heading>
            </div>
            {actions !== undefined ? <div className={styles.headerActions}>{actions}</div> : null}
        </header>
    );
}

export interface LinkButtonProps {
    href: string;
    icon?: ReactNode;
    children: ReactNode;
}

/** A link that looks like the primary button, for the actions of a `PageHeader`. */
export function LinkButton({ href, icon, children }: LinkButtonProps) {
    return (
        <Link href={href} className={styles.linkButton}>
            {icon}
            {children}
        </Link>
    );
}
