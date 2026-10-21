import type { Problem, Upload, UploadSignRequest, UploadSignResponse } from '@panneau/protocol';

import { type ApiError, InvalidResponseError, createApiError } from '../errors';
import { readProblem } from '../problem';

/** A request to sign, as `signRequest` of `@uppy/aws-s3` 6 gives it. */
export type PresignableRequest = UploadSignRequest;

/** A signed request, as `signRequest` of `@uppy/aws-s3` 6 takes it. */
export interface PresignedResponse {
    url: string;
    /** The key the backend chose for a new upload. */
    key?: string;
    /** Headers the URL was signed with, which the browser sends. */
    headers?: Record<string, string>;
}

export interface PresignedUploadsOptions {
    /** URL of the API, as `api.baseUrl` in the definition: the routes are under `/uploads`. */
    baseUrl?: string;
    /** The `endpoint` of the definition's `uploads`, when the routes are elsewhere. */
    endpoint?: string;
    /** The `fetch` function to use. Defaults to the global one. */
    fetch?: (input: string, init: RequestInit) => Promise<Response>;
    /**
     * Headers of every request, or a function that gives them: `() => getLaravelHeaders()` for
     * a Laravel backend with session authentication.
     */
    headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
    /** Whether requests send cookies. Defaults to `include`. */
    credentials?: RequestCredentials;
    /** Creates the error of a failed response: `createLaravelError` for Laravel. */
    createError?: (problem: Problem, response: Response) => ApiError;
}

export interface PresignedUploads {
    /** Signs a request of Uppy's S3 client: pass it as `signRequest` to `@uppy/aws-s3`. */
    signRequest: (request: PresignableRequest) => Promise<PresignedResponse>;
    /**
     * Tells the backend that the upload of a key is complete, once Uppy reports it
     * (`upload-success`, with the key in `response.body.key`), and resolves with the upload.
     * Values reference it as `{ upload: upload.id }`: a file field, an import, or
     * `uploadMedia({ upload: upload.id })` to make it a media.
     */
    complete: (key: string) => Promise<Upload>;
}

/**
 * Direct uploads to S3-compatible storage with URLs that the backend signs, the `presigned` mode
 * of the protocol (decision 0025): the browser sends files itself, in parts for large ones, then
 * completes each upload, which values reference.
 *
 * ```ts
 * const uploads = createPresignedUploads({ baseUrl: definition.api.baseUrl, headers: () => getLaravelHeaders() });
 * uppy.use(AwsS3, { signRequest: uploads.signRequest });
 * uppy.on('upload-success', async (file, response) => {
 *     const upload = await uploads.complete(response.body.key);
 *     const media = await adapter.uploadMedia({ upload: upload.id });
 * });
 * ```
 */
export function createPresignedUploads({
    baseUrl,
    endpoint,
    fetch: fetcher = (input, init) => globalThis.fetch(input, init),
    headers,
    credentials = 'include',
    createError = (problem) => createApiError(problem),
}: PresignedUploadsOptions): PresignedUploads {
    const base = (endpoint ?? `${(baseUrl ?? '').replace(/\/+$/, '')}/uploads`).replace(/\/+$/, '');
    // The upload of each key, from the response that created it.
    const uploads = new Map<string, string>();

    const post = async (path: string, body?: unknown): Promise<unknown> => {
        const requestHeaders = new Headers(
            typeof headers === 'function' ? await headers() : headers,
        );
        requestHeaders.set('Accept', 'application/json');
        const init: RequestInit = { method: 'POST', headers: requestHeaders, credentials };
        if (body !== undefined) {
            requestHeaders.set('Content-Type', 'application/json');
            init.body = JSON.stringify(body);
        }
        const response = await fetcher(`${base}${path}`, init);
        if (!response.ok) {
            throw createError(await readProblem(response), response);
        }
        return response.json();
    };

    return {
        async signRequest(request) {
            const body = (await post('/sign', request)) as UploadSignResponse;
            if (typeof body?.url !== 'string') {
                throw new InvalidResponseError('The signed request has no URL.', []);
            }
            const key = body.key ?? request.key;
            if (typeof body.upload === 'string') {
                uploads.set(key, body.upload);
            }
            return {
                url: body.url,
                ...(body.key !== undefined && { key: body.key }),
                ...(body.headers !== undefined && { headers: body.headers }),
            };
        },

        async complete(key) {
            // The backend names the upload in the sign response; without it, it is the last
            // segment of the key it chose (`uploads/upl_01H…`).
            const upload = uploads.get(key) ?? key.split('/').pop() ?? key;
            const body = (await post(`/${encodeURIComponent(upload)}/complete`)) as {
                data?: Upload;
            };
            if (typeof body?.data?.id !== 'string') {
                throw new InvalidResponseError('The completed upload has no id.', []);
            }
            uploads.delete(key);
            return body.data;
        },
    };
}
