// Checks the package template: creates a package and a React package in a temporary folder, then
// checks that they pass lint, formatting, typecheck, tests, build and API reports.
//
//     npm run test:create-package [-- --keep]
//
// The temporary folder is in .tmp/ (ignored by git), so that the packages resolve the root
// node_modules and the shared configs like the ones in packages/.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values: options } = parseArgs({ options: { keep: { type: 'boolean', default: false } } });

const root = resolve(import.meta.dirname, '..');
mkdirSync(resolve(root, '.tmp'), { recursive: true });
const folder = mkdtempSync(resolve(root, '.tmp/create-package-'));

const run = (command, args, cwd = root) => {
    console.log(`\n$ ${command} ${args.join(' ')}  (in ${relative(root, cwd) || '.'})`);
    execFileSync(command, args, { cwd, stdio: 'inherit' });
};

const variants = [
    { name: 'example', args: [] },
    { name: 'example-react', args: ['--react'] },
];

try {
    for (const { name, args } of variants) {
        const packageFolder = resolve(folder, name);
        run('node', ['scripts/create-package.js', name, ...args, '--dir', folder]);
        // .tmp/ is ignored by the repository's lint config, so lint the files explicitly.
        run('npx', ['eslint', '--no-ignore', `${packageFolder}/src`, `${packageFolder}/*.ts`]);
        run('npx', ['prettier', '--check', '--ignore-path', '.prettierignore', packageFolder]);
        run('npm', ['run', 'typecheck'], packageFolder);
        run('npx', ['vitest', 'run'], packageFolder);
        run('npm', ['run', 'build'], packageFolder);
        run('npm', ['run', 'api'], packageFolder);
        if (!existsSync(resolve(packageFolder, `api/${name}.api.md`))) {
            throw new Error(`${name}: api/${name}.api.md was not written.`);
        }
        run('npm', ['run', 'api', '--', '--check'], packageFolder);
    }
    console.log('\nThe package template is OK.');
} finally {
    if (options.keep) {
        console.log(`Kept ${relative(root, folder)}.`);
    } else {
        rmSync(folder, { recursive: true, force: true });
    }
}
