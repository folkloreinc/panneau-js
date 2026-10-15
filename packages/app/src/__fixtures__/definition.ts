import type { BootConfigInput, DefinitionInput } from '@panneau/protocol';

/** A small definition, with `external` auth. */
export function createDefinition(overrides: Partial<DefinitionInput> = {}): DefinitionInput {
    return {
        protocol: 1,
        name: 'Test site',
        locale: 'en',
        locales: ['en', 'fr'],
        api: { baseUrl: '/panneau/api' },
        resources: [
            {
                id: 'pages',
                label: { singular: 'page', plural: 'pages' },
                fields: [{ name: 'title', type: 'text' }],
            },
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                fields: [{ name: 'name', type: 'text' }],
            },
        ],
        auth: { mode: 'external', loginUrl: '/login?from=definition' },
        user: { id: 'usr_1', name: 'Ada' },
        ...overrides,
    };
}

/** A boot config for an app at `/panneau`. */
export function createBootConfig(overrides: Partial<BootConfigInput> = {}): BootConfigInput {
    return {
        protocol: 1,
        apiBaseUrl: '/panneau/api',
        basePath: '/panneau',
        locale: 'en',
        ...overrides,
    };
}
