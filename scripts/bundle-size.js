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
// 1370 / 445 KB (#457): the waves of the UX review add behaviour to the first page (list rows,
// filters, details, optimistic updates). The figure is set once for all of them: their pull
// requests don't raise it themselves.
// 1375 / 448 KB: the waves together measure 1372 / 446 KB, over v5.x's 1360 / 442: list filters
// (#455) +5 KB, the user's density (#447) +3, sticky rows (#456) +3, optimistic edits (#453) +1.
// 1395 / 455 KB: the shortcut registry (#482), the panel to create a related item (#484) and the
// list toolbar (#477) each fit alone, not together. Loading more with import() no longer helps:
// a lazy chunk that shares modules with the first page makes the bundler split them into many
// small chunks (+17 KB gzip for a 6 KB panel, measured on #484). Reviewing the chunking is the
// way to get weight back (#457).
// 1405 / 458 KB: editing a related item in the panel (#471) measures 1398 / 455 KB.
// 1445 / 470 KB: reordering the items of fields (#473) measures 1441 / 468 KB. Tiles, on the first
// page, now carry the handle and the menu of moves of ReorderList, and React Aria's drag and drop.
// 1450 / 472 KB: forms on phones (#501) measure 1445 / 470 KB, just over: the aside measures its
// width to put a form's sidebar first, and the item menu of a narrow repeater.
// 1460 / 476 KB: the connections of the account page (#507) measure 1451 / 471 KB with v5.x after
// #509: their messages and the three methods of the REST adapter are on the first page.
// 1465 / 478 KB: the follow-up of #520 (filters as controls, a searchable select that opens on a
// press, `useActionsFit`) measures 1460 / 475 KB, just over.
const BUDGET = { minified: 1465 * 1024, gzip: 478 * 1024 };

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
