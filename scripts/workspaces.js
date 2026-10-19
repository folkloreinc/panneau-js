// Runs a script in every workspace package that has it, dependencies first.
//
//     node scripts/workspaces.js <script> [--parallel | --any-order] [-- <args>]
//
// `npm run <script> --workspaces` runs packages in alphabetical order, but the declarations of a
// package (`tsc -p tsconfig.build.json`) and its API report need the declarations of the packages
// it depends on. This script orders the packages by their `@panneau/*` dependencies.
//
// With `--parallel`, packages run at the same time (one per CPU), each one as soon as the
// packages it depends on are done. The output of each package is printed when it finishes.
// `--any-order` runs them at the same time without waiting for dependencies, for scripts that
// read the sources of the other packages rather than their builds (`typecheck`).
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

/** Workspace packages in dependency order: each one comes after the packages it depends on. */
export function readWorkspacePackages() {
    const packagesFolder = resolve(root, 'packages');
    const packages = readdirSync(packagesFolder)
        .map((folder) => resolve(packagesFolder, folder))
        .filter((folder) => existsSync(resolve(folder, 'package.json')))
        .map((folder) => ({
            folder,
            ...JSON.parse(readFileSync(resolve(folder, 'package.json'), 'utf8')),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));

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
        pkg.workspaceDependencies = Object.keys({
            ...pkg.dependencies,
            ...pkg.peerDependencies,
            ...pkg.devDependencies,
        })
            .map((name) => byName.get(name))
            .filter((dependency) => dependency !== undefined);
        pkg.workspaceDependencies.forEach(visit);
        visiting.delete(pkg);
        ordered.push(pkg);
    };
    packages.forEach(visit);
    return ordered;
}

/**
 * Runs `command` in each package, up to one per CPU at a time. With `ordered`, a package starts
 * only once the packages it depends on succeeded. Each package's output is printed when it
 * finishes, under its name. Resolves to `true` when every package succeeded.
 */
export function runInPackages(packages, command, args, { ordered = true } = {}) {
    const concurrency = availableParallelism();
    const pending = [...packages];
    const done = new Set();
    let running = 0;
    let failed = false;

    return new Promise((resolvePromise) => {
        const next = () => {
            if (running === 0 && (failed || pending.length === 0)) {
                resolvePromise(!failed);
                return;
            }
            while (!failed && running < concurrency) {
                const index = pending.findIndex(
                    (pkg) =>
                        !ordered ||
                        pkg.workspaceDependencies.every(
                            (dependency) => !packages.includes(dependency) || done.has(dependency),
                        ),
                );
                if (index === -1) {
                    return;
                }
                const [pkg] = pending.splice(index, 1);
                running += 1;
                const child = spawn(command, args, {
                    cwd: pkg.folder,
                    // The output goes through a pipe: keep the colors when it ends in a terminal.
                    env: process.stdout.isTTY ? { ...process.env, FORCE_COLOR: '1' } : process.env,
                });
                const output = [];
                child.stdout.on('data', (chunk) => output.push(chunk));
                child.stderr.on('data', (chunk) => output.push(chunk));
                child.on('close', (code) => {
                    running -= 1;
                    process.stdout.write(`\n> ${pkg.name}: ${[command, ...args].join(' ')}\n`);
                    process.stdout.write(Buffer.concat(output));
                    if (code === 0) {
                        done.add(pkg);
                    } else {
                        failed = true;
                        console.error(`${pkg.name} failed (exit code ${code}).`);
                    }
                    next();
                });
            }
        };
        next();
    });
}

if (process.argv[1] === import.meta.filename) {
    const [script, ...rest] = process.argv.slice(2);
    const separator = rest.indexOf('--');
    const flags = separator === -1 ? rest : rest.slice(0, separator);
    const args = separator === -1 ? [] : rest.slice(separator + 1);

    if (
        script === undefined ||
        flags.some((flag) => !['--parallel', '--any-order'].includes(flag))
    ) {
        console.error(
            'Usage: node scripts/workspaces.js <script> [--parallel | --any-order] [-- <args>]',
        );
        process.exit(1);
    }

    const packages = readWorkspacePackages().filter((pkg) => pkg.scripts?.[script] !== undefined);
    const npmArgs = ['run', script, ...(args.length > 0 ? ['--', ...args] : [])];

    if (flags.length > 0) {
        const ordered = !flags.includes('--any-order');
        process.exitCode = (await runInPackages(packages, 'npm', npmArgs, { ordered })) ? 0 : 1;
    } else {
        for (const pkg of packages) {
            console.log(`\n> ${pkg.name}: ${script}`);
            execFileSync('npm', npmArgs, { cwd: pkg.folder, stdio: 'inherit' });
        }
    }
}
