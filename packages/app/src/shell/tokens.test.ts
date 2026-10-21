import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import { appComponentTokens } from './tokens';

// The checks of the component tokens of @panneau/ui (decision 0024), on the stylesheets of the app.

const source = join(import.meta.dirname, '..');

function cssModules(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return cssModules(path);
        }
        return entry.name.endsWith('.module.css') ? [path] : [];
    });
}

/** Every `var(--<name>, <fallback>)` of a stylesheet, with its balanced fallback. */
function readVars(css: string): { name: string; fallback: string | null }[] {
    return [...css.matchAll(/var\(\s*--([a-z0-9-]+)\s*(,|\))/g)].map((match) => {
        const name = match[1] ?? '';
        if (match[2] === ')') {
            return { name, fallback: null };
        }
        let depth = 1;
        let index = (match.index ?? 0) + match[0].length;
        const from = index;
        while (index < css.length && depth > 0) {
            depth += css[index] === '(' ? 1 : css[index] === ')' ? -1 : 0;
            index += 1;
        }
        return {
            name,
            fallback: css
                .slice(from, index - 1)
                .trim()
                .replace(/\s+/g, ' '),
        };
    });
}

const defaults = new Map(
    Object.values(appComponentTokens).flatMap((tokens) => Object.entries(tokens)),
);
const prefixes = Object.keys(appComponentTokens).map((component) => `panneau-${component}-`);
const files = cssModules(source).map((path) => ({
    path: relative(source, path),
    css: readFileSync(path, 'utf8'),
}));
const vars = files.flatMap(({ path, css }) => readVars(css).map((found) => ({ path, ...found })));

describe('the component tokens of the app', () => {
    it('are read in the CSS with their declared default as the fallback', () => {
        const problems = vars
            .filter(({ name }) => prefixes.some((prefix) => name.startsWith(prefix)))
            .flatMap(({ path, name, fallback }) => {
                const expected = defaults.get(name);
                if (expected === undefined) {
                    return [`${path}: --${name} is not declared in tokens.ts`];
                }
                return fallback === expected
                    ? []
                    : [`${path}: --${name} falls back to ${fallback}, not ${expected}`];
            });
        expect(problems).toEqual([]);
    });

    it('are all used by a stylesheet', () => {
        const used = new Set(vars.map(({ name }) => name));
        expect([...defaults.keys()].filter((name) => !used.has(name))).toEqual([]);
    });

    it('are never declared by the stylesheets themselves', () => {
        const declared = files.flatMap(({ path, css }) =>
            [...css.matchAll(/(--panneau-[a-z0-9-]+)\s*:/g)]
                .map((match) => match[1] ?? '')
                .filter((name) => prefixes.some((prefix) => name.startsWith(`--${prefix}`)))
                .map((name) => `${path}: ${name}`),
        );
        expect(declared).toEqual([]);
    });
});
