// Checks that the published packages work in a webpack app, outside Vite and the workspace.
//
//     npm run build && npm run test:smoke
//
// It packs the `@panneau/*` packages a form and a list need (`npm pack`), installs the tarballs into a copy
// of smoke/webpack (with their peer dependencies, as a project lists them), builds the app with
// `flklr` (`@folklore/cli`, webpack), and renders it in Chromium: the form must render with its
// styles, show a validation error, and submit; the list must render, sort and run an action.
import { execFileSync } from 'node:child_process';
import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const work = resolve(root, '.tmp/smoke-webpack');
const tarballs = resolve(work, 'tarballs');
const app = resolve(work, 'app');

/** The packages the app imports, and the ones they depend on. */
const PACKAGES = ['protocol', 'intl', 'ui', 'fields', 'core', 'forms', 'lists'];
/** Peer dependencies, at the versions the workspace uses. */
const PEERS = ['react', 'react-dom', 'react-aria-components', 'react-intl'];
const FLKLR_VERSION = '0.1.54';

function run(command, args, cwd) {
    console.log(`$ ${command} ${args.join(' ')}`);
    execFileSync(command, args, { cwd, stdio: 'inherit', env: { ...process.env, CI: 'true' } });
}

function installedVersion(name) {
    return JSON.parse(readFileSync(resolve(root, 'node_modules', name, 'package.json'), 'utf8'))
        .version;
}

for (const name of PACKAGES) {
    if (!existsSync(resolve(root, 'packages', name, 'dist'))) {
        console.error(`packages/${name}/dist is missing: run \`npm run build\` first.`);
        process.exit(1);
    }
}

rmSync(work, { recursive: true, force: true });
mkdirSync(tarballs, { recursive: true });
run(
    'npm',
    [
        'pack',
        '--pack-destination',
        tarballs,
        ...PACKAGES.flatMap((name) => ['-w', `@panneau/${name}`]),
    ],
    root,
);

const packed = Object.fromEntries(
    readdirSync(tarballs).map((file) => {
        const name = PACKAGES.find((candidate) => file.startsWith(`panneau-${candidate}-`));
        return [`@panneau/${name}`, `file:${join(tarballs, file)}`];
    }),
);

cpSync(resolve(root, 'smoke/webpack'), app, { recursive: true });
writeFileSync(
    resolve(app, 'package.json'),
    `${JSON.stringify(
        {
            name: 'panneau-smoke-webpack',
            private: true,
            dependencies: {
                ...packed,
                ...Object.fromEntries(PEERS.map((name) => [name, installedVersion(name)])),
            },
            devDependencies: { '@folklore/cli': FLKLR_VERSION },
            // webpack's targets come from it, as in the projects built with flklr.
            browserslist: ['defaults'],
            // The packages depend on each other at their shared version: use the tarballs.
            overrides: packed,
        },
        null,
        4,
    )}\n`,
);

run('npm', ['install', '--no-audit', '--no-fund', '--no-package-lock'], app);
run(
    'npx',
    [
        'flklr',
        'build',
        './src/index.jsx',
        '--html-path',
        'src/index.html',
        '--disable-image-optimization',
        '--without-formatjs',
    ],
    app,
);

const dist = resolve(app, 'dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    const file = join(dist, path === '/' ? 'index.html' : path);
    if (!file.startsWith(dist) || !existsSync(file)) {
        response.writeHead(404).end();
        return;
    }
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, done));
const { port } = server.address();

const browser = await chromium.launch();
const errors = [];
try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') {
            errors.push(message.text());
        }
    });
    await page.goto(`http://localhost:${port}/`);

    const french = page.getByRole('textbox', { name: 'Français' });
    await french.waitFor({ timeout: 10000 });

    // CSS: the tokens of the root, and the styles of a component.
    const styles = await page.evaluate(() => {
        const rootElement = document.getElementById('root-element');
        const button = [...document.querySelectorAll('button')].find(
            (element) => element.textContent === 'Enregistrer',
        );
        return {
            accent: getComputedStyle(rootElement).getPropertyValue('--panneau-color-accent').trim(),
            buttonBackground: button ? getComputedStyle(button).backgroundColor : null,
        };
    });
    if (styles.accent === '' || styles.buttonBackground === 'rgba(0, 0, 0, 0)') {
        throw new Error(`The CSS of the packages is missing: ${JSON.stringify(styles)}`);
    }

    // Validation: the title is required in both locales, and messages are in French.
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await page
        .getByRole('alert')
        .filter({ hasText: '2 erreurs empêchent l’enregistrement' })
        .waitFor({ timeout: 5000 });

    // Submit.
    await french.fill('Bonjour');
    await page.getByRole('textbox', { name: 'Anglais' }).fill('Hello');
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await page.waitForFunction(() => document.body.dataset.submitted !== undefined, null, {
        timeout: 5000,
    });
    const submitted = await page.evaluate(() => JSON.parse(document.body.dataset.submitted));
    if (submitted.title?.fr !== 'Bonjour') {
        throw new Error(`Unexpected submitted values: ${JSON.stringify(submitted)}`);
    }
    // The list: French messages and displays, sorting, and a row action.
    const table = page.getByRole('table', { name: 'Pages' });
    await table.waitFor({ timeout: 5000 });
    const titles = () =>
        table
            .locator('tbody tr')
            .evaluateAll((rows) =>
                rows.map((row) =>
                    row.querySelector('td')?.textContent?.replace('Titre', '').trim(),
                ),
            );
    await page.getByRole('searchbox', { name: 'Rechercher' }).waitFor({ timeout: 5000 });
    await table
        .getByRole('cell', { name: /Publié/ })
        .first()
        .waitFor({ timeout: 5000 });
    await table.getByRole('button', { name: /Titre/ }).click();
    const sorted = await titles();
    if (sorted.join(',') !== 'À propos,Accueil,Contact') {
        throw new Error(`The list is not sorted by title: ${JSON.stringify(sorted)}`);
    }
    // The icon named by the action, loaded on demand by webpack.
    await page
        .getByRole('button', { name: 'Archiver : Contact' })
        .locator('svg.lucide-archive')
        .waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: 'Archiver : Contact' }).click();
    await page.waitForFunction(() => document.body.dataset.action === '2', null, {
        timeout: 5000,
    });
    if (errors.length > 0) {
        throw new Error(`Errors in the page:\n${errors.join('\n')}`);
    }
    console.log('The packed packages work in a webpack app: a form and a list.');
} finally {
    await browser.close();
    server.close();
}
