// Runs the checks of CI locally, one after the other, and stops at the first one that fails.
//
//     npm run verify
//
// The same checks as .github/workflows/ci.yml, in the same way, fastest first. Storybook and the
// smoke test need Chromium for Playwright (`npx playwright install chromium`). The changeset
// check compares with origin/v5.x as it is locally: fetch it first.
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root })
    .toString()
    .trim();
// Like CI: v5.x itself and "Version packages" branches need no changeset.
const needsChangeset = branch !== 'v5.x' && !branch.startsWith('changeset-release/');

const checks = [
    ['Format', 'npm', ['run', 'format:check']],
    ['Lint', 'npm', ['run', 'lint']],
    ...(needsChangeset
        ? [['Changeset', 'npx', ['changeset', 'status', '--since=origin/v5.x']]]
        : []),
    ['Typecheck (root)', 'npx', ['tsc', '-p', 'tsconfig.json']],
    ['Typecheck (packages)', 'npm', ['run', 'typecheck']],
    ['Test', 'npm', ['test']],
    ['Build', 'npm', ['run', 'build']],
    ['API reports', 'node', ['scripts/api-report.js', '--workspaces', '--check']],
    ['Package template', 'npm', ['run', 'test:create-package']],
    ['Storybook tests', 'npm', ['run', 'test:storybook']],
    ['Storybook build', 'npm', ['run', 'build-storybook', '--', '--quiet']],
    ['Smoke test', 'npm', ['run', 'test:smoke']],
    ['Types (NodeNext)', 'npm', ['run', 'test:types']],
];

const results = [];
for (const [name, command, args] of checks) {
    console.log(`\n=== ${name}: ${command} ${args.join(' ')}\n`);
    const start = performance.now();
    const { status } = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
    results.push({ name, seconds: (performance.now() - start) / 1000, passed: status === 0 });
    if (status !== 0) {
        break;
    }
}

console.log('\n=== Summary\n');
for (const { name, seconds, passed } of results) {
    console.log(`${passed ? 'ok  ' : 'FAIL'}  ${name.padEnd(22)} ${seconds.toFixed(1)} s`);
}
const total = results.reduce((sum, { seconds }) => sum + seconds, 0);
const failed = results.some(({ passed }) => !passed);
console.log(`\n${failed ? 'Failed' : 'All checks passed'} in ${total.toFixed(1)} s.`);
process.exitCode = failed ? 1 : 0;
