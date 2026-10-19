import { z } from 'zod';

import { createSchemaRegistry } from './schemas';
import { BootConfig } from './schemas/boot';
import { Definition } from './schemas/definition';
import { Theme } from './schemas/theme';
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
    401: 'Not authenticated.',
    403: 'Not allowed.',
    404: 'Not found.',
    409: 'Conflict with a business rule.',
    412: 'Version conflict: `If-Match` does not match the current version, which is in `current`.',
    422: 'Invalid values: messages are in `errors`, keyed by dot path.',
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
        paths: {
            '/definition': {
                get: {
                    operationId: 'getDefinition',
                    summary: 'The definition for the current user, in the current locale.',
                    responses: {
                        200: ok('The definition.', ref('Definition')),
                        ...problems(401, 403),
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
                        ...problems(401, 403, 404),
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
                        ...problems(401, 403, 404, 409, 422),
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
            '/media': {
                get: {
                    operationId: 'listMedia',
                    parameters: listParameters,
                    responses: {
                        200: ok('A page of media.', ref('MediaListResponse')),
                        ...problems(401, 403),
                    },
                },
                post: {
                    operationId: 'uploadMedia',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: {
                                            type: 'string',
                                            contentMediaType: 'application/octet-stream',
                                        },
                                        name: { type: 'string' },
                                        tags: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: ok('The created media.', ref('MediaResponse')),
                        ...problems(401, 403, 422),
                    },
                },
            },
            '/media/tags': {
                get: {
                    operationId: 'listMediaTags',
                    responses: {
                        200: ok('Tags in use.', {
                            type: 'object',
                            required: ['data'],
                            properties: { data: { type: 'array', items: { type: 'string' } } },
                        }),
                        ...problems(401, 403),
                    },
                },
            },
            '/media/{id}': {
                parameters: [pathParameter('id', 'Media id.')],
                get: {
                    operationId: 'getMedia',
                    responses: {
                        200: ok('The media.', ref('MediaResponse')),
                        ...problems(401, 403, 404),
                    },
                },
                patch: {
                    operationId: 'updateMedia',
                    description: 'Updates metadata, tags or the image `transform`.',
                    requestBody: { required: true, content: json(values) },
                    responses: {
                        200: ok('The updated media.', ref('MediaResponse')),
                        ...problems(401, 403, 404, 422),
                    },
                },
                delete: {
                    operationId: 'deleteMedia',
                    responses: { 204: ok('Moved to the trash.'), ...problems(401, 403, 404, 409) },
                },
            },
            '/media/{id}/file': {
                parameters: [pathParameter('id', 'Media id.')],
                post: {
                    operationId: 'replaceMediaFile',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: {
                                            type: 'string',
                                            contentMediaType: 'application/octet-stream',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: ok('The media.', ref('MediaResponse')),
                        ...problems(401, 403, 404, 422),
                    },
                },
            },
            '/media/{id}/restore': {
                parameters: [pathParameter('id', 'Media id.')],
                post: {
                    operationId: 'restoreMedia',
                    responses: {
                        200: ok('The restored media.', ref('MediaResponse')),
                        ...problems(401, 403, 404),
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
                            type: 'object',
                            required: ['email', 'password'],
                            properties: {
                                email: { type: 'string' },
                                password: { type: 'string' },
                                remember: { type: 'boolean' },
                            },
                        }),
                    },
                    responses: {
                        200: ok('Logged in.', ref('Session')),
                        202: ok(
                            'A second factor is required: answer `/auth/two-factor/challenge`.',
                            {
                                type: 'object',
                                properties: { twoFactor: { type: 'boolean', const: true } },
                            },
                        ),
                        ...problems(422),
                    },
                },
            },
            '/auth/logout': {
                post: { operationId: 'logout', responses: { 204: ok('Logged out.') } },
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
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            required: ['email'],
                            properties: { email: { type: 'string' } },
                        }),
                    },
                    responses: {
                        204: ok('A reset link was sent, if the account exists.'),
                        ...problems(422),
                    },
                },
            },
            '/auth/password/reset': {
                post: {
                    operationId: 'resetPassword',
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
                    responses: { 204: ok('The password was reset.'), ...problems(422) },
                },
            },
            '/auth/two-factor/challenge': {
                post: {
                    operationId: 'twoFactorChallenge',
                    requestBody: {
                        required: true,
                        content: json({
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                recoveryCode: { type: 'string' },
                            },
                        }),
                    },
                    responses: { 200: ok('Logged in.', ref('Session')), ...problems(422) },
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
                            ...queryParameter('q', 'Search terms.', { type: 'string' }),
                            required: true,
                        },
                    ],
                    responses: {
                        200: ok('Results grouped by resource.', ref('SearchResponse')),
                        ...problems(401),
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
        },
        components: { schemas: createComponentSchemas() },
    };
}
