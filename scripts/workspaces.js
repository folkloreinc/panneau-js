// Runs a script in every workspace package that has it, dependencies first.
//
//     node scripts/workspaces.js <script> [-- <args>]
//
// `npm run <script> --workspaces` runs packages in alphabetical order, but the declarations of a
// package (`tsc -p tsconfig.build.json`) and its API report need the declarations of the packages
// it depends on. This script orders the packages by their `@panneau/*` dependencies.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const [script, ...rest] = process.argv.slice(2);
const args = rest[0] === '--' ? rest.slice(1) : rest;

if (script === undefined) {
    console.error('Usage: node scripts/workspaces.js <script> [-- <args>]');
    process.exit(1);
}

const packagesFolder = resolve(root, 'packages');
const packages = readdirSync(packagesFolder)
    .map((folder) => resolve(packagesFolder, folder, 'package.json'))
    .filter((path) => existsSync(path))
    .map((path) => JSON.parse(readFileSync(path, 'utf8')))
    .sort((a, b) => a.name.localeCompare(b.name));
const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));

/** Packages in dependency order: each one comes after the workspace packages it depends on. */
const ordered = [];
const visiting = new Set();
const visit = (pkg) => {
    if (ordered.includes(pkg)) {
        return;
    }
    if (visiting.has(pkg)) {
        throw new Error(`Dependency cycle through ${pkg.name}.`);
    }
    visiting.add(pkg);
    Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies, ...pkg.devDependencies })
        .map((name) => byName.get(name))
        .filter((dependency) => dependency !== undefined)
        .forEach(visit);
    visiting.delete(pkg);
    ordered.push(pkg);
};
packages.forEach(visit);

for (const pkg of ordered) {
    if (pkg.scripts?.[script] === undefined) {
        continue;
    }
    console.log(`\n> ${pkg.name}: ${script}`);
    execFileSync(
        'npm',
        ['run', script, '-w', pkg.name, ...(args.length > 0 ? ['--', ...args] : [])],
        {
            cwd: root,
            stdio: 'inherit',
        },
    );
}
