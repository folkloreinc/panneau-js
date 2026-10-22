import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-aria-components';

import { Heading, Icon } from '@panneau/ui';

import styles from './pages.module.css';

export interface PageHeaderProps {
    title: ReactNode;
    /** A link to the parent page, above the title. */
    back?: { href: string; label: string };
    /** Buttons and links at the end of the header. */
    actions?: ReactNode;
}

/** The title of a page, with a link to its parent page and its actions. */
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

/** A link that looks like the primary button. */
export function LinkButton({ href, icon, children }: LinkButtonProps) {
    return (
        <Link href={href} className={styles.linkButton}>
            {icon}
            {children}
        </Link>
    );
}
