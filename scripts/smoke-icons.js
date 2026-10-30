// Checks which Lucide icons a Vite app of the built packages bundles (#141).
//
//     npm run build && npm run test:icons
//
// `lucideIconLoader` of `@panneau/ui/named-icons` makes bundlers emit a chunk per Lucide icon
// (about 1,900). It must only be in the bundle of apps that use it:
//
// - an app that renders `<Panneau>` with its own `iconLoader` has no chunk of a Lucide icon;
// - an app that mounts `createPanneauApp()`, whose default is `lucideIconLoader`, has them all.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
// Inside the repository, so that the app resolves the workspace's packages and their builds.
const work = resolve(root, '.tmp/smoke-icons');

const APPS = {
    'panneau-with-loader': {
        entry: [
            "import { createElement } from 'react';",
            "import { createRoot } from 'react-dom/client';",
            "import { Panneau, readBootConfig } from '@panneau/app';",
            '',
            "createRoot(document.getElementById('panneau')).render(",
            '    createElement(Panneau, {',
            '        config: readBootConfig(document),',
            "        iconLoader: (name) => Promise.resolve(name === 'users' ? () => null : null),",
            '    }),',
            ');',
        ],
        check: (chunks) => chunks < 10,
        expected: 'no chunk of a Lucide icon',
    },
    'create-panneau-app': {
        entry: [
            "import { createPanneauApp } from '@panneau/app';",
            '',
            "createPanneauApp({ element: document.getElementById('panneau') });",
        ],
        check: (chunks) => chunks > 1000,
        expected: 'a chunk per Lucide icon',
    },
};

rmSync(work, { recursive: true, force: true });
const failures = [];
for (const [name, { entry, check, expected }] of Object.entries(APPS)) {
    const app = resolve(work, name);
    mkdirSync(app, { recursive: true });
    writeFileSync(
        resolve(app, 'index.html'),
        '<!doctype html><div id="panneau"></div><script type="module" src="./main.js"></script>\n',
    );
    writeFileSync(resolve(app, 'main.js'), `${entry.join('\n')}\n`);
    const output = await build({ root: app, logLevel: 'error', build: { outDir: 'dist' } });
    const chunks = [output]
        .flat()
        .flatMap((result) => result.output)
        .filter((file) => file.type === 'chunk').length;
    console.log(`${name}: ${chunks} JavaScript chunks, expected ${expected}.`);
    if (!check(chunks)) {
        failures.push(name);
    }
}
if (failures.length > 0) {
    throw new Error(`Unexpected Lucide icons in the bundle of: ${failures.join(', ')}.`);
}
