import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import * as protocol from '../index';
import * as runtime from './index';

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

/** Every module that the module loads at runtime, directly or not, with bare specifiers as is. */
function runtimeGraph(entry: string): Set<string> {
    const seen = new Set<string>();
    const visit = (file: string) => {
        if (seen.has(file)) {
            return;
        }
        seen.add(file);
        runtimeImports(file).forEach((specifier) => {
            if (!specifier.startsWith('.')) {
                seen.add(specifier);
                return;
            }
            const base = resolve(dirname(file), specifier);
            const candidates = [`${base}.ts`, resolve(base, 'index.ts')];
            const found = candidates.find((candidate) => {
                try {
                    readFileSync(candidate);
                    return true;
                } catch {
                    return false;
                }
            });
            if (found === undefined) {
                throw new Error(`Cannot resolve ${specifier} from ${file}`);
            }
            visit(found);
        });
    };
    visit(entry);
    return seen;
}

describe('@panneau/protocol/runtime', () => {
    it('never loads zod, directly or through another module', () => {
        const graph = runtimeGraph(resolve(import.meta.dirname, 'index.ts'));
        expect([...graph].filter((module) => !module.startsWith('/'))).toEqual([]);
        expect([...graph].some((module) => module.includes('/schemas/'))).toBe(false);
    });

    it('sees zod from the main entry point, as a check of the graph itself', () => {
        const graph = runtimeGraph(resolve(import.meta.dirname, '../index.ts'));
        expect(graph.has('zod')).toBe(true);
    });

    it('exports the constants and the runtime helpers', () => {
        expect(Object.keys(runtime).sort()).toEqual([
            'BOOT_CONFIG_ELEMENT_ID',
            'BUILT_IN_ACTIONS',
            'BUILT_IN_FIELD_TYPES',
            'BUILT_IN_LAYOUT_NODE_TYPES',
            'BUILT_IN_LIST_LAYOUTS',
            'PORTABLE_RULES',
            'PROBLEM_CONTENT_TYPE',
            'PROTOCOL_VERSION',
            'checkRules',
            'checkValues',
            'evaluateCondition',
            'fromSearchParams',
            'getMediaLibraries',
            'getValue',
            'isFilled',
            'isFilterRange',
            'isProblem',
            'lintDefinition',
            'matchesFilterRange',
            'mergeThemes',
            'toSearchParams',
        ]);
    });

    it('is also exported, with the same values, by the main entry point', () => {
        Object.entries(runtime).forEach(([name, value]) => {
            expect(protocol[name as keyof typeof protocol]).toBe(value);
        });
    });
});
