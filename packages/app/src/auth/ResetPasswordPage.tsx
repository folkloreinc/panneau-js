import { useState } from 'react';

import type { PasswordReset } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import { Alert, Button, TextInput, usePanneauIntl } from '@panneau/ui';

import { AuthForm, AuthLayout } from './AuthLayout';

export interface ResetPasswordPageProps {
    /** The name of the app, above the title, when it is known. */
    name?: string;
    /** The token of the link. Without it, the page says that the link is incomplete. */
    token: string | null;
    /** The email of the link, which the field starts with. */
    email: string | null;
    /** Sets the new password. Rejects with a `ValidationError` for a wrong token or password. */
    onReset: (reset: PasswordReset) => Promise<void>;
    /** The password was reset: the app shows its login page, with this email. */
    onDone: (email: string) => void;
    /** Goes back to the login page. */
    onBack: () => void;
}

/**
 * The page that a link of a password reset opens (`{basePath}/auth/reset-password`, decision
 * 0048): the new password, twice, sent with the token and the email of the link.
 */
export function ResetPasswordPage({
    name,
    token,
    email: linkEmail,
    onReset,
    onDone,
    onBack,
}: ResetPasswordPageProps) {
    const intl = usePanneauIntl();
    const [email, setEmail] = useState(linkEmail ?? '');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const back = (
        <Button appearance="ghost" onPress={onBack} fullWidth>
            {intl.formatMessage(appMessages.backToLogIn)}
        </Button>
    );
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.resetPasswordTitle)}>
            {token === null || token === '' ? (
                <Alert tone="danger" role="alert">
                    {intl.formatMessage(appMessages.resetLinkIncomplete)}
                </Alert>
            ) : (
                <AuthForm
                    fields={['email', 'token', 'password', 'confirmation']}
                    submitLabel={intl.formatMessage(appMessages.resetPassword)}
                    errorMessage={intl.formatMessage(appMessages.resetPasswordError)}
                    check={(): Record<string, string[]> =>
                        password !== confirmation
                            ? { confirmation: [intl.formatMessage(appMessages.passwordsDiffer)] }
                            : {}
                    }
                    onSubmit={() => onReset({ token, email, password }).then(() => onDone(email))}
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
                                errors={errors.fields.email ?? errors.fields.token}
                            />
                            <TextInput
                                label={intl.formatMessage(appMessages.newPassword)}
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                isRequired
                                value={password}
                                onChange={setPassword}
                                errors={errors.fields.password}
                            />
                            <TextInput
                                label={intl.formatMessage(appMessages.confirmPassword)}
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                isRequired
                                value={confirmation}
                                onChange={setConfirmation}
                                errors={errors.fields.confirmation}
                            />
                        </>
                    )}
                </AuthForm>
            )}
            {back}
        </AuthLayout>
    );
}
