import type { Item, Problem, ValidationIssue } from '@panneau/protocol';

/**
 * An error response of the API, parsed from `application/problem+json`. Subclasses cover the
 * statuses a client handles differently. Other statuses (`409`, `5xx`…) are an `ApiError`.
 */
export class ApiError extends Error {
    override readonly name: string = 'ApiError';
    /** The HTTP status. */
    readonly status: number;
    /** The problem details sent by the backend, or built from the status when it sent none. */
    readonly problem: Problem;

    constructor(problem: Problem, options?: ErrorOptions) {
        super(problem.detail ?? problem.title, options);
        this.status = problem.status;
        this.problem = problem;
    }
}

/** `422`: the submitted values are invalid. */
export class ValidationError extends ApiError {
    override readonly name: string = 'ValidationError';
    /** Messages keyed by the dot path of the invalid value (`title.fr`, `blocks.2.image`). */
    readonly errors: Record<string, string[]>;

    constructor(problem: Problem, options?: ErrorOptions) {
        super(problem, options);
        this.errors = problem.errors ?? {};
    }
}

/** `412`: the item changed since the version sent in `If-Match`. */
export class ConflictError extends ApiError {
    override readonly name: string = 'ConflictError';
    /** The current version of the item, when the backend sent it. */
    readonly current: Item | null;

    constructor(problem: Problem, options?: ErrorOptions) {
        super(problem, options);
        this.current = problem.current ?? null;
    }
}

/** `401` (or `419` with the Laravel preset): the user is not authenticated. */
export class UnauthorizedError extends ApiError {
    override readonly name: string = 'UnauthorizedError';
}

/** `403`: the user is not allowed to do this. */
export class ForbiddenError extends ApiError {
    override readonly name: string = 'ForbiddenError';
}

/** `404`: the resource, item or route doesn't exist. */
export class NotFoundError extends ApiError {
    override readonly name: string = 'NotFoundError';
}

/** Options of `createApiError()`: what the response says besides its problem. */
export interface ApiErrorOptions extends ErrorOptions {
    /** Seconds to wait before the next request, from `Retry-After`. */
    retryAfter?: number | null;
}

/** `429`: too many requests. The next one can be sent after `retryAfter` seconds. */
export class RateLimitedError extends ApiError {
    override readonly name: string = 'RateLimitedError';
    /** Seconds to wait, from `Retry-After`, or `null` when the backend didn't say. */
    readonly retryAfter: number | null;

    constructor(problem: Problem, options?: ApiErrorOptions) {
        super(problem, options);
        this.retryAfter = options?.retryAfter ?? null;
    }
}

/** A successful response whose body doesn't match the protocol. */
export class InvalidResponseError extends Error {
    override readonly name: string = 'InvalidResponseError';
    /** What doesn't match, with dot paths into the body. */
    readonly issues: ValidationIssue[];

    constructor(message: string, issues: ValidationIssue[]) {
        super(message);
        this.issues = issues;
    }
}

/** Creates the error that matches the status of a problem. */
export function createApiError(problem: Problem, options?: ApiErrorOptions): ApiError {
    switch (problem.status) {
        case 401:
            return new UnauthorizedError(problem, options);
        case 403:
            return new ForbiddenError(problem, options);
        case 404:
            return new NotFoundError(problem, options);
        case 412:
            return new ConflictError(problem, options);
        case 422:
            return new ValidationError(problem, options);
        case 429:
            return new RateLimitedError(problem, options);
        default:
            return new ApiError(problem, options);
    }
}

/** Whether a value is an error of the API. */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}
