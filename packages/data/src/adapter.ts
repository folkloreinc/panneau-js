import type {
    ActionRequest,
    ActionResult,
    ActionRun,
    ContextOption,
    ContextValues,
    Definition,
    EmbedValue,
    FieldCheckRequest,
    FieldCheckResponse,
    Item,
    ListQuery,
    ListResponse,
    PreviewResponse,
    RecoveryCodes,
    SearchResponse,
    Session,
    TwoFactorChallenge,
    TwoFactorSetup,
    TwoFactorStatus,
    User,
} from '@panneau/protocol';

import type { PresignedUploads } from './uploads';

/** Values of an item's fields, keyed by field name. */
export type Values = Record<string, unknown>;

export interface RequestOptions {
    /** Aborts the request. TanStack Query passes one to cancel queries. */
    signal?: AbortSignal;
}

/** Options of the global search (`GET /search`). */
export interface SearchOptions extends RequestOptions {
    /** Items per resource, from 1 to 20. The backend defaults to 5. */
    limit?: number;
    /** The searchable resources to search. Defaults to every one. */
    resources?: readonly string[];
}

export interface UpdateOptions extends RequestOptions {
    /**
     * The version of the item the values were edited from. The update fails with a
     * `ConflictError` when the item changed since. `null` or omitted: no check.
     */
    version?: string | null;
}

/** Answer of an action: its result, or a run when the backend queued it (`202`). */
export type ActionResponse =
    { result: ActionResult; run?: undefined } | { run: ActionRun; result?: undefined };

/** Credentials of a password login. */
export interface PasswordCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

/** Credentials of a login with a single secret, for definitions with `auth.token`. */
export interface TokenCredentials {
    token: string;
    remember?: boolean;
}

/** What `login()` sends: an email and a password, or a token. */
export type LoginCredentials = PasswordCredentials | TokenCredentials;

/**
 * What `login()` resolves with: the session, or `{ twoFactor: true }` when the login waits for a
 * second factor (`twoFactorChallenge()`, decision 0049).
 */
export type LoginResult = Session | TwoFactorChallenge;

/** The second factor of a login: a code of the authenticator app, or a recovery code. */
export type TwoFactorAnswer = { code: string } | { recoveryCode: string };

/** What `updateAccount()` sends: the name and the email of the current user. */
export interface AccountValues {
    name: string;
    email: string;
}

/** What `updatePassword()` sends: the current password, and the new one. */
export interface PasswordChange {
    currentPassword: string;
    password: string;
}

/** What `resetPassword()` sends: the token and the email of the link, and the new password. */
export interface PasswordReset {
    token: string;
    email: string;
    password: string;
}

/**
 * Everything Panneau needs from a backend. `createRestAdapter()` implements it over the HTTP API of
 * the protocol. A product with its own API implements it to use the engine and the app.
 *
 * Methods reject with an `ApiError` (or one of its subclasses) when the backend answers with an
 * error.
 */
export interface DataAdapter {
    /** The definition for the current user (`GET /definition`), with defaults applied. */
    getDefinition(options?: RequestOptions): Promise<Definition>;

    /** A page of items of a resource. */
    list(resource: string, query?: ListQuery, options?: RequestOptions): Promise<ListResponse>;
    /** One item. */
    get(resource: string, id: string, options?: RequestOptions): Promise<Item>;
    /** Creates an item. Rejects with a `ValidationError` when values are invalid. */
    create(resource: string, values: Values, options?: RequestOptions): Promise<Item>;
    /**
     * Updates some values of an item. With a `version`, rejects with a `ConflictError` when the
     * item changed since that version.
     */
    update(resource: string, id: string, values: Values, options?: UpdateOptions): Promise<Item>;
    /** Deletes an item. */
    delete(resource: string, id: string, options?: RequestOptions): Promise<void>;
    /**
     * Copies an item, and gives the copy (`POST /resources/{resource}/{id}/duplicate`), for the
     * built-in `duplicate` of items that allow it (decision 0040). Optional: without it, the app
     * doesn't show `duplicate`.
     */
    duplicate?(resource: string, id: string, options?: RequestOptions): Promise<Item>;

    /** Runs an action on a selection, or on the whole resource without a selection. */
    runAction(
        resource: string,
        action: string,
        request: ActionRequest,
        options?: RequestOptions,
    ): Promise<ActionResponse>;
    /** A run of a queued action, with its progress and, once finished, its result. */
    getActionRun(id: string, options?: RequestOptions): Promise<ActionRun>;
    /** The current user's recent runs. */
    listActionRuns(options?: RequestOptions): Promise<ActionRun[]>;
    /** Cancels a run that hasn't finished. */
    cancelActionRun(id: string, options?: RequestOptions): Promise<void>;

    /**
     * Direct uploads to storage through this adapter, with its headers, cookies and errors, when
     * the definition announces `"uploads": { "mode": "presigned" }`. `endpoint` is the definition's
     * `uploads.endpoint`, when the routes are not under the API. Optional: an adapter without it
     * sends files in multipart requests only. Media are items of resources of kind `media`
     * (decision 0026): `create()` makes one from `{ file: { upload } }`.
     */
    presignedUploads?(options?: { endpoint?: string }): PresignedUploads;

    /** The current session. Rejects with an `UnauthorizedError` without one. */
    getSession(options?: RequestOptions): Promise<Session>;
    /**
     * Logs in with an email and a password, or with a token (`auth.token`). Resolves with
     * `{ twoFactor: true }` when the user has two-factor authentication: the login then waits for
     * `twoFactorChallenge()`.
     */
    login(credentials: LoginCredentials, options?: RequestOptions): Promise<LoginResult>;
    /**
     * Ends a login that waits for its second factor (`POST /auth/two-factor/challenge`). Rejects
     * with a `ValidationError` for a wrong code, or a login that no longer waits. Optional:
     * without it, the app can't log in users with two-factor authentication.
     */
    twoFactorChallenge?(answer: TwoFactorAnswer, options?: RequestOptions): Promise<Session>;
    /**
     * Confirms the password of the current user (`POST /auth/password/confirm`), for the
     * operations that reject with a `PasswordConfirmationError`. Optional.
     */
    confirmPassword?(password: string, options?: RequestOptions): Promise<void>;
    /** The current user, for the account page (`GET /account`, decision 0050). Optional. */
    getAccount?(options?: RequestOptions): Promise<User>;
    /**
     * Saves the name and the email of the current user (`PATCH /account`), and gives the user.
     * Rejects with a `ValidationError` for values the backend refuses. Optional.
     */
    updateAccount?(values: AccountValues, options?: RequestOptions): Promise<User>;
    /**
     * Changes the password of the current user (`PUT /account/password`). Rejects with a
     * `ValidationError` for a wrong current password, or a new one the backend refuses. Optional.
     */
    updatePassword?(change: PasswordChange, options?: RequestOptions): Promise<void>;
    /** The two-factor authentication of the current user (`GET /account/two-factor`). Optional. */
    getTwoFactor?(options?: RequestOptions): Promise<TwoFactorStatus>;
    /** Starts setting it up: a new secret, to confirm with `confirmTwoFactor()`. Optional. */
    enableTwoFactor?(options?: RequestOptions): Promise<TwoFactorSetup>;
    /** Turns it on with a code of the authenticator app, and gives the recovery codes. Optional. */
    confirmTwoFactor?(code: string, options?: RequestOptions): Promise<RecoveryCodes>;
    /** Turns it off. Optional. */
    disableTwoFactor?(options?: RequestOptions): Promise<void>;
    /** New recovery codes, in place of the old ones. Optional. */
    regenerateRecoveryCodes?(options?: RequestOptions): Promise<RecoveryCodes>;
    /** Logs out. */
    logout(options?: RequestOptions): Promise<void>;
    /**
     * Asks the backend to email a link that resets the password of an address
     * (`POST /auth/password/forgot`), for `auth.passwordReset` (decision 0048). It resolves the
     * same whether the address has an account or not. Optional: without it, the login page has no
     * "Forgot your password?" link.
     */
    forgotPassword?(email: string, options?: RequestOptions): Promise<void>;
    /**
     * Sets a new password with the token and the email of a reset link
     * (`POST /auth/password/reset`). Rejects with a `ValidationError` for a wrong or expired token,
     * or a password the backend refuses. It doesn't log in.
     */
    resetPassword?(reset: PasswordReset, options?: RequestOptions): Promise<void>;
    /**
     * Emails the current user a new link that verifies their address
     * (`POST /auth/email/verification`), for `auth.emailVerification` (decision 0048). Optional.
     */
    sendEmailVerification?(options?: RequestOptions): Promise<void>;
    /**
     * Verifies an address with the token of its link (`POST /auth/email/verify`). Rejects with a
     * `ValidationError` for a wrong or expired token. Optional.
     */
    verifyEmail?(token: string, options?: RequestOptions): Promise<void>;

    /**
     * A short-lived URL of the item's page on the site, rendered with these values, for the iframe
     * previews of resources whose `features.preview` is `{ "mode": "iframe" }` (decision 0009).
     * Optional: without it, iframe previews are not shown.
     */
    previewItem?(
        resource: string,
        id: string,
        values: Values,
        options?: RequestOptions,
    ): Promise<PreviewResponse>;

    /** Searches the searchable resources: every one, or those of `resources`. */
    search(q: string, options?: SearchOptions): Promise<SearchResponse>;
    /**
     * Checks a value of a field with `check` as it is typed: whether a slug is available, and its
     * URL (`POST /resources/{resource}/fields/{field}/check`). Optional: without it, fields don't
     * check.
     */
    checkField?(
        resource: string,
        field: string,
        request: FieldCheckRequest,
        options?: RequestOptions,
    ): Promise<FieldCheckResponse>;
    /**
     * The value of an `embed` field for a URL, from its provider's oEmbed (`GET /embeds`).
     * Optional: without it, `embed` fields keep the URL alone.
     */
    resolveEmbed?(url: string, options?: RequestOptions): Promise<EmbedValue>;
    /** Data of a dashboard widget, in the shape its type defines. */
    getWidgetData(widget: string, options?: RequestOptions): Promise<unknown>;

    /**
     * The same adapter, sending the values of the current context in the `Panneau-Context` header
     * with every request (decision 0045). Optional: the app needs it when the definition has
     * `context`.
     */
    withContext?(values: ContextValues): DataAdapter;
    /**
     * The first choices of a param of the context that match `q` (`GET /context/{name}/options`),
     * for the values of the params before it, which the adapter sends. Optional: the app needs it
     * for the params of the context without inline `options`.
     */
    getContextOptions?(
        name: string,
        options?: RequestOptions & { q?: string },
    ): Promise<ContextOption[]>;
}
