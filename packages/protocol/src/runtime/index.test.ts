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
            'ADDRESS_PARTS',
            'AUTH_ERROR_CODES',
            'AUTH_ERROR_PARAM',
            'AUTH_PAGE_PATHS',
            'BOOT_CONFIG_ELEMENT_ID',
            'BUILT_IN_ACTIONS',
            'BUILT_IN_FIELD_TYPES',
            'BUILT_IN_ITEM_ACTIONS',
            'BUILT_IN_LAYOUT_NODE_TYPES',
            'BUILT_IN_LINK_ACTIONS',
            'BUILT_IN_LINK_TYPES',
            'BUILT_IN_LIST_LAYOUTS',
            'BUILT_IN_WIDGET_TYPES',
            'CONTEXT_HEADER',
            'CONTEXT_PROBLEM_TYPE',
            'CURRENCY_CODES',
            'DATE_RANGE_OPEN_BOUNDS',
            'DEFAULT_ADDRESS_REQUIRED_PARTS',
            'DURATION_UNITS',
            'EMAIL_UNVERIFIED_PROBLEM_TYPE',
            'ITEM_ACTION_ABILITIES',
            'PASSWORD_CONFIRMATION_PROBLEM_TYPE',
            'PORTABLE_RULES',
            'POSTAL_CODE_COUNTRIES',
            'PROBLEM_CONTENT_TYPE',
            'PROTOCOL_VERSION',
            'RESERVED_ROUTE_SEGMENTS',
            'RESOURCE_WIDGET_TYPES',
            'RICH_TEXT_STYLE_ELEMENTS',
            'SEARCH_DEFAULT_LIMIT',
            'SEARCH_MAX_LENGTH',
            'SEARCH_MAX_LIMIT',
            'SEARCH_MIN_LENGTH',
            'TWO_FACTOR_REQUIRED_PROBLEM_TYPE',
            'UNDO_LIMIT',
            'WIDGET_LIST_MAX_ITEMS',
            'WIDGET_RESERVED_QUERY_PARAMS',
            'WIDGET_SERIES_PERIODS',
            'checkRules',
            'checkValues',
            'checkWidgetData',
            'contextBefore',
            'evaluateCondition',
            'formatContextHeader',
            'fromMinorUnits',
            'fromSearchParams',
            'getAddressRequiredParts',
            'getCurrencyDigits',
            'getItemImageField',
            'getLinkNewTab',
            'getLinkTypes',
            'getMediaLibraries',
            'getNestedShape',
            'getValue',
            'getWidgetResource',
            'isAddressPart',
            'isBuiltInFieldType',
            'isBuiltInItemAction',
            'isBuiltInLink',
            'isBuiltInLinkType',
            'isBuiltInWidgetType',
            'isCompoundField',
            'isCurrencyCode',
            'isCursorPage',
            'isExternalUrl',
            'isFilled',
            'isFilterRange',
            'isPostalCode',
            'isProblem',
            'isSearchableResource',
            'lintDefinition',
            'matchesFilterRange',
            'matchesRatio',
            'mergeThemes',
            'normalizePostalCode',
            'parseContextHeader',
            'parseRatio',
            'readSearchQuery',
            'renderedCropSize',
            'resolveLinkNewTab',
            'toMinorUnits',
            'toSearchParams',
            'toSearchQueryParams',
        ]);
    });

    it('is also exported, with the same values, by the main entry point', () => {
        Object.entries(runtime).forEach(([name, value]) => {
            expect(protocol[name as keyof typeof protocol]).toBe(value);
        });
    });
});
