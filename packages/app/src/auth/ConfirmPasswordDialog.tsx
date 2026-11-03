import { type FormEvent, type ReactNode, useState } from 'react';

import { PasswordConfirmationError, ValidationError } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import { Alert, Button, Dialog, TextInput, usePanneauIntl } from '@panneau/ui';

import styles from './LoginPage.module.css';

/**
 * Asks for the password of the user, for an operation that answered that it needs it
 * (`PasswordConfirmationError`, decision 0049).
 */
function ConfirmPasswordDialog({
    onConfirm,
    onCancel,
}: {
    onConfirm: (password: string) => Promise<void>;
    onCancel: () => void;
}) {
    const intl = usePanneauIntl();
    const [password, setPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [errors, setErrors] = useState<string[] | undefined>(undefined);
    const [message, setMessage] = useState<string | null>(null);
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);
        setErrors(undefined);
        setMessage(null);
        onConfirm(password).catch((error: unknown) => {
            const fieldErrors =
                error instanceof ValidationError ? error.errors.password : undefined;
            setErrors(fieldErrors);
            setMessage(
                fieldErrors !== undefined
                    ? null
                    : error instanceof ValidationError
                      ? error.message
                      : intl.formatMessage(appMessages.passwordConfirmationError),
            );
            setPending(false);
        });
    };
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            title={intl.formatMessage(appMessages.passwordConfirmationTitle)}
            size="sm"
        >
            <form className={styles.form} onSubmit={submit} noValidate>
                <p className={styles.help}>
                    {intl.formatMessage(appMessages.passwordConfirmationHelp)}
                </p>
                {message !== null ? (
                    <Alert tone="danger" role="alert">
                        {message}
                    </Alert>
                ) : null}
                <TextInput
                    label={intl.formatMessage(appMessages.password)}
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    isRequired
                    autoFocus
                    value={password}
                    onChange={setPassword}
                    errors={errors}
                />
                <div className={styles.actions}>
                    <Button appearance="ghost" onPress={onCancel}>
                        {intl.formatMessage(appMessages.cancel)}
                    </Button>
                    <Button type="submit" variant="primary" isPending={pending}>
                        {intl.formatMessage(appMessages.confirm)}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

interface Waiting {
    resolve: () => void;
    reject: (error: unknown) => void;
    error: unknown;
}

/**
 * Runs operations that may need the password: when one rejects with a
 * `PasswordConfirmationError`, `dialog` asks for the password, `confirm()` confirms it, and the
 * operation runs again. Cancelling rejects with the first error. Without `confirm`, operations run
 * once.
 */
export function usePasswordConfirmation(
    confirm: ((password: string) => Promise<void>) | undefined,
): {
    run: <T>(operation: () => Promise<T>) => Promise<T>;
    dialog: ReactNode;
} {
    const [waiting, setWaiting] = useState<Waiting | null>(null);
    const run = <T,>(operation: () => Promise<T>): Promise<T> =>
        operation().catch((error: unknown) => {
            if (!(error instanceof PasswordConfirmationError) || confirm === undefined) {
                throw error;
            }
            return new Promise<void>((resolve, reject) => {
                setWaiting({ resolve, reject, error });
            }).then(operation);
        });
    const dialog =
        waiting !== null && confirm !== undefined ? (
            <ConfirmPasswordDialog
                onConfirm={async (password) => {
                    await confirm(password);
                    setWaiting(null);
                    waiting.resolve();
                }}
                onCancel={() => {
                    setWaiting(null);
                    waiting.reject(waiting.error);
                }}
            />
        ) : null;
    return { run, dialog };
}
