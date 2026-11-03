import { useState } from 'react';

import type { LoginCredentials } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import type { Auth } from '@panneau/protocol';
import { Alert, Button, Checkbox, LinkButton, TextInput, usePanneauIntl } from '@panneau/ui';

import { AuthForm, AuthLayout } from './AuthLayout';
import styles from './LoginPage.module.css';

/** What the login page says above its forms, after another auth page sent the user to it. */
export type LoginNotice = 'password-reset' | 'email-verified';

export interface LoginPageProps {
    /** The auth settings: which logins the page offers. */
    auth: Auth;
    /** The name of the app, above the title, when the definition is known. */
    name?: string;
    /** The session ended while the user was in the app: the page says so. */
    sessionEnded?: boolean;
    /** What happened before: the password was reset, or the email address verified. */
    notice?: LoginNotice;
    /** The email the password form starts with, such as that of a password that was reset. */
    email?: string;
    /** Logs in. Rejects with a `ValidationError` for credentials the backend refuses. */
    onLogIn: (credentials: LoginCredentials) => Promise<void>;
    /**
     * Asks for a link that resets the password of an address (decision 0048). With it, and
     * `auth.passwordReset`, the password form has a "Forgot your password?" link.
     */
    onForgotPassword?: (email: string) => Promise<void>;
}

function PasswordForm({
    email,
    onEmailChange,
    onLogIn,
    onForgotPassword,
}: Pick<LoginPageProps, 'onLogIn'> & {
    email: string;
    onEmailChange: (email: string) => void;
    onForgotPassword: (() => void) | null;
}) {
    const intl = usePanneauIntl();
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    return (
        <AuthForm
            fields={['email', 'password']}
            submitLabel={intl.formatMessage(appMessages.logIn)}
            errorMessage={intl.formatMessage(appMessages.logInError)}
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
                        onChange={onEmailChange}
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
                    <div className={styles.options}>
                        <Checkbox isSelected={remember} onChange={setRemember}>
                            {intl.formatMessage(appMessages.remember)}
                        </Checkbox>
                        {onForgotPassword !== null ? (
                            <Button appearance="ghost" size="sm" onPress={onForgotPassword}>
                                {intl.formatMessage(appMessages.forgotPassword)}
                            </Button>
                        ) : null}
                    </div>
                </>
            )}
        </AuthForm>
    );
}

function TokenForm({
    token: settings,
    onLogIn,
}: Pick<LoginPageProps, 'onLogIn'> & { token: NonNullable<Auth['token']> }) {
    const intl = usePanneauIntl();
    const [token, setToken] = useState('');
    return (
        <AuthForm
            fields={['token']}
            submitLabel={intl.formatMessage(appMessages.logIn)}
            errorMessage={intl.formatMessage(appMessages.logInError)}
            onSubmit={() => onLogIn({ token })}
        >
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
        </AuthForm>
    );
}

/**
 * The form that asks for a link to reset the password of an address, in place of the login
 * forms. Once sent, it says that the link is on its way, whether or not the address has an
 * account: the backend doesn't tell.
 */
function ForgotPassword({
    name,
    email,
    onEmailChange,
    onSend,
    onBack,
}: {
    name: string | undefined;
    email: string;
    onEmailChange: (email: string) => void;
    onSend: (email: string) => Promise<void>;
    onBack: () => void;
}) {
    const intl = usePanneauIntl();
    const [sent, setSent] = useState(false);
    const back = (
        <Button appearance="ghost" onPress={onBack} fullWidth>
            {intl.formatMessage(appMessages.backToLogIn)}
        </Button>
    );
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.forgotPasswordTitle)}>
            {sent ? (
                <Alert tone="success" role="status">
                    {intl.formatMessage(appMessages.resetLinkSent)}
                </Alert>
            ) : (
                <>
                    <p className={styles.help}>
                        {intl.formatMessage(appMessages.forgotPasswordHelp)}
                    </p>
                    <AuthForm
                        fields={['email']}
                        submitLabel={intl.formatMessage(appMessages.sendResetLink)}
                        errorMessage={intl.formatMessage(appMessages.sendError)}
                        onSubmit={() => onSend(email).then(() => setSent(true))}
                    >
                        {(errors) => (
                            <TextInput
                                label={intl.formatMessage(appMessages.email)}
                                type="email"
                                name="email"
                                autoComplete="username"
                                isRequired
                                value={email}
                                onChange={onEmailChange}
                                errors={errors.fields.email}
                            />
                        )}
                    </AuthForm>
                </>
            )}
            {back}
        </AuthLayout>
    );
}

const NOTICES = {
    'password-reset': appMessages.passwordWasReset,
    'email-verified': appMessages.emailWasVerified,
} as const;

/**
 * The login page of the `panneau` auth mode: a form for an email and a password, a form for a token
 * (`auth.token`), and a button for each OAuth provider, as the auth settings say. The password
 * form shows when `auth.password` is true, or when neither `password` nor `token` is set. With
 * `auth.passwordReset` and `onForgotPassword`, it links to a form that asks for a reset link.
 */
export function LoginPage({
    auth,
    name,
    sessionEnded = false,
    notice,
    email: initialEmail = '',
    onLogIn,
    onForgotPassword,
}: LoginPageProps) {
    const intl = usePanneauIntl();
    const [email, setEmail] = useState(initialEmail);
    const [forgot, setForgot] = useState(false);
    const password = auth.password ?? auth.token === undefined;
    const canReset = password && auth.passwordReset === true && onForgotPassword !== undefined;
    if (forgot && canReset) {
        return (
            <ForgotPassword
                name={name}
                email={email}
                onEmailChange={setEmail}
                onSend={onForgotPassword}
                onBack={() => setForgot(false)}
            />
        );
    }
    const providers = (auth.providers ?? []).filter((provider) => provider.url !== undefined);
    const sections = [
        password ? (
            <PasswordForm
                key="password"
                email={email}
                onEmailChange={setEmail}
                onLogIn={onLogIn}
                onForgotPassword={canReset ? () => setForgot(true) : null}
            />
        ) : null,
        auth.token !== undefined ? (
            <TokenForm key="token" token={auth.token} onLogIn={onLogIn} />
        ) : null,
        providers.length > 0 ? (
            <div key="providers" className={styles.providers}>
                {providers.map((provider) => (
                    <LinkButton key={provider.id} href={provider.url ?? ''} variant="primary">
                        {intl.formatMessage(appMessages.logInWith, { provider: provider.label })}
                    </LinkButton>
                ))}
            </div>
        ) : null,
    ].filter((section) => section !== null);
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.logIn)}>
            {notice !== undefined ? (
                <Alert tone="success" role="status">
                    {intl.formatMessage(NOTICES[notice])}
                </Alert>
            ) : sessionEnded ? (
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
        </AuthLayout>
    );
}
