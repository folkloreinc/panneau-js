import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import MagicString from 'magic-string';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import {
    type Plugin,
    type UserConfig,
    defaultClientConditions,
    defaultServerConditions,
} from 'vite';
import { defineConfig } from 'vitest/config';

import { stableClassName } from './class-names.ts';

interface PackageConfigOptions {
    /** Package directory (pass `import.meta.dirname`). */
    root: string;
    /** Entry points, keyed by output name: `{ index: 'src/index.ts', mock: 'src/mock/index.ts' }`. */
    entries: Record<string, string>;
    /** Compile React components with the React Compiler. */
    react?: boolean;
    /** Test environment: `node` (default) or `jsdom` for components. */
    environment?: 'node' | 'jsdom';
}

/**
 * Export condition that points a workspace package to its sources, so that tests and typechecks
 * use the other packages without building them first. Packages list it first in their `exports`.
 */
export const SOURCE_CONDITION = '@panneau/source';

interface PackageJson {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}

/**
 * Class names of CSS Modules: stable and readable (`panneau-card-header`), the same in builds,
 * tests and Storybook (decision 0024). Consumers get plain CSS files whose classes are already
 * named, so their bundler needs no CSS Modules support.
 */
export const cssModules = { generateScopedName: stableClassName };

/**
 * Keeps the CSS of each module next to it, imported by the module (`import './Button.css'`), so
 * that any bundler (Vite, webpack) includes the CSS of the modules a project uses, and only those
 * (decisions 0005 and 0019). Vite's library mode otherwise bundles every style into one file that
 * nothing imports.
 */
function importCss(): Plugin {
    return {
        name: 'panneau:import-css',
        apply: 'build',
        enforce: 'post',
        renderChunk(code, chunk) {
            const css = [...(chunk.viteMetadata?.importedCss ?? [])];
            if (css.length === 0) {
                return null;
            }
            const from = dirname(chunk.fileName);
            const imports = css
                .map((file) => {
                    const path = relative(from, file).split('\\').join('/');
                    return `import '${path.startsWith('.') ? path : `./${path}`}';\n`;
                })
                .join('');
            const output = new MagicString(code);
            output.prepend(imports);
            return { code: output.toString(), map: output.generateMap({ hires: 'boundary' }) };
        },
    };
}

/**
 * Shared build and test config of the `@panneau/*` packages: an ESM library build where every
 * dependency and peer dependency stays external, and a Vitest project.
 */
export function definePackageConfig({
    root,
    entries,
    react: withReact = false,
    environment = 'node',
}: PackageConfigOptions): UserConfig {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as PackageJson;
    const externals = [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
    ];

    return defineConfig({
        root,
        plugins: [
            ...(withReact ? [react(), babel({ presets: [reactCompilerPreset()] })] : []),
            importCss(),
        ],
        // Dependencies stay external in builds, so this only applies to tests.
        resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
        ssr: { resolve: { conditions: [SOURCE_CONDITION, ...defaultServerConditions] } },
        css: { modules: cssModules },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: true,
            minify: false,
            cssCodeSplit: true,
            lib: {
                entry: Object.fromEntries(
                    Object.entries(entries).map(([name, path]) => [name, resolve(root, path)]),
                ),
                formats: ['es'],
            },
            rolldownOptions: {
                external: (id) =>
                    id.startsWith('node:') ||
                    externals.some((name) => id === name || id.startsWith(`${name}/`)),
                output: {
                    preserveModules: true,
                    preserveModulesRoot: resolve(root, 'src'),
                    entryFileNames: '[name].js',
                    // `Button.module.css` becomes `Button.css`: its classes are already scoped,
                    // and bundlers would scope them again as a CSS Module.
                    assetFileNames: (asset) =>
                        (asset.names[0] ?? '[name][extname]').replace(/\.module\.css$/, '.css'),
                },
            },
        },
        test: {
            environment,
            // Each test file still gets its own context, but the environment (jsdom) is created
            // once per worker instead of once per file, which took over a third of the test time.
            pool: 'vmThreads',
            include: ['src/**/*.test.{ts,tsx}'],
            setupFiles:
                environment === 'jsdom' ? [resolve(import.meta.dirname, 'vitest.setup.ts')] : [],
        },
    });
}
