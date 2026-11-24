import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import { componentTokens } from './components';
import { FALLBACK_SEMANTIC_TOKENS, SEMANTIC_TOKENS } from './semanticTokens';

const source = join(import.meta.dirname, '..');
/** Every package: their stylesheets read the tokens of `@panneau/ui` too. */
const packages = join(import.meta.dirname, '../../..');

/** The files of a directory, at any depth, whose name ends with `extension`. */
function filesOf(directory: string, extension: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return entry.name === 'node_modules' ? [] : filesOf(path, extension);
        }
        return entry.name.endsWith(extension) ? [path] : [];
    });
}

/** The `src` folder of every package. */
const sources = readdirSync(packages, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packages, entry.name, 'src'))
    .filter((path) => existsSync(path));

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
                .replace(/\s+/g, ' ')
                // A long fallback that Prettier breaks after `(` and before `)`
                .replace(/\( /g, '(')
                .replace(/ \)/g, ')'),
        });
    }
    return found;
}

const defaults = new Map(
    Object.entries(componentTokens).flatMap(([, tokens]) => Object.entries(tokens)),
);
const prefixes = Object.keys(componentTokens).map((component) => `panneau-${component}-`);
const files = sources
    .flatMap((directory) => filesOf(directory, '.module.css'))
    .map((path) => ({
        path: relative(packages, path),
        css: readFileSync(path, 'utf8'),
        vars: readVars(readFileSync(path, 'utf8')),
    }));
/** The component tokens that the other packages declare, by their prefix: `panneau-sidebar-`. */
const packagePrefixes = sources
    .filter((directory) => directory !== source)
    .flatMap((directory) => filesOf(directory, '.ts'))
    .flatMap((path) =>
        [...readFileSync(path, 'utf8').matchAll(/defineComponentTokens\(\s*'([a-z0-9-]+)'/g)].map(
            (match) => `panneau-${match[1] ?? ''}-`,
        ),
    );
const known = new Set<string>([...SEMANTIC_TOKENS, ...defaults.keys()]);

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
        const declared = files
            .filter(({ path }) => path.startsWith('ui/'))
            .flatMap(({ path, css }) =>
                [...css.matchAll(/(--panneau-[a-z0-9-]+)\s*:/g)]
                    .map((match) => match[1] ?? '')
                    .filter((name) => prefixes.some((prefix) => name.startsWith(`--${prefix}`)))
                    .map((name) => `${path}: ${name}`),
            );
        expect(declared).toEqual([]);
    });

    it('are the only variables that stylesheets read, with the semantic tokens and the tones', () => {
        // Private variables start with `_` (decision 0024): `--_panneau-dock-gap`.
        const unknown = files.flatMap(({ path, vars }) =>
            vars
                .filter(({ name }) => name.startsWith('panneau-'))
                .filter(
                    ({ name }) =>
                        !known.has(name) &&
                        !name.startsWith('panneau-palette-') &&
                        !name.startsWith('panneau-tone-') &&
                        !packagePrefixes.some((prefix) => name.startsWith(prefix)),
                )
                .map(({ name }) => `${path}: --${name}`),
        );
        expect([...new Set(unknown)]).toEqual([]);
    });
});

describe('semantic tokens read with a fallback', () => {
    it('are always read with the token they default to as the fallback', () => {
        const problems = files.flatMap(({ path, vars }) =>
            vars.flatMap(({ name, fallback }) => {
                const expected = (FALLBACK_SEMANTIC_TOKENS as Record<string, string>)[name];
                return expected !== undefined && fallback !== expected
                    ? [`${path}: --${name} falls back to ${fallback}, not ${expected}`]
                    : [];
            }),
        );
        expect(problems).toEqual([]);
    });
});
