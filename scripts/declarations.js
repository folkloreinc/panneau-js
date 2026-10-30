// Writes the declarations of the package in the current directory, through its `build` and `api`
// scripts:
//
//     node ../../scripts/declarations.js
//
// It runs `tsc -p tsconfig.build.json`, then rewrites the `.d.ts` files of `dist/` so that they
// work under every module resolution, `NodeNext` included (#140): relative specifiers get their
// file and extension (`./schemas` → `./schemas/index.js`), and CSS Modules are declared in place
// (see config/declarations.ts). The JavaScript that Vite writes already has its extensions.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { rewriteDeclarations } from '../config/declarations.ts';

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], { stdio: 'inherit' });

const files = readdirSync(resolve('dist'), { recursive: true, withFileTypes: true }).filter(
    (entry) => entry.isFile() && entry.name.endsWith('.d.ts'),
);
for (const file of files) {
    const path = resolve(file.parentPath, file.name);
    const source = readFileSync(path, 'utf8');
    const output = rewriteDeclarations(source, file.parentPath);
    if (output !== source) {
        writeFileSync(path, output);
    }
}
