import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { resolveSpecifier, rewriteDeclarations } from './declarations';

const folder = resolve('/dist');
const files = new Set(['/dist/rest.d.ts', '/dist/schemas/index.d.ts', '/dist/query/keys.d.ts']);
const exists = (path: string) => files.has(path);

describe('resolveSpecifier', () => {
    it('adds the extension of a module, or the index of a folder', () => {
        expect(resolveSpecifier('./rest', folder, exists)).toBe('./rest.js');
        expect(resolveSpecifier('./schemas', folder, exists)).toBe('./schemas/index.js');
        expect(resolveSpecifier('./query/keys', folder, exists)).toBe('./query/keys.js');
        expect(resolveSpecifier('../rest', resolve('/dist/query'), exists)).toBe('../rest.js');
    });

    it('keeps a specifier with an extension', () => {
        expect(resolveSpecifier('./rest.js', folder, exists)).toBe('./rest.js');
    });

    it('throws when no declaration file matches', () => {
        expect(() => resolveSpecifier('./missing', folder, exists)).toThrow(
            'No declaration file for "./missing"',
        );
    });
});

describe('rewriteDeclarations', () => {
    it('rewrites the specifiers of exports, imports and import types', () => {
        const source = [
            "export * from './schemas';",
            "export { createRestAdapter, type RestAdapterOptions } from './rest';",
            "import type { SearchKeyOptions } from './query/keys';",
            "export declare const adapter: import('./rest').RestAdapter;",
            "import { z } from 'zod';",
        ].join('\n');
        expect(rewriteDeclarations(source, folder, exists)).toBe(
            [
                "export * from './schemas/index.js';",
                "export { createRestAdapter, type RestAdapterOptions } from './rest.js';",
                "import type { SearchKeyOptions } from './query/keys.js';",
                "export declare const adapter: import('./rest.js').RestAdapter;",
                "import { z } from 'zod';",
            ].join('\n'),
        );
    });

    it('declares CSS Modules in place, since projects cannot resolve them', () => {
        expect(
            rewriteDeclarations("import styles from './Button.module.css';", folder, exists),
        ).toBe('declare const styles: Readonly<Record<string, string>>;');
    });

    it('leaves comments as they are', () => {
        const source = [
            '/**',
            " * Messages, or a function that loads them (`() => import('./lang/fr')`).",
            " * import { Form } from './forms';",
            ' */',
        ].join('\n');
        expect(rewriteDeclarations(source, folder, exists)).toBe(source);
    });
});
