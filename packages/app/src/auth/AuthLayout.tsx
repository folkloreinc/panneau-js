import { type FormEvent, type ReactNode, useState } from 'react';

import { RateLimitedError, ValidationError } from '@panneau/data';
import { Alert, Button, Heading } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import styles from './LoginPage.module.css';

/**
 * The frame of the auth pages (login, password reset, email verification): a narrow column,
 * centered in the window, with the name of the app above the title when it is known.
 */
export function AuthLayout({
    name,
    title,
    children,
}: {
    name?: string | undefined;
    title: string;
    children: ReactNode;
}) {
    useDocumentTitle([title]);
    return (
        <main className={styles.page}>
            <div className={styles.panel}>
                {name !== undefined ? <p className={styles.name}>{name}</p> : null}
                <Heading level={1}>{title}</Heading>
                {children}
            </div>
        </main>
    );
}

/** Errors of the backend, by field, and a message for the others. */
export interface AuthFormErrors {
    fields: Record<string, string[]>;
    message: string | null;
}

const NO_ERRORS: AuthFormErrors = { fields: {}, message: null };

/**
 * A form of the auth pages that shows the errors of the backend: those of its fields under them,
 * and the others above the form. `check()` can refuse the values before they are sent.
 */
export function AuthForm({
    fields,
    submitLabel,
    errorMessage,
    check,
    onSubmit,
    children,
}: {
    /** The fields of the form, whose errors show under them. */
    fields: readonly string[];
    submitLabel: string;
    /** The message of an error that isn't the backend's validation or rate limit. */
    errorMessage: string;
    /** Errors found before sending, by field: the form isn't sent when there is one. */
    check?: () => Record<string, string[]>;
    onSubmit: () => Promise<void>;
    children: (errors: AuthFormErrors) => ReactNode;
}) {
    const [pending, setPending] = useState(false);
    const [errors, setErrors] = useState<AuthFormErrors>(NO_ERRORS);
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const found = check?.() ?? {};
        if (Object.keys(found).length > 0) {
            setErrors({ fields: found, message: null });
            return;
        }
        setPending(true);
        setErrors(NO_ERRORS);
        onSubmit().catch((error: unknown) => {
            const fieldErrors = error instanceof ValidationError ? error.errors : {};
            const shown = fields.some((name) => (fieldErrors[name]?.length ?? 0) > 0);
            setErrors({
                fields: fieldErrors,
                message: shown
                    ? null
                    : error instanceof ValidationError || error instanceof RateLimitedError
                      ? error.message
                      : errorMessage,
            });
            setPending(false);
        });
    };
    return (
        <form className={styles.form} onSubmit={submit} noValidate>
            {errors.message !== null ? (
                <Alert tone="danger" role="alert">
                    {errors.message}
                </Alert>
            ) : null}
            {children(errors)}
            <Button type="submit" variant="primary" isPending={pending} fullWidth>
                {submitLabel}
            </Button>
        </form>
    );
}
