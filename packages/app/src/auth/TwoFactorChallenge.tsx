import { useState } from 'react';

import type { TwoFactorAnswer } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import { Button, TextInput, usePanneauIntl } from '@panneau/ui';

import { AuthForm, AuthLayout } from './AuthLayout';
import styles from './LoginPage.module.css';

export interface TwoFactorChallengeProps {
    name?: string | undefined;
    /** Ends the login. Rejects with a `ValidationError` for a wrong code. */
    onAnswer: (answer: TwoFactorAnswer) => Promise<void>;
    /** Goes back to the login form. */
    onBack: () => void;
}

/**
 * The second step of a password login with two-factor authentication (decision 0049): a code of
 * the authenticator app, or a recovery code.
 */
export function TwoFactorChallenge({ name, onAnswer, onBack }: TwoFactorChallengeProps) {
    const intl = usePanneauIntl();
    const [recovery, setRecovery] = useState(false);
    const [code, setCode] = useState('');
    const field = recovery ? 'recoveryCode' : 'code';
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.twoFactorTitle)}>
            <p className={styles.help}>
                {intl.formatMessage(
                    recovery ? appMessages.twoFactorRecoveryHelp : appMessages.twoFactorCodeHelp,
                )}
            </p>
            <AuthForm
                // A new form for the other kind of code: its errors don't carry over
                key={field}
                fields={[field]}
                submitLabel={intl.formatMessage(appMessages.verify)}
                errorMessage={intl.formatMessage(appMessages.twoFactorError)}
                onSubmit={() =>
                    onAnswer(recovery ? { recoveryCode: code.trim() } : { code: code.trim() })
                }
            >
                {(errors) => (
                    <TextInput
                        label={intl.formatMessage(
                            recovery ? appMessages.recoveryCode : appMessages.authenticationCode,
                        )}
                        name={field}
                        autoComplete="one-time-code"
                        inputMode={recovery ? 'text' : 'numeric'}
                        isRequired
                        autoFocus
                        value={code}
                        onChange={setCode}
                        errors={errors.fields[field]}
                    />
                )}
            </AuthForm>
            <div className={styles.links}>
                <Button
                    appearance="ghost"
                    size="sm"
                    onPress={() => {
                        setRecovery(!recovery);
                        setCode('');
                    }}
                >
                    {intl.formatMessage(
                        recovery ? appMessages.useAuthenticationCode : appMessages.useRecoveryCode,
                    )}
                </Button>
                <Button appearance="ghost" size="sm" onPress={onBack}>
                    {intl.formatMessage(appMessages.backToLogIn)}
                </Button>
            </div>
        </AuthLayout>
    );
}
