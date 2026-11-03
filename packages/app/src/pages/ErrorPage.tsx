import { CloudOff, Lock, SearchX, ServerCrash, TriangleAlert, WifiOff } from 'lucide-react';
import { useEffect, useEffectEvent, useSyncExternalStore } from 'react';

import { ForbiddenError, NetworkError, NotFoundError } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import { Button, Heading, Icon, type IconComponent, LinkButton, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { useDocumentTitle } from '../documentTitle';
import styles from './ErrorPage.module.css';

/**
 * What went wrong:
 *
 * - `not-found`: the path, the resource or the item doesn't exist (`404`);
 * - `forbidden`: the user can't see it (`403`, or a resource they can't list);
 * - `server-error`: the server failed (`5xx`, or an answer the app can't read);
 * - `offline`: the request got no answer, the browser being offline or the server unreachable;
 * - `error`: the page itself failed while it rendered.
 */
export type ErrorPageKind = 'not-found' | 'forbidden' | 'server-error' | 'offline' | 'error';

/** The kind of error page for an error of the data adapter. */
export function getErrorPageKind(error: unknown): ErrorPageKind {
    if (error instanceof NotFoundError) {
        return 'not-found';
    }
    if (error instanceof ForbiddenError) {
        return 'forbidden';
    }
    if (error instanceof NetworkError) {
        return 'offline';
    }
    return 'server-error';
}

export interface ErrorPageProps {
    /** What went wrong: `getErrorPageKind(error)` for an error of the data adapter. */
    kind: ErrorPageKind;
    /**
     * Tries again what failed: a button, and, for `offline`, a call when the browser is back
     * online. Without it, the page has no button to try again.
     */
    onRetry?: () => void;
    /** The path of the home page, for a link back to it. Without it, the page has no such link. */
    homeHref?: string;
    /** A class name for the page (`panneau-error-page-root`). */
    className?: string;
}

const ICONS: Record<ErrorPageKind, IconComponent> = {
    'not-found': SearchX,
    forbidden: Lock,
    'server-error': ServerCrash,
    offline: WifiOff,
    error: TriangleAlert,
};

function subscribeToOnline(onChange: () => void) {
    window.addEventListener('online', onChange);
    window.addEventListener('offline', onChange);
    return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
    };
}

/**
 * A page in place of content that couldn't be shown, in the look of the shell: an icon, a title,
 * what happened, and what the user can do (try again, go back home). The tab takes its title.
 * Without an answer from the server, it says whether the browser is offline, and tries again once
 * it is back online.
 */
export function ErrorPage({ kind, onRetry, homeHref, className }: ErrorPageProps) {
    const intl = usePanneauIntl();
    const online = useSyncExternalStore(
        subscribeToOnline,
        () => navigator.onLine,
        () => true,
    );
    const retry = useEffectEvent(() => onRetry?.());
    useEffect(() => {
        if (kind !== 'offline') {
            return undefined;
        }
        window.addEventListener('online', retry);
        return () => window.removeEventListener('online', retry);
    }, [kind]);

    const messages = {
        'not-found': { title: appMessages.notFound, text: appMessages.notFoundText },
        forbidden: { title: appMessages.forbidden, text: appMessages.forbiddenText },
        'server-error': { title: appMessages.serverError, text: appMessages.serverErrorText },
        offline: online
            ? { title: appMessages.unreachable, text: appMessages.unreachableText }
            : { title: appMessages.offline, text: appMessages.offlineText },
        error: { title: appMessages.pageError, text: appMessages.pageErrorText },
    };
    const { title, text } = messages[kind];
    const heading = intl.formatMessage(title);
    useDocumentTitle([heading]);
    // Failures that happen on a page already shown are announced; the others come with the
    // navigation, which moves focus to the title.
    const announced = kind === 'server-error' || kind === 'offline' || kind === 'error';
    // What is missing or forbidden stays so
    const canRetry = onRetry !== undefined && kind !== 'not-found' && kind !== 'forbidden';
    return (
        <div role={announced ? 'alert' : undefined} className={cx(styles.root, className)}>
            <span className={styles.icon} aria-hidden="true">
                <Icon icon={kind === 'offline' && online ? CloudOff : ICONS[kind]} size="lg" />
            </span>
            <Heading level={1}>{heading}</Heading>
            <p className={styles.text}>{intl.formatMessage(text)}</p>
            {canRetry || homeHref !== undefined ? (
                <div className={styles.buttons}>
                    {canRetry ? (
                        <Button variant="primary" onPress={onRetry}>
                            {intl.formatMessage(appMessages.retry)}
                        </Button>
                    ) : null}
                    {homeHref !== undefined ? (
                        <LinkButton href={homeHref} variant={canRetry ? 'secondary' : 'primary'}>
                            {intl.formatMessage(appMessages.backHome)}
                        </LinkButton>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
