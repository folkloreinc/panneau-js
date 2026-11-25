import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppWindow, Check, Copy, KeyRound } from 'lucide-react';
import { type FormEvent, useId, useRef, useState } from 'react';

import {
    ApiError,
    PasswordConfirmationError,
    RateLimitedError,
    ValidationError,
} from '@panneau/data';
import { queryKeys, useDataAdapter } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import type { Connection, ConnectionTokenResponse } from '@panneau/protocol';
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Dialog,
    LoadingRegion,
    Skeleton,
    TextInput,
    Tile,
    TileGroup,
    usePanneauIntl,
    useToast,
} from '@panneau/ui';

import { usePasswordConfirmation } from '../auth/ConfirmPasswordDialog';
import styles from './pages.module.css';

/** A value to copy (an address, a token): read-only, with a button that copies it. */
function CopyField({
    label,
    value,
    copyLabel,
    autoFocus = false,
}: {
    label: string;
    value: string;
    /** The name of the button, which says what it copies. */
    copyLabel: string;
    autoFocus?: boolean;
}) {
    const intl = usePanneauIntl();
    const [copied, setCopied] = useState(false);
    const copy = () => {
        void navigator.clipboard.writeText(value).then(
            () => setCopied(true),
            () => undefined,
        );
    };
    return (
        <div className={styles.copyField}>
            <TextInput
                label={label}
                value={value}
                isReadOnly
                className={styles.copyFieldInput}
                inputClassName={styles.copyFieldValue}
            />
            <Button
                icon={copied ? Check : Copy}
                autoFocus={autoFocus}
                onPress={copy}
                aria-label={copied ? intl.formatMessage(appMessages.copied) : copyLabel}
            >
                {intl.formatMessage(copied ? appMessages.copied : appMessages.copy)}
            </Button>
        </div>
    );
}

/**
 * A connection of the list: its name, a personal token or an app, read or read and change, when
 * it was made, last used (only when the backend knows) and when it expires.
 */
function ConnectionTile({
    connection,
    pending,
    onRevoke,
}: {
    connection: Connection;
    pending: boolean;
    onRevoke: (() => void) | undefined;
}) {
    const intl = usePanneauIntl();
    const date = (value: string) => intl.formatDate(value, { dateStyle: 'medium' });
    const details = [
        intl.formatMessage(
            connection.type === 'client'
                ? appMessages.connectionClient
                : appMessages.connectionToken,
        ),
        intl.formatMessage(
            connection.write ? appMessages.connectionWrite : appMessages.connectionRead,
        ),
        intl.formatMessage(appMessages.connectionCreated, {
            date: date(connection.createdAt),
        }),
        // Null when unused, or when the backend doesn't record use: say nothing (0113)
        connection.lastUsedAt !== null
            ? intl.formatMessage(appMessages.connectionUsed, {
                  date: date(connection.lastUsedAt),
              })
            : null,
        connection.expiresAt !== null
            ? intl.formatMessage(appMessages.connectionExpires, {
                  date: date(connection.expiresAt),
              })
            : intl.formatMessage(appMessages.connectionNeverExpires),
    ]
        .filter((part) => part !== null)
        .join(' · ');
    return (
        <Tile
            icon={connection.type === 'client' ? AppWindow : KeyRound}
            title={connection.name}
            actions={
                onRevoke !== undefined ? (
                    <Button
                        tone="danger"
                        appearance="ghost"
                        size="sm"
                        isPending={pending}
                        onPress={onRevoke}
                        aria-label={intl.formatMessage(appMessages.revokeConnectionNamed, {
                            name: connection.name,
                        })}
                    >
                        {intl.formatMessage(appMessages.revokeConnection)}
                    </Button>
                ) : null
            }
        >
            {/* In the content of the tile, not its description: the details wrap, they don't cut */}
            <p className={styles.connectionDetails}>{details}</p>
        </Tile>
    );
}

/** Asks before revoking a connection, by its name; the safe choice has the focus (0095). */
function RevokeDialog({
    connection,
    onConfirm,
    onCancel,
}: {
    connection: Connection;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const intl = usePanneauIntl();
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            role="alertdialog"
            isDismissable={false}
            size="sm"
            title={intl.formatMessage(appMessages.revokeConnectionTitle, {
                name: connection.name,
            })}
            footer={
                <>
                    <Button appearance="ghost" autoFocus onPress={onCancel}>
                        {intl.formatMessage(appMessages.cancel)}
                    </Button>
                    <Button tone="danger" onPress={onConfirm}>
                        {intl.formatMessage(appMessages.revokeConnection)}
                    </Button>
                </>
            }
        >
            <p className={styles.accountHelp}>
                {intl.formatMessage(
                    connection.type === 'client'
                        ? appMessages.revokeClientMessage
                        : appMessages.revokeTokenMessage,
                )}
            </p>
        </Dialog>
    );
}

/** The errors of the form of a new token: by field, and a message for the others. */
interface TokenErrors {
    fields: Record<string, string[]>;
    message: string | null;
}

/**
 * Makes a personal token: its name and whether it can change content, then the token, shown once.
 * The token lives in the state of this dialog alone: closing it forgets it.
 */
function NewTokenDialog({ onMade, onClose }: { onMade: () => void; onClose: () => void }) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const confirmation = usePasswordConfirmation(
        adapter.confirmPassword !== undefined
            ? (password) => adapter.confirmPassword?.(password) ?? Promise.resolve()
            : undefined,
    );
    const formId = useId();
    const [name, setName] = useState('');
    const [write, setWrite] = useState(false);
    const [pending, setPending] = useState(false);
    const [errors, setErrors] = useState<TokenErrors>({ fields: {}, message: null });
    const [made, setMade] = useState<ConnectionTokenResponse | null>(null);
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);
        setErrors({ fields: {}, message: null });
        confirmation
            .run(
                () =>
                    adapter.createConnectionToken?.({ name: name.trim(), write }) ??
                    Promise.reject(new Error('No tokens.')),
            )
            .then(
                (response) => {
                    setMade(response);
                    onMade();
                },
                (error: unknown) => {
                    setPending(false);
                    // The password dialog was cancelled: nothing happened
                    if (error instanceof PasswordConfirmationError) {
                        return;
                    }
                    const fields = error instanceof ValidationError ? error.errors : {};
                    const shown = (fields.name?.length ?? 0) + (fields.write?.length ?? 0) > 0;
                    setErrors({
                        fields,
                        message: shown
                            ? null
                            : error instanceof ValidationError || error instanceof RateLimitedError
                              ? error.message
                              : error instanceof ApiError && error.status === 409
                                ? intl.formatMessage(appMessages.tokensUnavailable)
                                : intl.formatMessage(appMessages.tokenError),
                    });
                },
            );
    };
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            // Once made, the token is closed with "Done" or Escape, not by a stray click
            isDismissable={made === null}
            size="sm"
            title={intl.formatMessage(appMessages.newToken)}
            footer={
                made !== null ? (
                    <Button tone="accent" onPress={onClose}>
                        {intl.formatMessage(appMessages.done)}
                    </Button>
                ) : (
                    <>
                        <Button appearance="ghost" onPress={onClose}>
                            {intl.formatMessage(appMessages.cancel)}
                        </Button>
                        <Button type="submit" form={formId} tone="accent" isPending={pending}>
                            {intl.formatMessage(appMessages.makeToken)}
                        </Button>
                    </>
                )
            }
        >
            {made !== null ? (
                <div className={styles.accountForm}>
                    <Alert tone="warning">{intl.formatMessage(appMessages.tokenMadeHelp)}</Alert>
                    <CopyField
                        label={intl.formatMessage(appMessages.token)}
                        value={made.token}
                        copyLabel={intl.formatMessage(appMessages.copyToken)}
                        autoFocus
                    />
                </div>
            ) : (
                <form id={formId} className={styles.accountForm} onSubmit={submit} noValidate>
                    {errors.message !== null ? (
                        <Alert tone="danger" role="alert">
                            {errors.message}
                        </Alert>
                    ) : null}
                    <TextInput
                        label={intl.formatMessage(appMessages.tokenName)}
                        name="token-name"
                        autoComplete="off"
                        isRequired
                        autoFocus
                        value={name}
                        onChange={setName}
                        errors={errors.fields.name}
                    />
                    <Checkbox
                        isSelected={write}
                        onChange={setWrite}
                        description={intl.formatMessage(appMessages.tokenWriteHelp)}
                        errors={errors.fields.write}
                    >
                        {intl.formatMessage(appMessages.tokenWrite)}
                    </Checkbox>
                </form>
            )}
            {confirmation.dialog}
        </Dialog>
    );
}

/**
 * The connections of the user to the MCP server (decisions 0090 and 0113), with `agents.mcp`: the
 * address of the server to copy, the personal tokens and the apps that let agents in, revoking
 * one, and making a personal token when the definition allows it (`agents.mcp.tokens`).
 */
export function ConnectionsSection({ url, tokens }: { url: string; tokens: boolean }) {
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
        queryKey: queryKeys.connections(),
        queryFn: ({ signal }) =>
            adapter.listConnections?.({ signal }) ?? Promise.reject(new Error('No connections.')),
    });
    const list = useRef<HTMLDivElement>(null);
    const [asking, setAsking] = useState<Connection | null>(null);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [making, setMaking] = useState(false);
    const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.connections() });
    const revoke = (connection: Connection) => {
        setAsking(null);
        setRevoking(connection.id);
        confirmation
            .run(() => adapter.revokeConnection?.(connection.id) ?? Promise.resolve())
            .then(refresh)
            .then(
                // Its button is gone with it: the focus goes to the list
                () => list.current?.focus(),
                (error: unknown) => {
                    // The password dialog was cancelled: nothing happened
                    if (!(error instanceof PasswordConfirmationError)) {
                        toasts.show({
                            title: intl.formatMessage(appMessages.revokeConnectionError),
                            tone: 'danger',
                        });
                    }
                },
            )
            .finally(() => setRevoking(null));
    };
    const canRevoke = adapter.revokeConnection !== undefined;
    const canMake = tokens && adapter.createConnectionToken !== undefined;
    return (
        <Card title={intl.formatMessage(appMessages.connections)}>
            <div className={styles.accountForm}>
                <p className={styles.accountHelp}>
                    {intl.formatMessage(appMessages.connectionsHelp)}
                </p>
                <CopyField
                    label={intl.formatMessage(appMessages.mcpServerUrl)}
                    value={url}
                    copyLabel={intl.formatMessage(appMessages.copyMcpServerUrl)}
                />
                {query.data === undefined ? (
                    query.isError ? (
                        <Alert tone="danger" role="alert">
                            {intl.formatMessage(appMessages.accountLoadError)}
                        </Alert>
                    ) : (
                        <LoadingRegion className={styles.accountForm}>
                            <Skeleton shape="rect" height={56} />
                        </LoadingRegion>
                    )
                ) : (
                    <div ref={list} tabIndex={-1} className={styles.connections}>
                        {query.data.length > 0 ? (
                            <TileGroup
                                appearance="outline"
                                label={intl.formatMessage(appMessages.connections)}
                            >
                                {query.data.map((connection) => (
                                    <ConnectionTile
                                        key={connection.id}
                                        connection={connection}
                                        pending={revoking === connection.id}
                                        onRevoke={
                                            canRevoke ? () => setAsking(connection) : undefined
                                        }
                                    />
                                ))}
                            </TileGroup>
                        ) : (
                            <p className={styles.accountHelp}>
                                {intl.formatMessage(appMessages.noConnections)}
                            </p>
                        )}
                    </div>
                )}
                {canMake ? (
                    <div className={styles.accountActions}>
                        <Button icon={KeyRound} onPress={() => setMaking(true)}>
                            {intl.formatMessage(appMessages.newToken)}
                        </Button>
                    </div>
                ) : null}
            </div>
            {asking !== null ? (
                <RevokeDialog
                    connection={asking}
                    onConfirm={() => revoke(asking)}
                    onCancel={() => setAsking(null)}
                />
            ) : null}
            {making ? (
                <NewTokenDialog onMade={() => void refresh()} onClose={() => setMaking(false)} />
            ) : null}
            {confirmation.dialog}
        </Card>
    );
}
