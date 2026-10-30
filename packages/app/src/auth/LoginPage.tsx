import { type FormEvent, type ReactNode, useState } from 'react';

import { type LoginCredentials, ValidationError } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import type { Auth } from '@panneau/protocol';
import { Alert, Button, Checkbox, Heading, TextInput, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { LinkButton } from '../pages/PageHeader';
import styles from './LoginPage.module.css';

export interface LoginPageProps {
    /** The auth settings: which logins the page offers. */
    auth: Auth;
    /** The name of the app, above the title, when the definition is known. */
    name?: string;
    /** The session ended while the user was in the app: the page says so. */
    sessionEnded?: boolean;
    /** Logs in. Rejects with a `ValidationError` for credentials the backend refuses. */
    onLogIn: (credentials: LoginCredentials) => Promise<void>;
}

/** Errors of the backend, by field, and a message for the others. */
interface LoginErrors {
    fields: Record<string, string[]>;
    message: string | null;
}

const NO_ERRORS: LoginErrors = { fields: {}, message: null };

/**
 * A form that logs in, and shows the errors of the backend: those of its fields under them, and
 * the others above the form.
 */
function LoginForm({
    fields,
    onSubmit,
    children,
}: {
    fields: readonly string[];
    onSubmit: () => Promise<void>;
    children: (errors: LoginErrors) => ReactNode;
}) {
    const intl = usePanneauIntl();
    const [pending, setPending] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>(NO_ERRORS);
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);
        setErrors(NO_ERRORS);
        onSubmit().catch((error: unknown) => {
            const fieldErrors = error instanceof ValidationError ? error.errors : {};
            const shown = fields.some((name) => (fieldErrors[name]?.length ?? 0) > 0);
            setErrors({
                fields: fieldErrors,
                message: shown
                    ? null
                    : error instanceof ValidationError
                      ? error.message
                      : intl.formatMessage(appMessages.logInError),
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
                {intl.formatMessage(appMessages.logIn)}
            </Button>
        </form>
    );
}

function PasswordForm({ onLogIn }: Pick<LoginPageProps, 'onLogIn'>) {
    const intl = usePanneauIntl();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    return (
        <LoginForm
            fields={['email', 'password']}
            onSubmit={() => onLogIn({ email, password, remember })}
        >
            {(errors) => (
                <>
                    <TextInput
                        label={intl.formatMessage(appMessages.email)}
                        type="email"
                        name="email"
                        autoComplete="username"
                        isRequired
                        value={email}
                        onChange={setEmail}
                        errors={errors.fields.email}
                    />
                    <TextInput
                        label={intl.formatMessage(appMessages.password)}
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        isRequired
                        value={password}
                        onChange={setPassword}
                        errors={errors.fields.password}
                    />
                    <Checkbox isSelected={remember} onChange={setRemember}>
                        {intl.formatMessage(appMessages.remember)}
                    </Checkbox>
                </>
            )}
        </LoginForm>
    );
}

function TokenForm({
    token: settings,
    onLogIn,
}: Pick<LoginPageProps, 'onLogIn'> & { token: NonNullable<Auth['token']> }) {
    const intl = usePanneauIntl();
    const [token, setToken] = useState('');
    return (
        <LoginForm fields={['token']} onSubmit={() => onLogIn({ token })}>
            {(errors) => (
                <TextInput
                    label={settings.label ?? intl.formatMessage(appMessages.token)}
                    description={settings.help}
                    type="password"
                    name="token"
                    autoComplete="current-password"
                    isRequired
                    value={token}
                    onChange={setToken}
                    errors={errors.fields.token}
                />
            )}
        </LoginForm>
    );
}

/**
 * The login page of the `panneau` auth mode: a form for an email and a password, a form for a token
 * (`auth.token`), and a button for each OAuth provider, as the auth settings say. The password
 * form shows when `auth.password` is true, or when neither `password` nor `token` is set.
 */
export function LoginPage({ auth, name, sessionEnded = false, onLogIn }: LoginPageProps) {
    const intl = usePanneauIntl();
    useDocumentTitle([intl.formatMessage(appMessages.logIn)]);
    const password = auth.password ?? auth.token === undefined;
    const providers = (auth.providers ?? []).filter((provider) => provider.url !== undefined);
    const sections = [
        password ? <PasswordForm key="password" onLogIn={onLogIn} /> : null,
        auth.token !== undefined ? (
            <TokenForm key="token" token={auth.token} onLogIn={onLogIn} />
        ) : null,
        providers.length > 0 ? (
            <div key="providers" className={styles.providers}>
                {providers.map((provider) => (
                    <LinkButton key={provider.id} href={provider.url ?? ''}>
                        {intl.formatMessage(appMessages.logInWith, { provider: provider.label })}
                    </LinkButton>
                ))}
            </div>
        ) : null,
    ].filter((section) => section !== null);
    return (
        <main className={styles.page}>
            <div className={styles.panel}>
                {name !== undefined ? <p className={styles.name}>{name}</p> : null}
                <Heading level={1}>{intl.formatMessage(appMessages.logIn)}</Heading>
                {sessionEnded ? (
                    <Alert tone="info" role="status">
                        {intl.formatMessage(appMessages.logInAgain)}
                    </Alert>
                ) : null}
                {sections.map((section, index) => (
                    <div key={section.key} className={styles.section}>
                        {index > 0 ? (
                            <p className={styles.or}>{intl.formatMessage(appMessages.or)}</p>
                        ) : null}
                        {section}
                    </div>
                ))}
            </div>
        </main>
    );
}
