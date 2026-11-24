import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, mergeConfig } from 'vite';
import { describe, expect, it } from 'vitest';

import { readOptOuts } from './react-compiler';
import { definePackageConfig } from './vite.package';

/** Builds a module as the React packages are built, and returns its code. */
async function buildModule(source: string): Promise<string> {
    // The real path, as the compiler gets it (`/tmp` is a link on macOS).
    const root = await realpath(await mkdtemp(join(tmpdir(), 'panneau-react-compiler-')));
    try {
        await mkdir(join(root, 'src'));
        await writeFile(join(root, 'src/index.tsx'), source);
        await writeFile(
            join(root, 'package.json'),
            JSON.stringify({ name: 'fixture', peerDependencies: { react: '*' } }),
        );
        const config = definePackageConfig({
            root,
            entries: { index: 'src/index.tsx' },
            react: true,
        });
        const result = await build(
            mergeConfig(config, { configFile: false, logLevel: 'silent', build: { write: false } }),
        );
        const output = Array.isArray(result) ? result[0] : result;
        if (output === undefined || !('output' in output)) {
            throw new Error('The build returned no output.');
        }
        return output.output[0].code;
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

const MEMO_CACHE = /from "react\/compiler-runtime"[\s\S]*const \$ = c\(\d+\)/;

describe('React Compiler', () => {
    it('compiles a component with defaults in its props', async () => {
        // React Compiler 1.0 skips these on Babel 8: `@babel/core` has to stay on Babel 7.
        const code = await buildModule(`
            export function Fieldset({ errors = [], isRequired = false }: {
                errors?: readonly string[];
                isRequired?: boolean;
            }) {
                return <p>{isRequired ? '*' : null}{errors.join(', ')}</p>;
            }
        `);
        expect(code).toMatch(MEMO_CACHE);
    });

    it('fails the build when it skips a component', async () => {
        await expect(
            buildModule(`
                export function Label({ text }: { text: string }) {
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    return <p>{text}</p>;
                }
            `),
        ).rejects.toThrow(
            /The React Compiler skipped 1 function\(s\)[^\n]*\n {2}the function at src\/index\.tsx:2\n {4}src\/index\.tsx:3: .*ESLint rules were disabled/,
        );
    });

    it('counts a function once, with each reason under it', async () => {
        const error = await buildModule(`
            export function Label({ text }: { text: string }) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                const shown = text;
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return <p>{shown}</p>;
            }
        `).catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(Error);
        const { message } = error as Error;
        expect(message).toMatch(/The React Compiler skipped 1 function\(s\)/);
        expect(message).toMatch(
            /the function at src\/index\.tsx:2\n {4}src\/index\.tsx:3: [^\n]+\n {4}src\/index\.tsx:5: /,
        );
    });

    it("still fails when 'use no memo' is only in a comment of the function", async () => {
        await expect(
            buildModule(`
                export function Label({ text }: { text: string }) {
                    // don't 'use no memo' here: fix the code instead
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    return <p>{text}</p>;
                }
            `),
        ).rejects.toThrow(/The React Compiler skipped 1 function\(s\)/);
    });

    it("lets a whole file opt out with 'use no memo' at its top", async () => {
        const code = await buildModule(`
            'use no memo';

            export function Label({ text }: { text: string }) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                return <p>{text}</p>;
            }
        `);
        expect(code).not.toMatch(MEMO_CACHE);
    });

    it("lets a component opt out with 'use no memo'", async () => {
        const code = await buildModule(`
            export function Label({ text }: { text: string }) {
                'use no memo';
                // eslint-disable-next-line react-hooks/exhaustive-deps
                return <p>{text}</p>;
            }
        `);
        expect(code).not.toMatch(MEMO_CACHE);
    });
});

describe('readOptOuts', () => {
    const startOf = (source: string, marker: string) => source.indexOf(marker);

    it('reads a leading directive of the function body only', () => {
        const source = `
            export function First() {
                'use no memo';
                return null;
            }
            export const Second = () => {
                const note = 'use no memo';
                return note;
            };
            export function Third() {
                // 'use no memo'
                return null;
            }
            export function Fourth() {
                f();
                'use no memo';
            }
            const object = {
                method() {
                    "use no forget";
                },
            };
        `;
        const optsOut = readOptOuts(source, 'index.tsx');
        expect(optsOut(startOf(source, 'function First'))).toBe(true);
        expect(optsOut(startOf(source, '() =>'))).toBe(false);
        expect(optsOut(startOf(source, 'function Third'))).toBe(false);
        expect(optsOut(startOf(source, 'function Fourth'))).toBe(false);
        expect(optsOut(startOf(source, 'method()'))).toBe(true);
    });

    it('reads a directive at the top of the file, for every function', () => {
        const source = `"use no memo";\nexport function Label() { return null; }`;
        expect(readOptOuts(source, 'index.tsx')(startOf(source, 'function'))).toBe(true);
        const later = `export const a = 1;\n'use no memo';\nexport function Label() { return null; }`;
        expect(readOptOuts(later, 'index.tsx')(startOf(later, 'function'))).toBe(false);
    });

    it('parses TypeScript without JSX in .ts files', () => {
        const source = `export function useValue() { 'use no memo'; return <string>value; }`;
        expect(readOptOuts(source, 'index.ts')(startOf(source, 'function'))).toBe(true);
    });
});
