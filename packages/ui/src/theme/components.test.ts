import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import { componentTokens } from './components';

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
    const found: { name: string; fallback: string | null }[] = [];
    const start = /var\(\s*--([a-z0-9-]+)\s*(,|\))/g;
    for (const match of css.matchAll(start)) {
        const name = match[1] ?? '';
        if (match[2] === ')') {
            found.push({ name, fallback: null });
            continue;
        }
        let depth = 1;
        let index = (match.index ?? 0) + match[0].length;
        const from = index;
        while (index < css.length && depth > 0) {
            const character = css[index];
            if (character === '(') {
                depth += 1;
            } else if (character === ')') {
                depth -= 1;
            }
            index += 1;
        }
        found.push({
            name,
            fallback: css
                .slice(from, index - 1)
                .trim()
                .replace(/\s+/g, ' '),
        });
    }
    return found;
}

const defaults = new Map(
    Object.entries(componentTokens).flatMap(([, tokens]) => Object.entries(tokens)),
);
const prefixes = Object.keys(componentTokens).map((component) => `panneau-${component}-`);
const files = cssModules(source).map((path) => ({
    path: relative(source, path),
    vars: readVars(readFileSync(path, 'utf8')),
}));

describe('component tokens', () => {
    it('are read in the CSS with their declared default as the fallback', () => {
        const problems = files.flatMap(({ path, vars }) =>
            vars
                .filter(({ name }) => prefixes.some((prefix) => name.startsWith(prefix)))
                .flatMap(({ name, fallback }) => {
                    const expected = defaults.get(name);
                    if (expected === undefined) {
                        return [`${path}: --${name} is not declared in a tokens.ts file`];
                    }
                    if (fallback !== expected) {
                        return [`${path}: --${name} falls back to ${fallback}, not ${expected}`];
                    }
                    return [];
                }),
        );
        expect(problems).toEqual([]);
    });

    it('are all used by a stylesheet', () => {
        const used = new Set(files.flatMap(({ vars }) => vars.map(({ name }) => name)));
        expect([...defaults.keys()].filter((name) => !used.has(name))).toEqual([]);
    });

    it('are never declared by the components themselves', () => {
        const declared = files.flatMap(({ path }) =>
            [...readFileSync(join(source, path), 'utf8').matchAll(/(--panneau-[a-z0-9-]+)\s*:/g)]
                .map((match) => match[1] ?? '')
                .filter((name) => prefixes.some((prefix) => name.startsWith(`--${prefix}`)))
                .map((name) => `${path}: ${name}`),
        );
        expect(declared).toEqual([]);
    });
});
