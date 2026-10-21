import { appMessages } from '@panneau/intl';
import { Heading, usePanneauIntl } from '@panneau/ui';

import { LinkButton } from './PageHeader';
import styles from './pages.module.css';

export interface NotFoundPageProps {
    homeHref: string;
}

/** The page of the paths that match no route, resource or page. */
export function NotFoundPage({ homeHref }: NotFoundPageProps) {
    const intl = usePanneauIntl();
    return (
        <div className={styles.center}>
            <Heading level={1}>{intl.formatMessage(appMessages.notFound)}</Heading>
            <p className={styles.intro}>{intl.formatMessage(appMessages.notFoundText)}</p>
            <LinkButton href={homeHref}>{intl.formatMessage(appMessages.backHome)}</LinkButton>
        </div>
    );
}
