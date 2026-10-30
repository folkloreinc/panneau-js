import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, mergeConfig } from 'vite';
import { describe, expect, it } from 'vitest';

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
            /The React Compiler skipped 1 function\(s\)[^\n]*\n {2}src\/index\.tsx:3: .*ESLint rules were disabled/,
        );
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
