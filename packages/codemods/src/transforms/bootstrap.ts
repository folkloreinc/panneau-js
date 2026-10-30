// Panneau 5 has no Bootstrap: components style themselves with CSS Modules and design tokens.
// The Bootstrap classes of custom components are reported, not rewritten: they are replaced with
// `@panneau/ui` primitives, or styled by the Bootstrap-compatible theme.
import type { ASTPath, JSXAttribute } from 'jscodeshift';

import type { TransformApi } from '../context';

/** Prefixes of Bootstrap classes, which always have a suffix: `mb-3`, `btn-primary`. */
const PREFIXED =
    /^(d|m[tbsexylr]?|p[tbsexylr]?|g[xy]?|gap|row-cols|col|offset|order|flex|justify-content|align-(items|self|content)|text|fw|fs|fst|lh|bg|border|rounded|shadow|w|h|mw|mh|vw|vh|position|top|bottom|start|end|float|overflow|opacity|z|ratio|display|btn|card|badge|alert|list-group|nav|navbar|dropdown|modal|table|form|input-group|spinner|progress|pagination|breadcrumb|container|bi)-[a-z0-9-]+$/;

/** Bootstrap classes without a suffix. */
const STANDALONE = new Set([
    'row',
    'col',
    'container',
    'btn',
    'close',
    'card',
    'badge',
    'alert',
    'nav',
    'navbar',
    'dropdown',
    'modal',
    'table',
    'small',
    'lead',
    'visible',
    'invisible',
    'visually-hidden',
    'sr-only',
    'border',
    'rounded',
    'shadow',
    'bi',
]);

/** Whether a class is one of Bootstrap 5 (and 4's `ml-*`, `sr-only`), or of Bootstrap Icons. */
export function isBootstrapClass(name: string): boolean {
    return STANDALONE.has(name) || PREFIXED.test(name);
}

/** The literal strings of an expression: class names and `classNames({ 'mb-3': … })` keys. */
function collectStrings(node: unknown, strings: string[]): void {
    if (node === null || typeof node !== 'object') {
        return;
    }
    const value = node as { type?: string; value?: unknown; quasis?: { value: { raw: string } }[] };
    if (
        (value.type === 'StringLiteral' || value.type === 'Literal') &&
        typeof value.value === 'string'
    ) {
        strings.push(value.value);
        return;
    }
    if (value.type === 'TemplateLiteral') {
        (value.quasis ?? []).forEach((quasi) => strings.push(quasi.value.raw));
    }
    Object.entries(node).forEach(([key, child]) => {
        if (key !== 'loc' && key !== 'comments' && key !== 'tokens') {
            if (Array.isArray(child)) {
                child.forEach((item) => collectStrings(item, strings));
            } else if (typeof child === 'object' && child !== null && key !== 'type') {
                collectStrings(child, strings);
            }
        }
    });
}

export function reportBootstrap(api: TransformApi): void {
    const { j, root } = api;
    const classes = new Set<string>();
    let first: ASTPath | null = null;
    root.find(j.JSXAttribute, { name: { name: 'className' } }).forEach(
        (path: ASTPath<JSXAttribute>) => {
            const strings: string[] = [];
            collectStrings(path.node.value, strings);
            const found = strings
                .flatMap((string) => string.split(/\s+/))
                .filter((name) => name !== '' && isBootstrapClass(name));
            if (found.length > 0) {
                first ??= path;
                found.forEach((name) => classes.add(name));
            }
        },
    );
    if (classes.size > 0) {
        api.report(
            first,
            'bootstrap',
            `Bootstrap classes (${[...classes].map((name) => `\`${name}\``).join(', ')}): Panneau 5 has no Bootstrap; use \`@panneau/ui\` primitives (\`Stack\`, \`Inline\`, \`Button\`), CSS Modules with design tokens, or the Bootstrap-compatible theme`,
        );
    }
}
