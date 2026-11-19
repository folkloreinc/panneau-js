// Runs the checks of CI locally, one after the other, and stops at the first one that fails.
//
//     npm run verify
//
// The same checks as .github/workflows/ci.yml, in the same way, fastest first. Storybook and the
// smoke test need Chromium for Playwright (`npx playwright install chromium`). The changeset
// check compares with origin/v5.x as it is locally: fetch it first.
//
//     node scripts/verify.js --decisions
//
// only checks that the table of docs/decisions/README.md and the `Status:` line of each record
// agree: the same state, and the same decisions that amend, extend or supersede it.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

/**
 * The state of a status ("accepted" in "Accepted, amended by 0035"), and the numbers of the
 * decisions it names, sorted.
 */
function parseStatus(status, numbers) {
    const state = status.match(/^[A-Za-z]+/)?.[0].toLowerCase() ?? '';
    return { state, refs: [...new Set(numbers)].sort().join(', ') };
}

/** The problems between the table of docs/decisions/README.md and the records. */
function checkDecisions() {
    const dir = resolve(root, 'docs/decisions');
    const states = ['proposed', 'accepted', 'deprecated', 'superseded', 'rejected'];
    const problems = [];
    const records = readdirSync(dir).filter((file) => /^\d{4}-.+\.md$/.test(file));
    const rows = new Map();
    const table = readFileSync(resolve(dir, 'README.md'), 'utf8');
    for (const line of table.split('\n')) {
        // | [0045](0045-current-context.md) | A current context… | Accepted |
        const row = line.match(/^\|\s*\[(\d{4})\]\(([^)]+)\)\s*\|.*\|\s*([^|]*?)\s*\|\s*$/);
        if (!row) {
            continue;
        }
        const [, number, file, status] = row;
        if (rows.has(number)) {
            problems.push(`${number}: two rows in the table`);
        }
        rows.set(number, { file, status });
    }
    for (const file of records) {
        const number = file.slice(0, 4);
        const row = rows.get(number);
        rows.delete(number);
        if (!row) {
            problems.push(`${number}: no row in the table of README.md`);
            continue;
        }
        if (row.file !== file) {
            problems.push(`${number}: the table links to ${row.file}, not ${file}`);
        }
        const text = readFileSync(resolve(dir, file), 'utf8');
        const line = text.match(/^- Status: (.+)$/m)?.[1];
        if (!line) {
            problems.push(`${number}: no "- Status:" line in ${file}`);
            continue;
        }
        // The decisions that the status line links to, and the numbers in the table's cell.
        const record = parseStatus(
            line,
            [...line.matchAll(/\[(\d{4})\]\(/g)].map(([, ref]) => ref),
        );
        const cell = parseStatus(row.status, row.status.match(/\b\d{4}\b/g) ?? []);
        if (!states.includes(record.state)) {
            problems.push(`${number}: unknown state "${record.state}" in ${file}`);
        }
        if (record.state !== cell.state) {
            problems.push(
                `${number}: "${record.state}" in ${file}, "${row.status}" in the table (it starts with the state)`,
            );
        }
        if (record.refs !== cell.refs) {
            problems.push(
                `${number}: the status names ${record.refs || 'no decision'} in ${file}, ${cell.refs || 'none'} in the table`,
            );
        }
    }
    for (const [number, { file }] of rows) {
        if (!existsSync(resolve(dir, file))) {
            problems.push(`${number}: the table links to ${file}, which doesn't exist`);
        }
    }
    return problems;
}

if (process.argv.includes('--decisions')) {
    const problems = checkDecisions();
    for (const problem of problems) {
        console.error(problem);
    }
    console.log(
        problems.length > 0
            ? `\nThe table of docs/decisions/README.md and the records disagree: ${problems.length} problems.`
            : 'The table of docs/decisions/README.md agrees with the records.',
    );
    process.exit(problems.length > 0 ? 1 : 0);
}

const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root })
    .toString()
    .trim();
// Like CI: v5.x itself and "Version packages" branches need no changeset.
const needsChangeset = branch !== 'v5.x' && !branch.startsWith('changeset-release/');

const checks = [
    ['Format', 'npm', ['run', 'format:check']],
    ['Decisions', 'node', ['scripts/verify.js', '--decisions']],
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
    ['Icons in bundles', 'npm', ['run', 'test:icons']],
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
