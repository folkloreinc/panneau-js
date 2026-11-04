import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { PasswordConfirmationError } from '@panneau/data';
import { queryKeys, useDataAdapter } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import type { Definition, User } from '@panneau/protocol';
import {
    Alert,
    Button,
    Card,
    LoadingRegion,
    Skeleton,
    TextInput,
    usePanneauIntl,
    useToast,
} from '@panneau/ui';

import { AuthForm } from '../auth/AuthLayout';
import { usePasswordConfirmation } from '../auth/ConfirmPasswordDialog';
import { RecoveryCodes } from '../auth/RecoveryCodes';
import { TwoFactorSetup } from '../auth/TwoFactorSetup';
import { useDocumentTitle } from '../documentTitle';
import { PageHeader, PageLayout } from './PageHeader';
import styles from './pages.module.css';

/** The skeleton of a form of the account: its fields. */
function FormSkeleton({ fields }: { fields: number }) {
    return (
        <LoadingRegion className={styles.accountForm}>
            {Array.from({ length: fields }, (_, index) => (
                <Skeleton key={index} shape="rect" height={56} />
            ))}
        </LoadingRegion>
    );
}

/** The name and the email of the user, saved together. */
function ProfileForm({ user }: { user: User }) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const queryClient = useQueryClient();
    const toasts = useToast();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email ?? '');
    return (
        <AuthForm
            fields={['name', 'email']}
            submitLabel={intl.formatMessage(appMessages.saveAccount)}
            errorMessage={intl.formatMessage(appMessages.accountSaveError)}
            onSubmit={async () => {
                const saved = await adapter.updateAccount?.({ name, email });
                if (saved !== undefined) {
                    queryClient.setQueryData(queryKeys.account(), saved);
                }
                toasts.show({
                    title: intl.formatMessage(appMessages.accountSaved),
                    tone: 'success',
                });
                // The name in the sidebar; a new email may need to be verified
                await queryClient.invalidateQueries({ queryKey: queryKeys.definition() });
            }}
        >
            {(errors) => (
                <>
                    <TextInput
                        label={intl.formatMessage(appMessages.name)}
                        name="name"
                        autoComplete="name"
                        isRequired
                        value={name}
                        onChange={setName}
                        errors={errors.fields.name}
                    />
                    <TextInput
                        label={intl.formatMessage(appMessages.email)}
                        type="email"
                        name="email"
                        autoComplete="email"
                        isRequired
                        value={email}
                        onChange={setEmail}
                        errors={errors.fields.email}
                    />
                </>
            )}
        </AuthForm>
    );
}

function ProfileSection() {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const query = useQuery({
        queryKey: queryKeys.account(),
        queryFn: ({ signal }) =>
            adapter.getAccount?.({ signal }) ?? Promise.reject(new Error('No account.')),
    });
    return (
        <Card title={intl.formatMessage(appMessages.accountProfile)}>
            {query.data !== undefined ? (
                <ProfileForm user={query.data} />
            ) : query.isError ? (
                <Alert tone="danger" role="alert">
                    {intl.formatMessage(appMessages.accountLoadError)}
                </Alert>
            ) : (
                <FormSkeleton fields={2} />
            )}
        </Card>
    );
}

function PasswordSection() {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const toasts = useToast();
    // A new form after each change: its fields start empty
    const [changes, setChanges] = useState(0);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    return (
        <Card title={intl.formatMessage(appMessages.password)}>
            <AuthForm
                key={changes}
                fields={['currentPassword', 'password', 'confirmation']}
                submitLabel={intl.formatMessage(appMessages.changePassword)}
                errorMessage={intl.formatMessage(appMessages.resetPasswordError)}
                check={(): Record<string, string[]> =>
                    password !== confirmation
                        ? { confirmation: [intl.formatMessage(appMessages.passwordsDiffer)] }
                        : {}
                }
                onSubmit={async () => {
                    await adapter.updatePassword?.({ currentPassword, password });
                    toasts.show({
                        title: intl.formatMessage(appMessages.passwordChanged),
                        tone: 'success',
                    });
                    setCurrentPassword('');
                    setPassword('');
                    setConfirmation('');
                    setChanges(changes + 1);
                }}
            >
                {(errors) => (
                    <>
                        <TextInput
                            label={intl.formatMessage(appMessages.currentPassword)}
                            type="password"
                            name="current-password"
                            autoComplete="current-password"
                            isRequired
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            errors={errors.fields.currentPassword}
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
        </Card>
    );
}

/** Two-factor authentication that is on: new recovery codes, and turning it off. */
function TwoFactorEnabled({ required }: { required: boolean }) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const queryClient = useQueryClient();
    const toasts = useToast();
    const confirmation = usePasswordConfirmation(
        adapter.confirmPassword !== undefined
            ? (password) => adapter.confirmPassword?.(password) ?? Promise.resolve()
            : undefined,
    );
    const [codes, setCodes] = useState<readonly string[] | null>(null);
    const [pending, setPending] = useState<'codes' | 'off' | null>(null);
    const failed = (error: unknown) => {
        // The password dialog was cancelled: nothing happened
        if (!(error instanceof PasswordConfirmationError)) {
            toasts.show({ title: intl.formatMessage(appMessages.twoFactorError), tone: 'danger' });
        }
    };
    const regenerate = () => {
        setPending('codes');
        confirmation
            .run(
                () => adapter.regenerateRecoveryCodes?.() ?? Promise.reject(new Error('No codes.')),
            )
            .then(({ recoveryCodes }) => setCodes(recoveryCodes), failed)
            .finally(() => setPending(null));
    };
    const turnOff = () => {
        setPending('off');
        confirmation
            .run(() => adapter.disableTwoFactor?.() ?? Promise.resolve())
            .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.twoFactor() }), failed)
            .finally(() => setPending(null));
    };
    return (
        <div className={styles.accountForm}>
            <Alert tone="success">{intl.formatMessage(appMessages.twoFactorOn)}</Alert>
            {codes !== null ? <RecoveryCodes codes={codes} /> : null}
            <div className={styles.accountActions}>
                {adapter.regenerateRecoveryCodes !== undefined ? (
                    <Button isPending={pending === 'codes'} onPress={regenerate}>
                        {intl.formatMessage(appMessages.newRecoveryCodes)}
                    </Button>
                ) : null}
                {!required && adapter.disableTwoFactor !== undefined ? (
                    <Button
                        tone="danger"
                        appearance="outline"
                        isPending={pending === 'off'}
                        onPress={turnOff}
                    >
                        {intl.formatMessage(appMessages.turnOffTwoFactor)}
                    </Button>
                ) : null}
            </div>
            {required ? (
                <p className={styles.accountHelp}>
                    {intl.formatMessage(appMessages.twoFactorRequired)}
                </p>
            ) : null}
            {confirmation.dialog}
        </div>
    );
}

function TwoFactorSection() {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: queryKeys.twoFactor(),
        queryFn: ({ signal }) =>
            adapter.getTwoFactor?.({ signal }) ?? Promise.reject(new Error('No two-factor.')),
    });
    const status = query.data;
    return (
        <Card title={intl.formatMessage(appMessages.twoFactorTitle)}>
            {status === undefined ? (
                query.isError ? (
                    <Alert tone="danger" role="alert">
                        {intl.formatMessage(appMessages.accountLoadError)}
                    </Alert>
                ) : (
                    <FormSkeleton fields={1} />
                )
            ) : status.status === 'enabled' ? (
                <TwoFactorEnabled required={status.required} />
            ) : (
                <div className={styles.accountForm}>
                    <p className={styles.accountHelp}>
                        {intl.formatMessage(appMessages.twoFactorOffHelp)}
                    </p>
                    <TwoFactorSetup
                        onEnable={() =>
                            adapter.enableTwoFactor?.() ?? Promise.reject(new Error('No setup.'))
                        }
                        onConfirm={(code) =>
                            adapter.confirmTwoFactor?.(code) ??
                            Promise.reject(new Error('No setup.'))
                        }
                        onConfirmPassword={
                            adapter.confirmPassword !== undefined
                                ? (password) =>
                                      adapter.confirmPassword?.(password) ?? Promise.resolve()
                                : undefined
                        }
                        onDone={() =>
                            void queryClient.invalidateQueries({ queryKey: queryKeys.twoFactor() })
                        }
                    />
                </div>
            )}
        </Card>
    );
}

/**
 * The account page of the user (`{basePath}/account`, decision 0050), with `auth.account`: their
 * name and email, their password, and their two-factor authentication, each in its own section
 * with its own save. A section shows only when the adapter and the definition offer it.
 */
export function AccountPage({ definition }: { definition: Definition }) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const auth = definition.auth;
    const title = intl.formatMessage(appMessages.account);
    useDocumentTitle([title]);
    const password =
        (auth?.password ?? auth?.token === undefined) && adapter.updatePassword !== undefined;
    const twoFactor =
        auth?.twoFactor === true &&
        adapter.getTwoFactor !== undefined &&
        adapter.enableTwoFactor !== undefined &&
        adapter.confirmTwoFactor !== undefined;
    return (
        <PageLayout width="narrow">
            <PageHeader title={title} />
            {adapter.getAccount !== undefined && adapter.updateAccount !== undefined ? (
                <ProfileSection />
            ) : null}
            {password ? <PasswordSection /> : null}
            {twoFactor ? <TwoFactorSection /> : null}
        </PageLayout>
    );
}
