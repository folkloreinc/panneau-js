// What a pull request needs to test: the packages it changes and the packages that depend on them,
// through their `@panneau/*` dependencies.
//
//     node scripts/affected.js --base <ref> [--target storybook|test] [--github]
//
// Prints the paths to give Vitest as filters (`packages/app/ packages/lists/`), one test run for
// the packages that may have changed. With `--github`, it writes them to `$GITHUB_OUTPUT` instead:
//
// - `run`: `false` when the change can't affect a test of the target (docs, changesets), and the
//   job skips them;
// - `filters`: the paths, empty to run everything.
//
// A change to anything shared (root configs, `.storybook/`, `config/`, `scripts/`, the lockfile,
// CI itself) runs everything. CI only uses this on pull requests: pushes to v5.x and the merge
// queue run everything.
//
// It only uses Node's own modules, so that CI runs it before installing the dependencies.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { readWorkspacePackages } from './workspaces.js';

/** Files that no test reads. */
const IGNORED = [/^docs\//, /^\.changeset\//, /^legacy\//, /^smoke\//, /^[^/]+\.md$/, /^LICENSE$/];

/**
 * The folders (`packages/app`) of the packages that `changedFiles` changes, and of every package
 * that depends on them, or `all` when a change is shared by every package.
 *
 * @param {string[]} changedFiles Paths from the root of the repository.
 * @param {{ name: string, folder: string, workspaceDependencies: { name: string }[] }[]} packages
 *   With `folder` relative to the root.
 */
export function affectedPackages(changedFiles, packages) {
    const changed = new Set();
    let playground = false;
    for (const file of changedFiles) {
        if (IGNORED.some((pattern) => pattern.test(file))) {
            continue;
        }
        if (file.startsWith('playground/')) {
            playground = true;
            continue;
        }
        const pkg = packages.find(({ folder }) => file.startsWith(`${folder}/`));
        if (!pkg) {
            // Root configs, `.storybook/`, `config/`, `scripts/`, `.github/`, the lockfile, a new
            // package folder without package.json yet…
            return { all: true, folders: [], playground: true };
        }
        changed.add(pkg.name);
    }

    // Add the dependents until nothing changes.
    let added = true;
    while (added) {
        added = false;
        for (const pkg of packages) {
            if (
                !changed.has(pkg.name) &&
                pkg.workspaceDependencies.some(({ name }) => changed.has(name))
            ) {
                changed.add(pkg.name);
                added = true;
            }
        }
    }

    const folders = packages
        .filter(({ name }) => changed.has(name))
        .map(({ folder }) => folder)
        .sort();
    // The playground's tests run on the sources of the packages.
    return { all: false, folders, playground: playground || folders.length > 0 };
}

/**
 * What to run for `target`: `run` is false when there is nothing to test, and `filters` are the
 * paths to pass to Vitest, none to run everything.
 *
 * @param {{ all: boolean, folders: string[], playground: boolean }} affected
 * @param {'storybook' | 'test'} target `storybook` has stories in packages only; `test` also runs
 *   the playground's tests.
 */
export function vitestFilters(affected, target) {
    if (affected.all) {
        return { run: true, filters: [] };
    }
    const filters = affected.folders.map((folder) => `${folder}/`);
    if (target === 'test' && affected.playground) {
        filters.push('playground/');
    }
    return { run: filters.length > 0, filters };
}

if (process.argv[1] === import.meta.filename) {
    const { values } = parseArgs({
        options: {
            base: { type: 'string' },
            target: { type: 'string', default: 'storybook' },
            github: { type: 'boolean', default: false },
        },
    });
    if (!values.base || !['storybook', 'test'].includes(values.target)) {
        console.error(
            'Usage: node scripts/affected.js --base <ref> [--target storybook|test] [--github]',
        );
        process.exit(1);
    }
    const root = resolve(import.meta.dirname, '..');
    const changedFiles = execFileSync(
        'git',
        ['diff', '--name-only', '--no-renames', `${values.base}...HEAD`],
        { cwd: root, encoding: 'utf8' },
    )
        .split('\n')
        .filter(Boolean);
    const packages = readWorkspacePackages().map((pkg) => ({
        ...pkg,
        folder: pkg.folder.slice(root.length + 1),
    }));
    const affected = affectedPackages(changedFiles, packages);
    const { run, filters } = vitestFilters(affected, values.target);

    const summary = !run
        ? 'Nothing to test.'
        : affected.all
          ? 'Everything: a shared file changed.'
          : `Only ${filters.join(' ')}`;
    console.log(`${changedFiles.length} changed files. ${values.target}: ${summary}`);
    if (values.github) {
        appendFileSync(process.env.GITHUB_OUTPUT, `run=${run}\nfilters=${filters.join(' ')}\n`);
    } else {
        console.log(filters.join(' '));
    }
}
