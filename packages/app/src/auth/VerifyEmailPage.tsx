import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { RateLimitedError, ValidationError } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import { Alert, Button, Spinner, usePanneauIntl } from '@panneau/ui';

import { AuthLayout } from './AuthLayout';
import styles from './LoginPage.module.css';

export interface VerifyEmailPageProps {
    /** The name of the app, above the title, when it is known. */
    name?: string;
    /** Emails a new link. Without it, the page has no button to send one. */
    onSend?: () => Promise<void>;
    /** The user verified their address, in another tab or on another device: the app loads. */
    onContinue: () => void;
    /** Logs out. Without it, the page has no button to log out. */
    onLogOut?: () => void;
}

type Sending = { status: 'idle' | 'pending' | 'sent' } | { status: 'failed'; message: string };

/**
 * The page of a user whose email address isn't verified, when the backend refuses them with the
 * problem of `auth.emailVerification` (decision 0048): a button that sends a new link, one that
 * continues once the address is verified, and a logout.
 */
export function VerifyEmailPage({ name, onSend, onContinue, onLogOut }: VerifyEmailPageProps) {
    const intl = usePanneauIntl();
    const [sending, setSending] = useState<Sending>({ status: 'idle' });
    const send = () => {
        if (onSend === undefined) {
            return;
        }
        setSending({ status: 'pending' });
        onSend().then(
            () => setSending({ status: 'sent' }),
            (error: unknown) =>
                setSending({
                    status: 'failed',
                    message:
                        error instanceof RateLimitedError || error instanceof ValidationError
                            ? error.message
                            : intl.formatMessage(appMessages.sendError),
                }),
        );
    };
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.verifyEmailTitle)}>
            <p className={styles.help}>{intl.formatMessage(appMessages.verifyEmailHelp)}</p>
            {sending.status === 'sent' ? (
                <Alert tone="success" role="status">
                    {intl.formatMessage(appMessages.verificationLinkSent)}
                </Alert>
            ) : sending.status === 'failed' ? (
                <Alert tone="danger" role="alert">
                    {sending.message}
                </Alert>
            ) : null}
            <div className={styles.form}>
                <Button variant="primary" onPress={onContinue} fullWidth>
                    {intl.formatMessage(appMessages.continue)}
                </Button>
                {onSend !== undefined ? (
                    <Button isPending={sending.status === 'pending'} onPress={send} fullWidth>
                        {intl.formatMessage(appMessages.sendVerificationLink)}
                    </Button>
                ) : null}
                {onLogOut !== undefined ? (
                    <Button appearance="ghost" onPress={onLogOut} fullWidth>
                        {intl.formatMessage(appMessages.logOut)}
                    </Button>
                ) : null}
            </div>
        </AuthLayout>
    );
}

export interface EmailVerificationLinkPageProps {
    /** The name of the app, above the title, when it is known. */
    name?: string;
    /** The token of the link. Without it, the page says that the link is incomplete. */
    token: string | null;
    /** Verifies the address. Rejects with a `ValidationError` for a wrong or expired token. */
    onVerify: (token: string) => Promise<void>;
    /** Goes on to the app, or to its login page. */
    onContinue: () => void;
}

type Verification = { status: 'pending' | 'verified' } | { status: 'failed'; message: string };

/**
 * The page that a link of an email verification opens (`{basePath}/auth/verify-email`, decision
 * 0048): it verifies the address as it opens, once, and says whether it worked.
 */
export function EmailVerificationLinkPage({
    name,
    token,
    onVerify,
    onContinue,
}: EmailVerificationLinkPageProps) {
    const intl = usePanneauIntl();
    const missing = token === null || token === '';
    const [verification, setVerification] = useState<Verification>(() =>
        missing
            ? { status: 'failed', message: intl.formatMessage(appMessages.verifyLinkIncomplete) }
            : { status: 'pending' },
    );
    const verify = useEffectEvent((value: string) => {
        onVerify(value).then(
            () => setVerification({ status: 'verified' }),
            (error: unknown) =>
                setVerification({
                    status: 'failed',
                    message:
                        error instanceof ValidationError
                            ? (Object.values(error.errors)[0]?.[0] ?? error.message)
                            : error instanceof RateLimitedError
                              ? error.message
                              : intl.formatMessage(appMessages.verifyEmailError),
                }),
        );
    });
    // Once per token: a development remount doesn't send it again.
    const sent = useRef<string | null>(null);
    useEffect(() => {
        if (token !== null && token !== '' && sent.current !== token) {
            sent.current = token;
            verify(token);
        }
    }, [token]);
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.verifyEmailTitle)}>
            {verification.status === 'pending' ? (
                <Spinner
                    size="sm"
                    showLabel
                    label={intl.formatMessage(appMessages.verifyingEmail)}
                />
            ) : verification.status === 'verified' ? (
                <Alert tone="success" role="status">
                    {intl.formatMessage(appMessages.emailWasVerified)}
                </Alert>
            ) : (
                <Alert tone="danger" role="alert">
                    {verification.status === 'failed' ? verification.message : null}
                </Alert>
            )}
            <Button
                variant="primary"
                onPress={onContinue}
                isDisabled={verification.status === 'pending'}
                fullWidth
            >
                {intl.formatMessage(appMessages.continue)}
            </Button>
        </AuthLayout>
    );
}
