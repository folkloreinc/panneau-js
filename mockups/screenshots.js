// Screenshots of the mockups' stories, for review in a pull request.
//
//     npm run build-storybook
//     node mockups/screenshots.js [title prefix]   # defaults to "Mockups/"
//
// Serves `storybook-static/`, opens each story of the mockups in Chromium (desktop, or a phone for
// stories named "Phone…"), and writes `docs/mockups/<title>/<story>.png`. Set
// `CHROMIUM_PATH` to use a Chromium other than Playwright's.
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'storybook-static');
const prefix = process.argv[2] ?? 'Mockups/';

if (!existsSync(join(dist, 'index.json'))) {
    console.error('Build Storybook first: npm run build-storybook');
    process.exit(1);
}

const TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
    const path = join(dist, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    if (!path.startsWith(dist) || !existsSync(path)) {
        response.writeHead(404).end();
        return;
    }
    response.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(response);
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address();

const { entries } = JSON.parse(readFileSync(join(dist, 'index.json'), 'utf8'));
const stories = Object.values(entries).filter(
    (entry) => entry.type === 'story' && entry.title.startsWith(prefix),
);

const slug = (text) =>
    text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
for (const story of stories) {
    const phone = story.name.startsWith('Phone');
    const page = await browser.newPage({
        viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 860 },
        deviceScaleFactor: phone ? 2 : 1,
        reducedMotion: 'reduce',
    });
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story`);
    await page.getByRole('dialog').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    // The end of the dialog's entering animation.
    await page.waitForTimeout(400);
    const folder = join(root, 'docs', 'mockups', slug(story.title.slice(prefix.length)));
    mkdirSync(folder, { recursive: true });
    const file = join(folder, `${slug(story.name)}.png`);
    await page.screenshot({ path: file });
    console.log(file.slice(root.length + 1));
    await page.close();
}
await browser.close();
server.close();
