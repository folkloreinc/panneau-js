import Ajv2020 from 'ajv/dist/2020';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import {
    createBootConfigJsonSchema,
    createDefinitionJsonSchema,
    createOpenApiDocument,
    createThemeJsonSchema,
} from './openapi';
import { Definition } from './schemas';

function collectRefs(value: unknown, refs: Set<string> = new Set()): Set<string> {
    if (Array.isArray(value)) {
        value.forEach((item) => collectRefs(item, refs));
    } else if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([key, child]) => {
            if (key === '$ref' && typeof child === 'string') {
                refs.add(child);
            } else {
                collectRefs(child, refs);
            }
        });
    }
    return refs;
}

describe('OpenAPI document', () => {
    const document = createOpenApiDocument() as {
        openapi: string;
        paths: Record<string, unknown>;
        components: { schemas: Record<string, unknown> };
    };

    it('is an OpenAPI 3.1 document', () => {
        expect(document.openapi).toBe('3.1.0');
    });

    it('describes the protocol routes', () => {
        expect(Object.keys(document.paths)).toEqual(
            expect.arrayContaining([
                '/definition',
                '/resources/{resource}',
                '/resources/{resource}/{id}',
                '/resources/{resource}/{id}/duplicate',
                '/resources/{resource}/actions/{action}',
                '/actions/runs/{run}',
                '/uploads/sign',
                '/auth/session',
                '/search',
            ]),
        );
    });

    it('answers a 409 when a copy conflicts with another item', () => {
        const duplicate = (
            document.paths as Record<
                string,
                { post?: { responses?: Record<string, { description?: string }> } }
            >
        )['/resources/{resource}/{id}/duplicate'];
        expect(Object.keys(duplicate?.post?.responses ?? {})).toEqual(
            expect.arrayContaining(['201', '403', '404', '409']),
        );
        expect(duplicate?.post?.responses?.['409']?.description).toContain('unique value');
    });

    it("answers a 422 for a list cursor it can't read", () => {
        const list = (document.paths as Record<string, { get?: { responses?: object } }>)[
            '/resources/{resource}'
        ];
        expect(Object.keys(list?.get?.responses ?? {})).toContain('422');
    });

    it('only references schemas and parameters it defines', () => {
        const missing = [...collectRefs(document)].filter((ref) => {
            const [, , kind = '', name = ''] = ref.split('/');
            const components = document.components as Record<string, Record<string, unknown>>;
            return !(name in (components[kind] ?? {}));
        });
        expect(missing).toEqual([]);
    });

    it('takes the Panneau-Context header on every path (decision 0045)', () => {
        const paths = Object.values(document.paths as Record<string, { parameters?: unknown[] }>);
        paths.forEach((item) =>
            expect(item.parameters).toContainEqual({ $ref: '#/components/parameters/Context' }),
        );
        expect(
            (document.paths as Record<string, object>)['/context/{param}/options'],
        ).toBeDefined();
    });
});

describe('generated files', () => {
    const read = (name: string): unknown =>
        JSON.parse(readFileSync(resolve(import.meta.dirname, '../schema', name), 'utf8'));

    it('are up to date (run `npm run build` in packages/protocol)', () => {
        expect(read('definition.schema.json')).toEqual(createDefinitionJsonSchema());
        expect(read('openapi.json')).toEqual(createOpenApiDocument());
        expect(read('boot.schema.json')).toEqual(createBootConfigJsonSchema());
        expect(read('theme.schema.json')).toEqual(createThemeJsonSchema());
    });
});

describe('the JSON Schema of the definition', () => {
    const validate = new Ajv2020({ strict: false }).compile(createDefinitionJsonSchema());
    const withAction = (action: Record<string, unknown>) => {
        const definition = createDefinition();
        definition.resources[0]?.actions?.push(action as never);
        return definition;
    };
    const cases: [string, Record<string, unknown>, boolean][] = [
        ['a built-in link without a label', { id: 'edit', kind: 'link', scope: ['item'] }, true],
        ['`show` without a label', { id: 'show', kind: 'link', scope: ['item'] }, true],
        ['an action without a label', { id: 'publish', scope: ['item'] }, false],
        ['`delete` without a label', { id: 'delete', scope: ['item', 'selection'] }, true],
        ['a built-in id on a server action', { id: 'edit', label: 'Edit', scope: ['item'] }, false],
        [
            'a link without a url or a route',
            { id: 'site', label: 'Site', kind: 'link', scope: ['item'] },
            false,
        ],
        [
            'a link with a route',
            { id: 'job', label: 'Job', kind: 'link', route: 'job', scope: ['item'] },
            true,
        ],
        [
            'a client action without a component',
            { id: 'copy', label: 'Copy', kind: 'client', scope: ['item'] },
            false,
        ],
    ];

    it.each(cases)('checks %s as the schemas do', (_name, action, valid) => {
        const definition = withAction(action);
        expect(validate(definition)).toBe(valid);
        expect(Definition.safeParse(definition).success).toBe(valid);
    });
});
