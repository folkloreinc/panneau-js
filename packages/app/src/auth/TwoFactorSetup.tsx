import { useState } from 'react';

import { PasswordConfirmationError, RateLimitedError } from '@panneau/data';
import { appMessages } from '@panneau/intl';
import type {
    RecoveryCodes as RecoveryCodesResponse,
    TwoFactorSetup as Setup,
} from '@panneau/protocol';
import { Alert, Button, TextInput, usePanneauIntl } from '@panneau/ui';

import { AuthForm } from './AuthLayout';
import { usePasswordConfirmation } from './ConfirmPasswordDialog';
import styles from './LoginPage.module.css';
import { RecoveryCodes } from './RecoveryCodes';

export interface TwoFactorSetupProps {
    /** Starts the setup: a new secret (`POST /account/two-factor`). */
    onEnable: () => Promise<Setup>;
    /** Turns it on with a code, and gives the recovery codes. */
    onConfirm: (code: string) => Promise<RecoveryCodesResponse>;
    /** Confirms the password, when an operation needs it. Without it, those operations fail. */
    onConfirmPassword?: ((password: string) => Promise<void>) | undefined;
    /** It is on, and the user kept the recovery codes. */
    onDone: () => void;
}

type Step =
    | { name: 'start'; error: string | null }
    | { name: 'scan'; setup: Setup }
    | { name: 'codes'; codes: readonly string[] };

/** The QR code of the setup, an SVG document of the backend, as an image: a script in it can't run. */
function qrCodeSource(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Sets up two-factor authentication (decision 0049): a secret to add to an authenticator app, as a
 * QR code and as a key, a code to confirm it, then the recovery codes. Each operation asks for the
 * password when the backend needs it.
 */
export function TwoFactorSetup({
    onEnable,
    onConfirm,
    onConfirmPassword,
    onDone,
}: TwoFactorSetupProps) {
    const intl = usePanneauIntl();
    const [step, setStep] = useState<Step>({ name: 'start', error: null });
    const [pending, setPending] = useState(false);
    const [code, setCode] = useState('');
    const confirmation = usePasswordConfirmation(onConfirmPassword);
    const start = () => {
        setPending(true);
        confirmation
            .run(onEnable)
            .then(
                (setup) => setStep({ name: 'scan', setup }),
                (error: unknown) =>
                    setStep({
                        name: 'start',
                        // Cancelled: nothing to say
                        error:
                            error instanceof PasswordConfirmationError
                                ? null
                                : error instanceof RateLimitedError
                                  ? error.message
                                  : intl.formatMessage(appMessages.twoFactorSetupError),
                    }),
            )
            .finally(() => setPending(false));
    };
    return (
        <>
            {step.name === 'start' ? (
                <div className={styles.section}>
                    {step.error !== null ? (
                        <Alert tone="danger" role="alert">
                            {step.error}
                        </Alert>
                    ) : null}
                    <Button variant="primary" isPending={pending} onPress={start} fullWidth>
                        {intl.formatMessage(appMessages.setUpTwoFactor)}
                    </Button>
                </div>
            ) : step.name === 'scan' ? (
                <div className={styles.section}>
                    <p className={styles.help}>{intl.formatMessage(appMessages.twoFactorScan)}</p>
                    {step.setup.qrCode !== undefined ? (
                        <img
                            className={styles.qrCode}
                            src={qrCodeSource(step.setup.qrCode)}
                            alt={intl.formatMessage(appMessages.twoFactorQrCode)}
                        />
                    ) : null}
                    <dl className={styles.key}>
                        <dt>{intl.formatMessage(appMessages.twoFactorKey)}</dt>
                        <dd>
                            <code>{step.setup.secret}</code>
                        </dd>
                    </dl>
                    <a className={styles.link} href={step.setup.otpauthUrl}>
                        {intl.formatMessage(appMessages.openInApp)}
                    </a>
                    <AuthForm
                        fields={['code']}
                        submitLabel={intl.formatMessage(appMessages.confirm)}
                        errorMessage={intl.formatMessage(appMessages.twoFactorSetupError)}
                        onSubmit={() =>
                            confirmation
                                .run(() => onConfirm(code.trim()))
                                .then(({ recoveryCodes }) =>
                                    setStep({ name: 'codes', codes: recoveryCodes }),
                                )
                        }
                    >
                        {(errors) => (
                            <TextInput
                                label={intl.formatMessage(appMessages.authenticationCode)}
                                name="code"
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                isRequired
                                value={code}
                                onChange={setCode}
                                errors={errors.fields.code}
                            />
                        )}
                    </AuthForm>
                </div>
            ) : (
                <>
                    <RecoveryCodes codes={step.codes} />
                    <Button variant="primary" onPress={onDone} fullWidth>
                        {intl.formatMessage(appMessages.done)}
                    </Button>
                </>
            )}
            {confirmation.dialog}
        </>
    );
}
