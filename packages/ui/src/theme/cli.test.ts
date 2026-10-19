import { mkdtemp, readFileSync, writeFile } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

import { runCheckTheme } from './cli';

async function themeFile(name: string, content: string): Promise<string> {
    const directory = await promisify(mkdtemp)(join(tmpdir(), 'panneau-theme-'));
    const path = join(directory, name);
    await promisify(writeFile)(path, content);
    return path;
}

async function run(args: string[], load?: (url: string) => Promise<Record<string, unknown>>) {
    const lines: string[] = [];
    const errors: string[] = [];
    const code = await runCheckTheme(
        args,
        { log: (text) => lines.push(text), error: (text) => errors.push(text) },
        load,
    );
    return { code, output: lines.join('\n'), errors: errors.join('\n') };
}

describe('panneau-check-theme', () => {
    it('reports contrast failures of a JSON theme, and exits with 1', async () => {
        const path = await themeFile(
            'theme.json',
            JSON.stringify({
                label: 'Pale',
                tokens: {
                    'panneau-color-text-muted': '#aaaaaa',
                    'panneau-color-surface': '#ffffff',
                },
            }),
        );
        const { code, output } = await run([path]);
        expect(code).toBe(1);
        expect(output).toContain('Pale: ');
        expect(output).toContain(
            'fail       light  tokens: muted text on surface: #aaaaaa on #ffffff',
        );
    });

    it('reads a theme from an export of a module, and prints JSON', async () => {
        // Vitest can't import a file outside of the project: the smoke test runs the real binary.
        const brand = {
            tokens: { 'panneau-color-text': '#111111', 'panneau-color-bg': '#ffffff' },
        };
        const urls: string[] = [];
        const { code, output } = await run(['theme.mjs', '--export', 'brand', '--json'], (url) => {
            urls.push(url);
            return Promise.resolve({ brand });
        });
        expect(code).toBe(0);
        expect(urls[0]).toMatch(/^file:\/\/.*\/theme\.mjs$/);
        expect(JSON.parse(output)).toMatchObject({ failures: [], colorDifferences: [] });
    });

    it('explains what is wrong with its arguments', async () => {
        expect((await run([])).code).toBe(2);
        const path = await themeFile('empty.json', '{}');
        const { code, errors } = await run([path]);
        expect(code).toBe(2);
        expect(errors).toContain('is not a theme');
    });
});

describe('@panneau/ui/theme', () => {
    it('imports no CSS, so that Node can load it', () => {
        const seen = new Set<string>();
        const visit = (file: string) => {
            if (seen.has(file)) {
                return;
            }
            seen.add(file);
            const source = readFileSync(file, 'utf8');
            [...source.matchAll(/^(?:import|export)[^'"]*from '(\.[^']+)'/gm)].forEach((match) => {
                const target = match[1] ?? '';
                expect(target, `${file} imports ${target}`).not.toMatch(/\.css$/);
                visit(resolve(dirname(file), `${target}.ts`));
            });
        };
        visit(join(import.meta.dirname, 'index.ts'));
        expect(seen.size).toBeGreaterThan(10);
    });
});
