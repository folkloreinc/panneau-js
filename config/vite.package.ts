import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

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

interface PackageJson {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
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
        plugins: withReact ? [react(), babel({ presets: [reactCompilerPreset()] })] : [],
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: true,
            minify: false,
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
                },
            },
        },
        test: {
            environment,
            include: ['src/**/*.test.{ts,tsx}'],
            setupFiles:
                environment === 'jsdom' ? [resolve(import.meta.dirname, 'vitest.setup.ts')] : [],
        },
    });
}
