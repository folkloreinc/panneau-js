import { appMessages } from '@panneau/intl';
import { Heading, LinkButton, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import styles from './pages.module.css';

export interface ForbiddenPageProps {
    homeHref: string;
}

/**
 * The page of a route the user can't open (decision 0042): a resource they can't list, a create
 * route without `create`, a page with `view: false`, or a request that answered `403`.
 */
export function ForbiddenPage({ homeHref }: ForbiddenPageProps) {
    const intl = usePanneauIntl();
    useDocumentTitle([intl.formatMessage(appMessages.forbidden)]);
    return (
        <div className={styles.center}>
            <Heading level={1}>{intl.formatMessage(appMessages.forbidden)}</Heading>
            <p className={styles.intro}>{intl.formatMessage(appMessages.forbiddenText)}</p>
            <LinkButton href={homeHref} variant="primary">
                {intl.formatMessage(appMessages.backHome)}
            </LinkButton>
        </div>
    );
}
