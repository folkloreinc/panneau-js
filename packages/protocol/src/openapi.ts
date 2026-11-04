import { z } from 'zod';

import {
    AUTH_PAGE_PATHS,
    CONTEXT_HEADER,
    CONTEXT_PROBLEM_TYPE,
    EMAIL_UNVERIFIED_PROBLEM_TYPE,
    PASSWORD_CONFIRMATION_PROBLEM_TYPE,
    TWO_FACTOR_REQUIRED_PROBLEM_TYPE,
} from './constants';
import { createSchemaRegistry } from './schemas';
import { BootConfig } from './schemas/boot';
import { Definition } from './schemas/definition';
import { Theme } from './schemas/theme';
import {
    SEARCH_DEFAULT_LIMIT,
    SEARCH_MAX_LENGTH,
    SEARCH_MAX_LIMIT,
    SEARCH_MIN_LENGTH,
} from './search';
import { PROBLEM_CONTENT_TYPE, PROTOCOL_VERSION } from './version';

type JsonObject = Record<string, unknown>;

const ref = (id: string): JsonObject => ({ $ref: `#/components/schemas/${id}` });

const json = (schema: JsonObject): JsonObject => ({ 'application/json': { schema } });

const ok = (description: string, schema?: JsonObject, headers?: JsonObject): JsonObject => ({
    description,
    ...(schema !== undefined ? { content: json(schema) } : {}),
    ...(headers !== undefined ? { headers } : {}),
});

const PROBLEMS: Record<number, string> = {
    400: 'Bad request, such as a dry run of an action that does not declare `dryRun`.',
    401: 'Not authenticated.',
    403: `Not allowed. A value of \`${CONTEXT_HEADER}\` that the user can't use is a problem of type \`${CONTEXT_PROBLEM_TYPE}\`, with its \`param\`. With \`auth.emailVerification\`, a user whose email address isn't verified gets a problem of type \`${EMAIL_UNVERIFIED_PROBLEM_TYPE}\` on every operation but those of the auth. A user who must have two-factor authentication and hasn't set it up gets a problem of type \`${TWO_FACTOR_REQUIRED_PROBLEM_TYPE}\` on every operation but those of the auth and of \`/account/two-factor\`.`,
    404: 'Not found.',
    409: 'Conflict with a business rule.',
    412: 'Version conflict: `If-Match` does not match the current version, which is in `current`.',
    422: 'Invalid values: messages are in `errors`, keyed by dot path.',
    423: `The password must be confirmed first (\`POST /auth/password/confirm\`): a problem of type \`${PASSWORD_CONFIRMATION_PROBLEM_TYPE}\`.`,
    429: 'Too many requests: `Retry-After` gives the seconds to wait.',
};

function problems(...statuses: number[]): JsonObject {
    return Object.fromEntries(
        statuses.map((status) => [
            String(status),
            {
                description: PROBLEMS[status],
                content: { [PROBLEM_CONTENT_TYPE]: { schema: ref('Problem') } },
            },
        ]),
    );
}

const etag = { ETag: { description: 'The version of the item.', schema: { type: 'string' } } };

const pathParameter = (name: string, description: string): JsonObject => ({
    name,
    in: 'path',
    required: true,
    description,
    schema: { type: 'string' },
});

const queryParameter = (name: string, description: string, schema: JsonObject): JsonObject => ({
    name,
    in: 'query',
    required: false,
    description,
    schema,
});

const listParameters = [
    queryParameter('page', 'Page number, from 1.', { type: 'integer', minimum: 1 }),
    queryParameter('perPage', 'Items per page.', { type: 'integer', minimum: 1 }),
    queryParameter(
        'cursor',
        'Lists whose `pagination` is `cursor`: the `nextCursor` (or `previousCursor`) of a page, instead of `page`.',
        { type: 'string' },
    ),
    queryParameter('sort', 'Comma-separated fields; a `-` prefix sorts descending.', {
        type: 'string',
    }),
    {
        name: 'filter',
        in: 'query',
        required: false,
        style: 'deepObject',
        explode: true,
        description:
            '`filter[status]=published`; `filter[tags][]=a&filter[tags][]=b` for any of several values; `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31` for the inclusive bounds of a range filter (`date-range`), without the open end.',
        schema: { type: 'object', additionalProperties: true },
    },
    queryParameter('q', 'Search.', { type: 'string' }),
    queryParameter('fields', 'Comma-separated fields to include in each item.', { type: 'string' }),
];

const resource = pathParameter('resource', 'Resource id.');
const id = pathParameter('id', 'Item id.');
const values = { type: 'object', additionalProperties: true };

/** Component schemas, generated from the protocol's Zod schemas. */
export function createComponentSchemas(): Record<string, JsonObject> {
    const { schemas } = z.toJSONSchema(createSchemaRegistry(), {
        io: 'input',
        uri: (schemaId) => `#/components/schemas/${schemaId}`,
    });
    return Object.fromEntries(
        Object.entries(schemas).map(([schemaId, schema]) => {
            const { $schema: _schema, $id: _id, ...rest } = schema as JsonObject;
            return [schemaId, rest];
        }),
    );
}

/** The JSON Schema of the definition (`GET /definition`). */
export function createDefinitionJsonSchema(): JsonObject {
    return {
        $id: 'https://github.com/folkloreinc/panneau-js/blob/v5.x/packages/protocol/schema/definition.schema.json',
        ...(z.toJSONSchema(Definition, {
            io: 'input',
            metadata: createSchemaRegistry(),
        }) as JsonObject),
    };
}

/** The JSON Schema of a theme, for themes written as JSON files. */
export function createThemeJsonSchema(): JsonObject {
    return {
        $id: 'https://github.com/folkloreinc/panneau-js/blob/v5.x/packages/protocol/schema/theme.schema.json',
        ...(z.toJSONSchema(Theme, {
            io: 'input',
            metadata: createSchemaRegistry(),
        }) as JsonObject),
    };
}

/** The JSON Schema of the boot config, which a server writes in the page of the app. */
export function createBootConfigJsonSchema(): JsonObject {
    return {
        $id: 'https://github.com/folkloreinc/panneau-js/blob/v5.x/packages/protocol/schema/boot.schema.json',
        ...(z.toJSONSchema(BootConfig, {
            io: 'input',
            metadata: createSchemaRegistry(),
        }) as JsonObject),
    };
}

/** The `Panneau-Context` header, which every operation takes (decision 0045). */
const contextHeader: JsonObject = {
    name: CONTEXT_HEADER,
    in: 'header',
    required: false,
    description:
        'The values of the current context, when the definition has `context`: the format of a query string, in the order of its params (`client=4&contest=12`). Responses vary with it.',
    schema: { type: 'string' },
};

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

/**
 * Adds the `Panneau-Context` header to the parameters of every path, and its `403` problem to
 * every operation that doesn't have one: a value the user can't use is refused everywhere.
 */
function withContextHeader(paths: Record<string, JsonObject>): Record<string, JsonObject> {
    const parameter = { $ref: '#/components/parameters/Context' };
    return Object.fromEntries(
        Object.entries(paths).map(([path, item]) => [
            path,
            {
                ...Object.fromEntries(
                    Object.entries(item).map(([key, operation]) => {
                        if (!METHODS.includes(key)) {
                            return [key, operation];
                        }
                        const { responses = {}, ...rest } = operation as JsonObject;
                        return [
                            key,
                            {
                                ...rest,
                                responses: { ...problems(403), ...(responses as JsonObject) },
                            },
                        ];
                    }),
                ),
                parameters: [...((item.parameters as JsonObject[] | undefined) ?? []), parameter],
            },
        ]),
    );
}

/** The OpenAPI 3.1 document of the Panneau HTTP API. */
export function createOpenApiDocument(): JsonObject {
    return {
        openapi: '3.1.0',
        info: {
            title: 'Panneau protocol',
            version: String(PROTOCOL_VERSION),
            description:
                'The HTTP API between a Panneau frontend and its backend. Paths are relative to `api.baseUrl` of the definition. Authentication is up to the backend (session cookie or bearer token). Errors use `application/problem+json`.',
        },
        paths: withContextHeader({
            '/definition': {
                get: {
                    operationId: 'getDefinition',
                    summary:
                        'The definition for the current user, in the current locale, and for the values of `Panneau-Context`.',
                    responses: {
                        200: ok('The definition.', ref('Definition')),
                        ...problems(401, 403),
                    },
                },
            },
            '/context/{param}/options': {
                parameters: [pathParameter('param', 'The name of a param of the context.')],
                get: {
                    operationId: 'getContextOptions',
                    summary:
                        'The choices of a param of the context without inline `options`, for the values of the params before it in `Panneau-Context`.',
                    parameters: [queryParameter('q', 'Search terms.', { type: 'string' })],
                    responses: {
                        200: ok(
                            'The first choices that match `q`, in the order to show them.',
                            ref('ContextOptionsResponse'),
                        ),
                        ...problems(401, 403, 404),
                    },
                },
            },
            '/resources/{resource}': {
                parameters: [resource],
                get: {
                    operationId: 'listItems',
                    parameters: listParameters,
                    responses: {
                        200: ok('A page of items.', ref('ListResponse')),
                        // A `cursor` the backend can't read (decision 0039)
                        ...problems(401, 403, 404, 422),
                    },
                },
                post: {
                    operationId: 'createItem',
                    requestBody: { required: true, content: json(values) },
                    responses: {
                        201: ok('The created item.', ref('ItemResponse'), etag),
                        ...problems(401, 403, 404, 409, 422),
                    },
                },
            },
            '/resources/{resource}/{id}': {
                parameters: [resource, id],
                get: {
                    operationId: 'getItem',
                    responses: {
                        200: ok('The item.', ref('ItemResponse'), etag),
                        ...problems(401, 403, 404),
                    },
                },
                patch: {
                    operationId: 'updateItem',
                    description: 'Partial update: only the values sent are changed.',
                    parameters: [
                        {
                            name: 'If-Match',
                            in: 'header',
                            required: false,
                            description: 'The version the client edited.',
                            schema: { type: 'string' },
                        },
                    ],
                    requestBody: { required: true, content: json(values) },
                    responses: {
                        200: ok('The updated item.', ref('ItemResponse'), etag),
                        ...problems(401, 403, 404, 409, 412, 422),
                    },
                },
                delete: {
                    operationId: 'deleteItem',
                    responses: { 204: ok('Deleted.'), ...problems(401, 403, 404, 409) },
                },
            },
            '/resources/{resource}/{id}/duplicate': {
                parameters: [resource, id],
                post: {
                    operationId: 'duplicateItem',
                    description:
                        'Copies an item, for the built-in `duplicate` (decision 0040). Allowed on the items whose `abilities.duplicate` is `true`.',
                    responses: {
                        201: ok('The copy, a new item.', ref('ItemResponse'), etag),
                        ...problems(401, 403, 404),
                        409: {
                            description:
                                'The copy conflicts with another item, such as a unique value.',
                            content: { [PROBLEM_CONTENT_TYPE]: { schema: ref('Problem') } },
                        },
                    },
                },
            },
            '/resources/{resource}/{id}/preview': {
                parameters: [resource, id],
                post: {
                    operationId: 'previewItem',
                    requestBody: { required: true, content: json(values) },
                    responses: {
                        200: ok('A short-lived preview URL.', ref('PreviewResponse')),
                        ...problems(401, 403, 404, 422),
                    },
                },
            },
            '/resources/{resource}/actions/{action}': {
                parameters: [resource, pathParameter('action', 'Action id.')],
                post: {
                    operationId: 'runAction',
                    requestBody: {
                        required: true,
                        content: {
                            ...json(ref('ActionRequest')),
                            'multipart/form-data': { schema: ref('ActionRequest') },
                        },
                    },
                    responses: {
                        200: ok('The result.', ref('ActionResult')),
                        202: ok('The action runs in the background.', ref('ActionRunResponse')),
                        ...problems(400, 401, 403, 404, 409, 422),
                    },
                },
            },
            '/resources/{resource}/fields/{field}/check': {
                parameters: [resource, pathParameter('field', 'Name of a field with `check`.')],
                post: {
                    operationId: 'checkField',
                    summary:
                        'Checks a value as it is typed: whether a slug is available, and its URL. With the permission to create, or to update the item `id`.',
                    requestBody: { required: true, content: json(ref('FieldCheckRequest')) },
                    responses: {
                        200: ok(
                            'What the backend says about the value.',
                            ref('FieldCheckResponse'),
                        ),
                        ...problems(401, 403, 404, 422),
                    },
                },
            },
            '/actions/runs': {
                get: {
                    operationId: 'listActionRuns',
                    summary: "The current user's recent runs.",
                    responses: {
                        200: ok('Runs, newest first.', {
                            type: 'object',
                            required: ['data'],
                            properties: { data: { type: 'array', items: ref('ActionRun') } },
                        }),
                        ...problems(401),
                    },
                },
            },
            '/actions/runs/{run}': {
                parameters: [pathParameter('run', 'Run id.')],
                get: {
                    operationId: 'getActionRun',
                    responses: {
                        200: ok('The run.', ref('ActionRunResponse')),
                        ...problems(401, 403, 404),
                    },
                },
                delete: {
                    operationId: 'cancelActionRun',
                    responses: { 204: ok('Cancelled.'), ...problems(401, 403, 404, 409) },
                },
            },
            '/uploads/sign': {
                post: {
                    operationId: 'signUpload',
                    summary:
                        "Signs a request of the browser's S3 client. The first request of a file creates its upload.",
                    requestBody: { required: true, content: json(ref('UploadSignRequest')) },
                    responses: {
                        200: ok('The presigned request.', ref('UploadSignResponse')),
                        ...problems(401, 403, 404, 422),
                    },
                },
            },
            '/uploads/{upload}/complete': {
                parameters: [pathParameter('upload', 'Upload id: `upl_…`.')],
                post: {
                    operationId: 'completeUpload',
                    summary:
                        'Once the browser completed the upload in storage, checks the object and gives the upload, which values reference.',
                    requestBody: {
                        required: false,
                        content: json({
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description:
                                        "The file's name, which the key doesn't keep, since the backend chose it.",
                                },
                            },
                        }),
                    },
                    responses: {
                        200: ok('The upload.', ref('UploadResponse')),
                        ...problems(401, 403, 404, 422),
                    },
                },
            },
            '/auth/session': {
                get: {
                    operationId: 'getSession',
                    responses: { 200: ok('The current user.', ref('Session')), ...problems(401) },
                },
            },
            '/auth/login': {
                post: {
                    operationId: 'login',
                    requestBody: {
                        required: true,
                        content: json({
                            description:
                                'An email and a password, or the single secret of `auth.token`.',
                            oneOf: [
                                {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        remember: { type: 'boolean' },
                                    },
                                },
                                {
                                    type: 'object',
                                    required: ['token'],
                                    properties: {
                                        token: { type: 'string' },
                                        remember: { type: 'boolean' },
                                    },
                                },
                            ],
                        }),
                    },
                    responses: {
                        200: ok('Logged in.', ref('Session')),
                        202: ok(
                            'A second factor is required: answer `/auth/two-factor/challenge`.',
                            ref('TwoFactorChallenge'),
                        ),
                        ...problems(422, 429),
                    },
                },
            },
            '/auth/logout': {
                post: {
                    operationId: 'logout',
                    description:
                        '`panneau` auth mode. In `external` mode, the browser goes to `auth.logoutUrl` instead.',
                    responses: { 204: ok('Logged out.') },
                },
            },
            '/auth/providers/{provider}/redirect': {
                parameters: [pathParameter('provider', 'Provider id.')],
                get: {
                    operationId: 'redirectToProvider',
                    parameters: [
                        queryParameter('next', 'Local path to go to after login.', {
                            type: 'string',
                        }),
                    ],
                    responses: {
                        302: { description: 'Redirect to the provider.' },
                        ...problems(404),
                    },
                },
            },
            '/auth/password/forgot': {
                post: {
                    operationId: 'forgotPassword',
                    summary: `With \`auth.passwordReset\`: emails a link to the page of the app at \`{basePath}/${AUTH_PAGE_PATHS.resetPassword}?token=…&email=…\`.`,
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            required: ['email'],
                            properties: { email: { type: 'string' } },
                        }),
                    },
                    responses: {
                        204: ok(
                            "A reset link was sent, if the address has an account. The answer is the same when it hasn't, or when a link was sent recently.",
                        ),
                        ...problems(422, 429),
                    },
                },
            },
            '/auth/password/reset': {
                post: {
                    operationId: 'resetPassword',
                    summary:
                        'With `auth.passwordReset`: sets a new password, with the token and the email of the link. It does not log in.',
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            required: ['token', 'email', 'password'],
                            properties: {
                                token: { type: 'string' },
                                email: { type: 'string' },
                                password: { type: 'string' },
                            },
                        }),
                    },
                    responses: {
                        204: ok('The password was reset.'),
                        ...problems(422, 429),
                    },
                },
            },
            '/auth/email/verification': {
                post: {
                    operationId: 'sendEmailVerification',
                    summary: `With \`auth.emailVerification\`: emails the current user a link to the page of the app at \`{basePath}/${AUTH_PAGE_PATHS.verifyEmail}?token=…\`.`,
                    responses: {
                        204: ok('A link was sent, or the address is already verified.'),
                        ...problems(401, 429),
                    },
                },
            },
            '/auth/email/verify': {
                post: {
                    operationId: 'verifyEmail',
                    summary:
                        'With `auth.emailVerification`: verifies the address of the token of a link. The user does not need to be logged in.',
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            required: ['token'],
                            properties: { token: { type: 'string' } },
                        }),
                    },
                    responses: {
                        204: ok('The address is verified.'),
                        ...problems(422, 429),
                    },
                },
            },
            '/auth/two-factor/challenge': {
                post: {
                    operationId: 'twoFactorChallenge',
                    summary:
                        'Ends a login that answered `202`, with a code of the authenticator app or a recovery code. A login that is no longer pending is a `422`.',
                    requestBody: {
                        required: true,
                        content: json({
                            oneOf: [
                                {
                                    type: 'object',
                                    required: ['code'],
                                    properties: { code: { type: 'string' } },
                                },
                                {
                                    type: 'object',
                                    required: ['recoveryCode'],
                                    properties: { recoveryCode: { type: 'string' } },
                                },
                            ],
                        }),
                    },
                    responses: {
                        200: ok('Logged in.', ref('Session')),
                        ...problems(422, 429),
                    },
                },
            },
            '/auth/password/confirm': {
                post: {
                    operationId: 'confirmPassword',
                    summary:
                        'Confirms the password of the current user, for the operations that answer `423`.',
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            required: ['password'],
                            properties: { password: { type: 'string' } },
                        }),
                    },
                    responses: {
                        204: ok('The password is confirmed.'),
                        ...problems(401, 422, 429),
                    },
                },
            },
            '/account/two-factor': {
                get: {
                    operationId: 'getTwoFactor',
                    summary: 'With `auth.twoFactor`: the two-factor authentication of the user.',
                    responses: {
                        200: ok('Its status.', ref('TwoFactorStatus')),
                        ...problems(401, 403),
                    },
                },
                post: {
                    operationId: 'enableTwoFactor',
                    summary:
                        'Starts setting it up: a new secret, `pending` until `POST /account/two-factor/confirm`.',
                    responses: {
                        200: ok(
                            'The secret to add to an authenticator app.',
                            ref('TwoFactorSetup'),
                        ),
                        ...problems(401, 403, 409, 423),
                    },
                },
                delete: {
                    operationId: 'disableTwoFactor',
                    summary: 'Turns it off. A `409` when the backend requires it for the user.',
                    responses: {
                        204: ok('Turned off.'),
                        ...problems(401, 403, 409, 423),
                    },
                },
            },
            '/account/two-factor/confirm': {
                post: {
                    operationId: 'confirmTwoFactor',
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            required: ['code'],
                            properties: { code: { type: 'string' } },
                        }),
                    },
                    responses: {
                        200: ok('Turned on, with its recovery codes.', ref('RecoveryCodes')),
                        ...problems(401, 403, 409, 422, 423),
                    },
                },
            },
            '/account/two-factor/recovery-codes': {
                post: {
                    operationId: 'regenerateRecoveryCodes',
                    summary: 'New recovery codes, in place of the old ones.',
                    responses: {
                        200: ok('The new codes.', ref('RecoveryCodes')),
                        ...problems(401, 403, 409, 423),
                    },
                },
            },
            '/auth/passkeys/options': {
                post: {
                    operationId: 'passkeyOptions',
                    responses: {
                        200: ok('WebAuthn request options.', {
                            type: 'object',
                            additionalProperties: true,
                        }),
                    },
                },
            },
            '/auth/passkeys/login': {
                post: {
                    operationId: 'passkeyLogin',
                    requestBody: {
                        required: true,
                        content: json({ type: 'object', additionalProperties: true }),
                    },
                    responses: { 200: ok('Logged in.', ref('Session')), ...problems(422) },
                },
            },
            '/account': {
                get: {
                    operationId: 'getAccount',
                    responses: {
                        200: ok('The current user.', {
                            type: 'object',
                            required: ['data'],
                            properties: { data: ref('User') },
                        }),
                        ...problems(401),
                    },
                },
                patch: {
                    operationId: 'updateAccount',
                    requestBody: { required: true, content: json(values) },
                    responses: {
                        200: ok('The updated user.', {
                            type: 'object',
                            required: ['data'],
                            properties: { data: ref('User') },
                        }),
                        ...problems(401, 422),
                    },
                },
            },
            '/search': {
                get: {
                    operationId: 'search',
                    parameters: [
                        {
                            ...queryParameter('q', 'Search terms, trimmed.', {
                                type: 'string',
                                minLength: SEARCH_MIN_LENGTH,
                                maxLength: SEARCH_MAX_LENGTH,
                            }),
                            required: true,
                        },
                        queryParameter('limit', 'Items per resource.', {
                            type: 'integer',
                            minimum: 1,
                            maximum: SEARCH_MAX_LIMIT,
                            default: SEARCH_DEFAULT_LIMIT,
                        }),
                        queryParameter(
                            'resources',
                            'Comma-separated ids of the searchable resources to search. Defaults to every one.',
                            { type: 'string' },
                        ),
                    ],
                    responses: {
                        200: ok(
                            `Results grouped by resource, in the order of the definition: at most \`limit\` items per resource, and ${SEARCH_MAX_LIMIT} in all.`,
                            ref('SearchResponse'),
                        ),
                        ...problems(401, 422, 429),
                    },
                },
            },
            '/embeds': {
                get: {
                    operationId: 'resolveEmbed',
                    parameters: [
                        {
                            ...queryParameter('url', 'The URL to embed.', { type: 'string' }),
                            required: true,
                        },
                    ],
                    responses: {
                        200: ok(
                            "The value of an `embed` field for the URL, from its provider's oEmbed.",
                            ref('EmbedResponse'),
                        ),
                        ...problems(401, 422, 429),
                    },
                },
            },
            '/dashboard/widgets/{widget}': {
                parameters: [pathParameter('widget', 'Widget id.')],
                get: {
                    operationId: 'getWidgetData',
                    responses: {
                        200: ok("The widget's data. Its shape depends on the widget type.", {
                            type: 'object',
                            additionalProperties: true,
                        }),
                        ...problems(401, 403, 404),
                    },
                },
            },
        }),
        components: {
            schemas: createComponentSchemas(),
            parameters: { Context: contextHeader },
        },
    };
}
