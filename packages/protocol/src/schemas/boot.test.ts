import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createBootConfigJsonSchema } from '../openapi';
import { validateBootConfig } from '../validate';
import type { BootConfigInput } from './index';

function createBootConfig(overrides: Partial<BootConfigInput> = {}): BootConfigInput {
    return {
        protocol: 1,
        apiBaseUrl: '/panneau/api',
        basePath: '/panneau',
        locale: 'fr',
        ...overrides,
    };
}

describe('BootConfig', () => {
    it('accepts the minimal boot config', () => {
        expect(validateBootConfig(createBootConfig())).toEqual({
            success: true,
            data: createBootConfig(),
        });
    });

    it('accepts an inlined definition, with defaults applied', () => {
        const result = validateBootConfig(
            createBootConfig({ definition: createDefinition(), loginUrl: '/login' }),
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.definition?.name).toBe('Test site');
            expect(result.data.loginUrl).toBe('/login');
        }
    });

    it('keeps properties it does not know, so later versions can add some', () => {
        const result = validateBootConfig({ ...createBootConfig(), futureOption: true });
        expect(result.success && result.data).toHaveProperty('futureOption', true);
    });

    it.each(['/', '/panneau', '/panneau/', '/admin/panneau'])(
        'accepts the base path %s',
        (basePath) => {
            expect(validateBootConfig(createBootConfig({ basePath })).success).toBe(true);
        },
    );

    it.each([
        '',
        'panneau',
        '//panneau',
        '/panneau?x=1',
        '/panneau#top',
        'https://example.com/panneau',
    ])('refuses the base path %j', (basePath) => {
        expect(validateBootConfig(createBootConfig({ basePath })).success).toBe(false);
    });

    it('requires the API base URL, the base path, the locale and version 1 of the protocol', () => {
        const result = validateBootConfig({ protocol: 2 });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues.map((issue) => issue.path)).toEqual([
                'protocol',
                'apiBaseUrl',
                'basePath',
                'locale',
            ]);
        }
    });

    it('checks the inlined definition, with paths from the boot config', () => {
        const definition = createDefinition() as unknown as { resources: { fields: unknown[] }[] };
        definition.resources[0]?.fields.push({ name: '', type: 'text' });
        const result = validateBootConfig({ ...createBootConfig(), definition });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues.map((issue) => issue.path)).toContain(
                'definition.resources.0.fields.6.name',
            );
        }
    });

    it('checks the references of the inlined definition', () => {
        const definition = createDefinition();
        definition.resources[0]?.list?.columns?.push({ field: 'missing' });
        const result = validateBootConfig(createBootConfig({ definition }));
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues[0]?.path).toMatch(/^definition\.resources\.0\.list\.columns\./);
        }
    });
});

describe('boot config JSON Schema', () => {
    it('references the definition schema', () => {
        const schema = createBootConfigJsonSchema() as {
            properties: Record<string, unknown>;
            required: string[];
            $defs: Record<string, unknown>;
        };
        expect(schema.required).toEqual(['protocol', 'apiBaseUrl', 'basePath', 'locale']);
        expect(schema.$defs).toHaveProperty('Definition');
        expect(JSON.stringify(schema.properties.definition)).toContain('#/$defs/Definition');
    });
});
