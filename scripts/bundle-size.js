// Checks the size of the JavaScript that a minimal app loads up front (#346).
//
//     npm run build && npm run test:bundle-size
//     npm run test:bundle-size -- --report   # also list the biggest packages in that JavaScript
//
// The app is `createPanneauApp({ element })` without plugins, built by Vite for production with the
// setup of the README of `@panneau/app` (React Aria's strings in English and French only). Its
// initial JavaScript is the entry chunk and every chunk it imports statically: what the browser
// loads before the first page renders. Chunks loaded with `import()` (pages, heavy fields,
// locales, icons) are not counted. The check fails when that JavaScript goes over the budget,
// minified or gzipped, so that a regression shows in CI.
import optimizeLocales from '@react-aria/optimize-locales-plugin';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
// Inside the repository, so that the app resolves the workspace's packages and their builds.
const work = resolve(root, '.tmp/bundle-size');

// Raise a budget only with a reason in the pull request.
const BUDGET = { minified: 1900 * 1024, gzip: 570 * 1024 };

const report = process.argv.includes('--report');

const kilobytes = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
writeFileSync(
    resolve(work, 'index.html'),
    '<!doctype html><div id="panneau"></div><script type="module" src="./main.js"></script>\n',
);
writeFileSync(
    resolve(work, 'main.js'),
    [
        "import { createPanneauApp } from '@panneau/app';",
        '',
        "createPanneauApp({ element: document.getElementById('panneau') });",
        '',
    ].join('\n'),
);

const output = await build({
    root: work,
    logLevel: 'error',
    plugins: [optimizeLocales.vite({ locales: ['en-US', 'fr-FR'] })],
    build: { outDir: 'dist' },
});
const files = [output].flat().flatMap((result) => result.output);
const chunks = new Map(
    files.filter((file) => file.type === 'chunk').map((chunk) => [chunk.fileName, chunk]),
);

// The entry chunk and the chunks it imports statically, transitively.
const initial = new Set();
const visit = (fileName) => {
    if (initial.has(fileName)) {
        return;
    }
    initial.add(fileName);
    chunks.get(fileName)?.imports.forEach(visit);
};
[...chunks.values()].filter((chunk) => chunk.isEntry).forEach((chunk) => visit(chunk.fileName));

let minified = 0;
let gzip = 0;
for (const fileName of initial) {
    const { code } = chunks.get(fileName);
    minified += Buffer.byteLength(code);
    gzip += gzipSync(code).length;
}
const css = files
    .filter((file) => file.type === 'asset' && file.fileName.endsWith('.css'))
    .reduce((sum, file) => sum + Buffer.byteLength(file.source), 0);

console.log(
    `Initial JavaScript of a minimal app: ${kilobytes(minified)} minified, ${kilobytes(gzip)} gzip, ` +
        `in ${initial.size} chunk(s) of ${chunks.size}. CSS: ${kilobytes(css)}.`,
);
console.log(`Budget: ${kilobytes(BUDGET.minified)} minified, ${kilobytes(BUDGET.gzip)} gzip.`);

if (report) {
    // Rendered sizes, before minification: they rank the packages, they do not add up to the total.
    const byPackage = new Map();
    for (const fileName of initial) {
        for (const [id, { renderedLength }] of Object.entries(chunks.get(fileName).modules)) {
            const workspace = id.match(/\/packages\/([^/]+)\/dist\//);
            const key = workspace
                ? `@panneau/${workspace[1]}`
                : (id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//)?.[1] ?? id);
            byPackage.set(key, (byPackage.get(key) ?? 0) + renderedLength);
        }
    }
    console.log('\nBiggest packages in the initial JavaScript (rendered, before minification):');
    [...byPackage]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30)
        .forEach(([name, size]) => console.log(`${kilobytes(size).padStart(8)}  ${name}`));
}

if (minified > BUDGET.minified || gzip > BUDGET.gzip) {
    throw new Error(
        'The initial JavaScript of a minimal app is over budget. Load what the first page does ' +
            'not need with import(), or raise the budget in scripts/bundle-size.js with a reason.',
    );
}
