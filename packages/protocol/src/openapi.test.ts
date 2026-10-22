import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    createBootConfigJsonSchema,
    createDefinitionJsonSchema,
    createOpenApiDocument,
    createThemeJsonSchema,
} from './openapi';

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
                '/resources/{resource}/actions/{action}',
                '/actions/runs/{run}',
                '/uploads/sign',
                '/auth/session',
                '/search',
            ]),
        );
    });

    it('only references schemas it defines', () => {
        const missing = [...collectRefs(document)].filter((ref) => {
            const name = ref.replace('#/components/schemas/', '');
            return !(name in document.components.schemas);
        });
        expect(missing).toEqual([]);
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
