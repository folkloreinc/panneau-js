// Checks that the declarations of the published packages work in a TypeScript project on
// `"module": "NodeNext"`, as Node backends and monorepos use (#140).
//
//     npm run build && npm run test:types
//
// It packs every `@panneau/*` package (`npm pack`), installs the tarballs into an empty ES module
// project with every peer dependency and the types of React, imports every entry point that has
// `types`, and typechecks it with `tsc`, without `skipLibCheck`: a relative specifier that Node's
// resolution can't follow in a `.d.ts` file fails the check, rather than leaving the types it
// re-exports missing.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { readWorkspacePackages } from './workspaces.js';

const root = resolve(import.meta.dirname, '..');
const work = resolve(root, '.tmp/smoke-types');
const tarballs = resolve(work, 'tarballs');
const app = resolve(work, 'app');

function run(command, args, cwd) {
    console.log(`$ ${command} ${args.join(' ')}`);
    execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function installedVersion(name) {
    return JSON.parse(readFileSync(resolve(root, 'node_modules', name, 'package.json'), 'utf8'))
        .version;
}

const packages = readWorkspacePackages();
for (const { folder, name } of packages) {
    if (!existsSync(resolve(folder, 'dist'))) {
        console.error(`${name} has no dist: run \`npm run build\` first.`);
        process.exit(1);
    }
}

rmSync(work, { recursive: true, force: true });
mkdirSync(tarballs, { recursive: true });
mkdirSync(app, { recursive: true });
run(
    'npm',
    ['pack', '--pack-destination', tarballs, ...packages.flatMap(({ name }) => ['-w', name])],
    root,
);

const packed = Object.fromEntries(
    readdirSync(tarballs).map((file) => {
        const { name } = packages.find(
            (candidate) =>
                file.replace(/-\d+\.\d+\.\d+.*\.tgz$/, '') ===
                candidate.name.replace('@', '').replace('/', '-'),
        );
        return [name, `file:${join(tarballs, file)}`];
    }),
);
const peers = [
    ...new Set(packages.flatMap((pkg) => Object.keys(pkg.peerDependencies ?? {}))),
    '@types/react',
    '@types/react-dom',
    'typescript',
];

writeFileSync(
    resolve(app, 'package.json'),
    `${JSON.stringify(
        {
            name: 'panneau-smoke-types',
            private: true,
            type: 'module',
            dependencies: {
                ...packed,
                ...Object.fromEntries(peers.map((name) => [name, installedVersion(name)])),
            },
            // The packages depend on each other at their shared version: use the tarballs.
            overrides: packed,
        },
        null,
        4,
    )}\n`,
);
writeFileSync(
    resolve(app, 'tsconfig.json'),
    `${JSON.stringify(
        {
            compilerOptions: {
                module: 'NodeNext',
                moduleResolution: 'NodeNext',
                target: 'ES2022',
                lib: ['ESNext', 'DOM', 'DOM.Iterable'],
                jsx: 'react-jsx',
                strict: true,
                noEmit: true,
                skipLibCheck: false,
            },
            include: ['index.ts'],
        },
        null,
        4,
    )}\n`,
);

// Every entry point with types, then types that the main entry points only re-export.
const entryPoints = packages.flatMap(({ name, exports = {} }) =>
    Object.entries(exports)
        .filter(([, target]) => typeof target === 'object' && target.types !== undefined)
        .map(([subpath]) => (subpath === '.' ? name : `${name}${subpath.slice(1)}`)),
);
writeFileSync(
    resolve(app, 'index.ts'),
    [
        ...entryPoints.map(
            (specifier, index) => `import type * as entry${index} from '${specifier}';`,
        ),
        "import { Panneau, createPanneauApp } from '@panneau/app';",
        "import { createRestAdapter } from '@panneau/data';",
        "import { type Definition, validateDefinition } from '@panneau/protocol';",
        "import { Button } from '@panneau/ui';",
        '',
        'export type Checked = Definition;',
        'export const checked = [Panneau, createPanneauApp, createRestAdapter, validateDefinition, Button];',
        '',
    ].join('\n'),
);

run('npm', ['install', '--no-audit', '--no-fund', '--no-package-lock'], app);
run('npx', ['tsc', '-p', 'tsconfig.json'], app);
console.log(
    `The declarations of ${entryPoints.length} entry points typecheck under NodeNext, without skipLibCheck.`,
);
