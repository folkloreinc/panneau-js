// Creates a v5 package from the template.
//
//     npm run create-package -- <name> [--react] [--description <text>] [--dir <folder>]
//
// <name> is the package name without the scope: `fields` creates `@panneau/fields` in
// packages/fields. `--react` sets up a package of React components. `--dir` creates the package
// in another folder than packages/ (used by scripts/check-create-package.js).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { format, resolveConfig } from 'prettier';

const root = resolve(import.meta.dirname, '..');

const { values: options, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        react: { type: 'boolean', default: false },
        description: { type: 'string' },
        dir: { type: 'string' },
    },
});

const [name] = positionals;
if (name === undefined || positionals.length > 1 || !/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error(
        'Usage: npm run create-package -- <name> [--react] [--description <text>] [--dir <folder>]',
    );
    console.error('<name> is in kebab case, without the scope: `fields` for @panneau/fields.');
    process.exit(1);
}

const packageName = `@panneau/${name}`;
const packageFolder = resolve(options.dir ?? resolve(root, 'packages'), name);
if (existsSync(packageFolder)) {
    console.error(`${relative(process.cwd(), packageFolder)} already exists.`);
    process.exit(1);
}

/** Path from the package to the repository root, for the shared configs. */
const toRoot = relative(packageFolder, root).split(sep).join('/');
const react = options.react;
const description = options.description ?? 'TODO: describe the package in one sentence.';

/** All `@panneau/*` packages share one version (decision 0001). */
function getVersion() {
    const packagesFolder = resolve(root, 'packages');
    const versions = readdirSync(packagesFolder)
        .map((folder) => resolve(packagesFolder, folder, 'package.json'))
        .filter((path) => existsSync(path))
        .map((path) => JSON.parse(readFileSync(path, 'utf8')).version);
    return versions[0] ?? '5.0.0-alpha.0';
}

const packageJson = {
    name: packageName,
    version: getVersion(),
    description,
    type: 'module',
    license: 'MIT',
    repository: {
        type: 'git',
        url: 'git+https://github.com/folkloreinc/panneau-js.git',
        directory: relative(root, packageFolder).split(sep).join('/'),
    },
    // Component styles are CSS files that consumers must not tree-shake away.
    sideEffects: react ? ['*.css'] : false,
    exports: {
        '.': {
            types: './dist/index.d.ts',
            default: './dist/index.js',
        },
        './package.json': './package.json',
    },
    files: ['dist'],
    scripts: {
        build: 'vite build && tsc -p tsconfig.build.json',
        typecheck: 'tsc --noEmit',
        api: `tsc -p tsconfig.build.json && node ${toRoot}/scripts/api-report.js`,
    },
    publishConfig: {
        access: 'public',
    },
    ...(react ? { peerDependencies: { react: '^19.2.0' } } : {}),
};

const tsconfig = {
    extends: `${toRoot}/tsconfig.base.json`,
    compilerOptions: {
        types: react ? ['node', '@testing-library/jest-dom/vitest'] : ['node'],
        allowImportingTsExtensions: true,
        noEmit: true,
    },
    include: ['src', 'vite.config.ts'],
};

const tsconfigBuild = {
    extends: `${toRoot}/tsconfig.base.json`,
    compilerOptions: {
        rootDir: 'src',
        outDir: 'dist',
        emitDeclarationOnly: true,
    },
    include: ['src'],
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/__fixtures__'],
};

const viteConfig = `
import { definePackageConfig } from '${toRoot}/config/vite.package.ts';

export default definePackageConfig({
    root: import.meta.dirname,
    entries: {
        index: 'src/index.ts',
    },
    ${react ? "react: true, environment: 'jsdom'," : ''}
});
`;

// The template exports a placeholder so that the package builds and has a test from the start.
// Replace it with the package's first real module.
const sources = react
    ? {
          'src/index.ts': `export { Example, type ExampleProps } from './Example';\n`,
          'src/Example.tsx': `
export interface ExampleProps {
    /** Text of the example. */
    label: string;
}

/** Placeholder: replace it with the package's first component. */
export function Example({ label }: ExampleProps) {
    return <p>{label}</p>;
}
`,
          'src/Example.test.tsx': `
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Example } from './Example';

describe('Example', () => {
    it('renders its label', () => {
        render(<Example label="Hello" />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });
});
`,
      }
    : {
          'src/index.ts': `export { example } from './example';\n`,
          'src/example.ts': `
/** Placeholder: replace it with the package's first module. */
export function example(value: string): string {
    return value.trim();
}
`,
          'src/example.test.ts': `
import { describe, expect, it } from 'vitest';

import { example } from './example';

describe('example', () => {
    it('trims its value', () => {
        expect(example(' Hello ')).toBe('Hello');
    });
});
`,
      };

const readme = `
# ${packageName}

${description}

\`\`\`ts
import { ${react ? 'Example' : 'example'} } from '${packageName}';
\`\`\`

| Export | Content |
| --- | --- |
| \`${packageName}\` | TODO |

The package layout, scripts and API reports are explained in [\`docs/packages.md\`](${relative(packageFolder, resolve(root, 'docs/packages.md')).split(sep).join('/')}).
`;

const files = {
    'package.json': `${JSON.stringify(packageJson, null, 4)}\n`,
    'tsconfig.json': JSON.stringify(tsconfig),
    'tsconfig.build.json': JSON.stringify(tsconfigBuild),
    'vite.config.ts': viteConfig,
    'README.md': readme,
    ...sources,
};

for (const [file, content] of Object.entries(files)) {
    const path = resolve(packageFolder, file);
    const config = await resolveConfig(path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, await format(content, { ...config, filepath: path }));
}

const folder = relative(process.cwd(), packageFolder);
console.log(`Created ${packageName} in ${folder}. Next steps:

1. \`npm install\` to link the new workspace.
2. Replace the placeholder in ${folder}/src with the first real module, and fill in the README.
3. \`npm run api -w ${packageName}\` to write its API report.
4. \`npx changeset\`: "Add \`${packageName}\`."`);
