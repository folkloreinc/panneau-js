import type {
    ActionRequest,
    ActionResult,
    ActionRun,
    Definition,
    Item,
    ListQuery,
    ListResponse,
    Media,
    MediaListResponse,
    SearchResponse,
    Session,
} from '@panneau/protocol';

/** Values of an item's fields, keyed by field name. */
export type Values = Record<string, unknown>;

export interface RequestOptions {
    /** Aborts the request. TanStack Query passes one to cancel queries. */
    signal?: AbortSignal;
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

/** Query of the media list: a list query whose filters include `type` and `tags`. */
export type MediaQuery = ListQuery;

/** Credentials of a password login. */
export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
    [key: string]: unknown;
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

    /** A page of the media library. */
    listMedia(query?: MediaQuery, options?: RequestOptions): Promise<MediaListResponse>;
    /** One media item. */
    getMedia(id: string, options?: RequestOptions): Promise<Media>;
    /** Uploads a file, with optional metadata. */
    uploadMedia(file: Blob, values?: Values, options?: RequestOptions): Promise<Media>;
    /** Updates the metadata or the transform of a media item. */
    updateMedia(id: string, values: Values, options?: RequestOptions): Promise<Media>;
    /** Deletes a media item. */
    deleteMedia(id: string, options?: RequestOptions): Promise<void>;

    /** The current session. Rejects with an `UnauthorizedError` without one. */
    getSession(options?: RequestOptions): Promise<Session>;
    /** Logs in with a password. */
    login(credentials: LoginCredentials, options?: RequestOptions): Promise<Session>;
    /** Logs out. */
    logout(options?: RequestOptions): Promise<void>;

    /** Searches every searchable resource. */
    search(q: string, options?: RequestOptions): Promise<SearchResponse>;
    /** Data of a dashboard widget, in the shape its type defines. */
    getWidgetData(widget: string, options?: RequestOptions): Promise<unknown>;
}
