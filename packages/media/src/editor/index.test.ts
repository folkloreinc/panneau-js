import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import * as editor from './index';

/** The modules a module loads at runtime: its imports and re-exports, except type-only ones. */
function runtimeImports(file: string): string[] {
    const source = readFileSync(file, 'utf8');
    const statements = source.matchAll(
        /^(?:import|export)\s+(type\s+)?(?:[^'";]*?\s+from\s+)?'([^']+)';/gms,
    );
    return [...statements]
        .filter(([statement, typeOnly]) => {
            if (typeOnly !== undefined) {
                return false;
            }
            // `import { type A, type B } from` loads nothing either.
            const names = /\{([^}]*)\}/.exec(statement)?.[1];
            return (
                names === undefined ||
                names
                    .split(',')
                    .map((name) => name.trim())
                    .some((name) => name !== '' && !name.startsWith('type '))
            );
        })
        .map(([, , specifier]) => specifier as string);
}

/** The packages a module loads at runtime, directly or through the modules it imports. */
function runtimePackages(entry: string): Set<string> {
    const files = new Set<string>();
    const packages = new Set<string>();
    const visit = (file: string) => {
        if (files.has(file)) {
            return;
        }
        files.add(file);
        for (const specifier of runtimeImports(file)) {
            if (!specifier.startsWith('.')) {
                packages.add(specifier);
                continue;
            }
            if (specifier.endsWith('.css')) {
                continue;
            }
            const base = resolve(dirname(file), specifier);
            const found = [`${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts')].find(
                (candidate) => existsSync(candidate),
            );
            if (found === undefined) {
                throw new Error(`Cannot resolve ${specifier} from ${file}`);
            }
            visit(found);
        }
    };
    visit(entry);
    return packages;
}

describe('@panneau/media/editor', () => {
    it('loads neither @panneau/data nor @panneau/core, and only the runtime of the protocol', () => {
        const packages = [...runtimePackages(resolve(import.meta.dirname, 'index.ts'))];
        expect(packages.filter((name) => name.startsWith('@panneau/')).sort()).toEqual([
            '@panneau/intl',
            '@panneau/protocol/runtime',
            '@panneau/ui',
        ]);
    });

    it('exports the editor, its dialog and its tools', () => {
        expect(Object.keys(editor)).toEqual([
            'ImageEditor',
            'ImageEditorDialog',
            'useImageEditorTools',
        ]);
    });
});
