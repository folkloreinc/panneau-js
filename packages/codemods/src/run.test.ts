import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { runCli } from './cli';
import { runCodemods } from './run';

const FIELD = [
    "import TextField from '@panneau/field-text';",
    '',
    'export default function TitleField({ value, onChange }) {',
    '    return <TextField value={value} onChange={onChange} append="!" />;',
    '}',
    '',
].join('\n');

describe('runCodemods', () => {
    let folder: string;

    beforeEach(async () => {
        folder = await mkdtemp(join(tmpdir(), 'panneau-codemods-'));
        await mkdir(join(folder, 'js/fields'), { recursive: true });
        await mkdir(join(folder, 'js/node_modules/@panneau/app'), { recursive: true });
        await writeFile(join(folder, 'js/fields/Title.jsx'), FIELD);
        await writeFile(join(folder, 'js/node_modules/@panneau/app/index.js'), FIELD);
    });

    afterEach(async () => {
        await rm(folder, { recursive: true, force: true });
    });

    it('writes nothing with `dry`', async () => {
        const result = await runCodemods({ paths: ['js'], dry: true, cwd: folder });
        expect(result.files).toEqual(['js/fields/Title.jsx']);
        expect(result.changed).toEqual(['js/fields/Title.jsx']);
        expect(await readFile(join(folder, 'js/fields/Title.jsx'), 'utf8')).toBe(FIELD);
    });

    it('rewrites the files', async () => {
        await runCodemods({ paths: ['js'], cwd: folder });
        const output = await readFile(join(folder, 'js/fields/Title.jsx'), 'utf8');
        expect(output).toContain("import { TextField } from '@panneau/fields/text';");
        expect(output).toContain('suffix="!"');
        expect(output).toContain('export function TitleFieldEntry(props) {');
    });

    describe('the command', () => {
        it('prints its usage without a command', async () => {
            const logs: string[] = [];
            expect(await runCli([], { cwd: folder, log: (text) => logs.push(text) })).toBe(2);
            expect(logs.join('')).toContain('Usage: panneau-codemods v4-to-v5');
        });

        it('prints the report of a dry run', async () => {
            const logs: string[] = [];
            expect(
                await runCli(['v4-to-v5', 'js', '--dry'], {
                    cwd: folder,
                    log: (text) => logs.push(text),
                }),
            ).toBe(0);
            expect(logs.join('')).toContain('1 files read, 1 would change, 0 findings.');
            expect(await readFile(join(folder, 'js/fields/Title.jsx'), 'utf8')).toBe(FIELD);
        });

        it('prints JSON', async () => {
            const logs: string[] = [];
            await runCli(['v4-to-v5', 'js', '--dry', '--json'], {
                cwd: folder,
                log: (text) => logs.push(text),
            });
            expect(JSON.parse(logs.join(''))).toEqual({
                files: ['js/fields/Title.jsx'],
                changed: ['js/fields/Title.jsx'],
                findings: [],
            });
        });

        it('fails when a file cannot be parsed', async () => {
            await writeFile(join(folder, 'js/broken.js'), 'export default (');
            expect(
                await runCli(['v4-to-v5', 'js', '--dry'], { cwd: folder, log: () => undefined }),
            ).toBe(1);
        });
    });
});
