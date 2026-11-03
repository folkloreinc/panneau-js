import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { PasswordConfirmationError, ValidationError } from '@panneau/data';
import { queryKeys, useDataAdapter } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import type { Definition, Passkey, User } from '@panneau/protocol';
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
import {
    createPasskey,
    defaultPasskeyName,
    isPasskeyCancelled,
    supportsPasskeys,
} from '../auth/webauthn';
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

/** A passkey of the list: its name, what keeps it, when it was added and last used. */
function PasskeyRow({
    passkey,
    pending,
    onRemove,
}: {
    passkey: Passkey;
    pending: boolean;
    onRemove: () => void;
}) {
    const intl = usePanneauIntl();
    const date = (value: string) => intl.formatDate(value, { dateStyle: 'medium' });
    return (
        <li className={styles.passkey}>
            <div>
                <p className={styles.passkeyName}>{passkey.name}</p>
                <p className={styles.accountHelp}>
                    {[
                        passkey.authenticator ?? null,
                        intl.formatMessage(appMessages.passkeyAdded, {
                            date: date(passkey.createdAt),
                        }),
                        passkey.lastUsedAt !== null
                            ? intl.formatMessage(appMessages.passkeyUsed, {
                                  date: date(passkey.lastUsedAt),
                              })
                            : intl.formatMessage(appMessages.passkeyNeverUsed),
                    ]
                        .filter((part) => part !== null)
                        .join(' · ')}
                </p>
            </div>
            <Button
                tone="danger"
                appearance="ghost"
                size="sm"
                isPending={pending}
                onPress={onRemove}
                aria-label={intl.formatMessage(appMessages.removePasskeyNamed, {
                    name: passkey.name,
                })}
            >
                {intl.formatMessage(appMessages.removePasskey)}
            </Button>
        </li>
    );
}

/** The passkeys of the user (decision 0051): the list, a form that adds one, and removing one. */
function PasskeysSection() {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const queryClient = useQueryClient();
    const toasts = useToast();
    const confirmation = usePasswordConfirmation(
        adapter.confirmPassword !== undefined
            ? (password) => adapter.confirmPassword?.(password) ?? Promise.resolve()
            : undefined,
    );
    const query = useQuery({
        queryKey: queryKeys.passkeys(),
        queryFn: ({ signal }) =>
            adapter.listPasskeys?.({ signal }) ?? Promise.reject(new Error('No passkeys.')),
    });
    const [name, setName] = useState(() => defaultPasskeyName());
    const [removing, setRemoving] = useState<string | null>(null);
    const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
    const failed = (error: unknown) => {
        if (error instanceof PasswordConfirmationError || isPasskeyCancelled(error)) {
            return;
        }
        toasts.show({
            title:
                error instanceof ValidationError
                    ? (Object.values(error.errors)[0]?.[0] ?? error.message)
                    : intl.formatMessage(appMessages.passkeyError),
            tone: 'danger',
        });
    };
    const remove = (passkey: Passkey) => {
        setRemoving(passkey.id);
        confirmation
            .run(() => adapter.deletePasskey?.(passkey.id) ?? Promise.resolve())
            .then(refresh, failed)
            .finally(() => setRemoving(null));
    };
    const canAdd =
        supportsPasskeys() &&
        adapter.passkeyRegistrationOptions !== undefined &&
        adapter.addPasskey !== undefined;
    return (
        <Card title={intl.formatMessage(appMessages.passkeys)}>
            <div className={styles.accountForm}>
                <p className={styles.accountHelp}>{intl.formatMessage(appMessages.passkeysHelp)}</p>
                {query.data === undefined ? (
                    query.isError ? (
                        <Alert tone="danger" role="alert">
                            {intl.formatMessage(appMessages.accountLoadError)}
                        </Alert>
                    ) : (
                        <FormSkeleton fields={1} />
                    )
                ) : query.data.length > 0 ? (
                    <ul
                        className={styles.passkeys}
                        aria-label={intl.formatMessage(appMessages.passkeys)}
                    >
                        {query.data.map((passkey) => (
                            <PasskeyRow
                                key={passkey.id}
                                passkey={passkey}
                                pending={removing === passkey.id}
                                onRemove={() => remove(passkey)}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className={styles.accountHelp}>
                        {intl.formatMessage(appMessages.noPasskeys)}
                    </p>
                )}
                {canAdd ? (
                    <AuthForm
                        fields={['name', 'credential']}
                        submitLabel={intl.formatMessage(appMessages.addPasskey)}
                        errorMessage={intl.formatMessage(appMessages.passkeyError)}
                        onSubmit={() =>
                            confirmation
                                .run(
                                    () =>
                                        adapter.passkeyRegistrationOptions?.() ??
                                        Promise.reject(new Error('No passkeys.')),
                                )
                                .then(({ options }) => createPasskey(options))
                                .then((credential) =>
                                    adapter.addPasskey?.({ name: name.trim(), credential }),
                                )
                                .then(refresh)
                                .catch((error: unknown) => {
                                    // Cancelled, in the browser or in the password dialog
                                    if (
                                        !isPasskeyCancelled(error) &&
                                        !(error instanceof PasswordConfirmationError)
                                    ) {
                                        throw error;
                                    }
                                })
                        }
                    >
                        {(errors) => (
                            <TextInput
                                label={intl.formatMessage(appMessages.passkeyName)}
                                name="passkey-name"
                                isRequired
                                value={name}
                                onChange={setName}
                                errors={errors.fields.name ?? errors.fields.credential}
                            />
                        )}
                    </AuthForm>
                ) : null}
            </div>
            {confirmation.dialog}
        </Card>
    );
}

/**
 * The account page of the user (`{basePath}/account`, decision 0050), with `auth.account`: their
 * name and email, their password, their two-factor authentication and their passkeys (decision
 * 0051), each in its own section
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
            {auth?.passkeys === true && adapter.listPasskeys !== undefined ? (
                <PasskeysSection />
            ) : null}
        </PageLayout>
    );
}
