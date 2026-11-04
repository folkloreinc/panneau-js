// Generates the flags of regions of `@panneau/fields/region` (decision 0059), from Wikimedia
// Commons:
//
//     node scripts/region-flags.js
//
// Downloads the SVG of each flag, renders it in Chromium at FLAG_HEIGHT pixels high, and writes
// it as a WebP data URL in `packages/fields/src/region/flags/<country>.ts`, one module per
// country, with the source and the license of each flag. Fails on a license that isn't free.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'packages/fields/src/region/flags');

/** Twice the height of a flag in a field or a list (about 1em), for high density screens. */
const FLAG_HEIGHT = 32;
const QUALITY = 0.85;
const USER_AGENT = 'panneau-js-region-flags/1.0 (https://github.com/folkloreinc/panneau-js)';
const FREE_LICENSES = ['Public domain', 'Copyrighted free use', 'CC0'];

/** The file of each flag on Wikimedia Commons, by country and region code. */
const FLAGS = {
    CA: {
        AB: 'Flag of Alberta.svg',
        BC: 'Flag of British Columbia.svg',
        MB: 'Flag of Manitoba.svg',
        NB: 'Flag of New Brunswick.svg',
        NL: 'Flag of Newfoundland and Labrador.svg',
        NS: 'Flag of Nova Scotia.svg',
        NT: 'Flag of the Northwest Territories.svg',
        NU: 'Flag of Nunavut.svg',
        ON: 'Flag of Ontario.svg',
        PE: 'Flag of Prince Edward Island.svg',
        QC: 'Flag of Quebec.svg',
        SK: 'Flag of Saskatchewan.svg',
        YT: 'Flag of Yukon.svg',
    },
    US: {
        AK: 'Flag of Alaska.svg',
        AL: 'Flag of Alabama.svg',
        AR: 'Flag of Arkansas.svg',
        AS: 'Flag of American Samoa.svg',
        AZ: 'Flag of Arizona.svg',
        CA: 'Flag of California.svg',
        CO: 'Flag of Colorado.svg',
        CT: 'Flag of Connecticut.svg',
        DC: 'Flag of Washington, D.C..svg',
        DE: 'Flag of Delaware.svg',
        FL: 'Flag of Florida.svg',
        GA: 'Flag of Georgia (U.S. state).svg',
        GU: 'Flag of Guam.svg',
        HI: 'Flag of Hawaii.svg',
        IA: 'Flag of Iowa.svg',
        ID: 'Flag of Idaho.svg',
        IL: 'Flag of Illinois.svg',
        IN: 'Flag of Indiana.svg',
        KS: 'Flag of Kansas.svg',
        KY: 'Flag of Kentucky.svg',
        LA: 'Flag of Louisiana.svg',
        MA: 'Flag of Massachusetts.svg',
        MD: 'Flag of Maryland.svg',
        ME: 'Flag of Maine.svg',
        MI: 'Flag of Michigan.svg',
        MN: 'Flag of Minnesota.svg',
        MO: 'Flag of Missouri.svg',
        MP: 'Flag of the Northern Mariana Islands.svg',
        MS: 'Flag of Mississippi.svg',
        MT: 'Flag of Montana.svg',
        NC: 'Flag of North Carolina.svg',
        ND: 'Flag of North Dakota.svg',
        NE: 'Flag of Nebraska.svg',
        NH: 'Flag of New Hampshire.svg',
        NJ: 'Flag of New Jersey.svg',
        NM: 'Flag of New Mexico.svg',
        NV: 'Flag of Nevada.svg',
        NY: 'Flag of New York.svg',
        OH: 'Flag of Ohio.svg',
        OK: 'Flag of Oklahoma.svg',
        OR: 'Flag of Oregon.svg',
        PA: 'Flag of Pennsylvania.svg',
        PR: 'Flag of Puerto Rico.svg',
        RI: 'Flag of Rhode Island.svg',
        SC: 'Flag of South Carolina.svg',
        SD: 'Flag of South Dakota.svg',
        TN: 'Flag of Tennessee.svg',
        TX: 'Flag of Texas.svg',
        UM: 'Flag of the United States.svg',
        UT: 'Flag of Utah.svg',
        VA: 'Flag of Virginia.svg',
        VI: 'Flag of the United States Virgin Islands.svg',
        VT: 'Flag of Vermont.svg',
        WA: 'Flag of Washington.svg',
        WI: 'Flag of Wisconsin.svg',
        WV: 'Flag of West Virginia.svg',
        WY: 'Flag of Wyoming.svg',
    },
};

const wait = (seconds) => new Promise((done) => setTimeout(done, seconds * 1000));

/** Fetches a URL of Wikimedia, slowly: it limits the rate of bots, and says when to retry. */
async function get(url, attempt = 1) {
    await wait(1);
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (response.status === 429 && attempt < 5) {
        await wait(Number(response.headers.get('retry-after')) || 10 * attempt);
        return get(url, attempt + 1);
    }
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }
    return response;
}

/** The URL, the page and the license of files of Commons, by the title asked. */
async function describe(files) {
    const infos = new Map();
    for (let start = 0; start < files.length; start += 50) {
        const titles = files.slice(start, start + 50).map((file) => `File:${file}`);
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            formatversion: '2',
            redirects: '1',
            prop: 'imageinfo',
            iiprop: 'url|extmetadata',
            iiextmetadatafilter: 'LicenseShortName',
            titles: titles.join('|'),
        });
        const { query } = await (
            await get(`https://commons.wikimedia.org/w/api.php?${params}`)
        ).json();
        // The title asked, through its normalization and its redirect, to the page's title.
        const final = new Map(titles.map((title) => [title, title]));
        for (const { from, to } of [...(query.normalized ?? []), ...(query.redirects ?? [])]) {
            for (const [asked, current] of final) {
                if (current === from) {
                    final.set(asked, to);
                }
            }
        }
        for (const [asked, title] of final) {
            const page = query.pages.find((item) => item.title === title);
            const info = page?.imageinfo?.[0];
            if (info === undefined) {
                throw new Error(`Not on Commons: ${asked}`);
            }
            infos.set(asked.slice('File:'.length), {
                url: info.url.split('?')[0],
                page: info.descriptionurl,
                license: info.extmetadata?.LicenseShortName?.value ?? 'unknown',
            });
        }
    }
    return infos;
}

const files = Object.values(FLAGS).flatMap((regions) => Object.values(regions));
const infos = await describe(files);
const unfree = [...infos].filter(([, info]) => !FREE_LICENSES.includes(info.license));
if (unfree.length > 0) {
    throw new Error(
        `Licenses to check: ${unfree.map(([file, info]) => `${file} (${info.license})`).join(', ')}`,
    );
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><canvas></canvas>');

/** A WebP data URL of an SVG, FLAG_HEIGHT pixels high. */
async function render(svg) {
    return page.evaluate(
        async ({ svg, height, quality }) => {
            const image = new Image();
            image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
            await image.decode();
            const canvas = document.querySelector('canvas');
            canvas.height = height;
            canvas.width = Math.round((image.naturalWidth / image.naturalHeight) * height);
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/webp', quality);
        },
        { svg, height: FLAG_HEIGHT, quality: QUALITY },
    );
}

/**
 * A WebP data URL without the color profile that Chromium adds to it, about 450 bytes of each flag:
 * without one, browsers take the colors as sRGB, as the profile says.
 */
function withoutProfile(src) {
    const prefix = 'data:image/webp;base64,';
    const webp = Buffer.from(src.slice(prefix.length), 'base64');
    const chunks = [];
    for (let offset = 12; offset < webp.length;) {
        const size = webp.readUInt32LE(offset + 4);
        const end = offset + 8 + size + (size % 2);
        chunks.push(Buffer.from(webp.subarray(offset, end)));
        offset = end;
    }
    const kept = chunks.filter((chunk) => chunk.toString('ascii', 0, 4) !== 'ICCP');
    const extended = kept.find((chunk) => chunk.toString('ascii', 0, 4) === 'VP8X');
    if (extended !== undefined) {
        // The flag of a color profile, in the flags of the extended format.
        extended[8] &= ~0x20;
    }
    const body = Buffer.concat(kept);
    const header = Buffer.alloc(12);
    header.write('RIFF', 0, 'ascii');
    header.writeUInt32LE(body.length + 4, 4);
    header.write('WEBP', 8, 'ascii');
    return prefix + Buffer.concat([header, body]).toString('base64');
}

for (const [country, regions] of Object.entries(FLAGS)) {
    const lines = [];
    let bytes = 0;
    for (const [code, file] of Object.entries(regions)) {
        const info = infos.get(file);
        const svg = await (await get(info.url)).text();
        const src = withoutProfile(await render(svg));
        bytes += src.length;
        lines.push(`    // ${info.page} (${info.license})`, `    ${code}: '${src}',`);
    }
    writeFileSync(
        resolve(output, `${country}.ts`),
        [
            '// Generated by `node scripts/region-flags.js` from Wikimedia Commons: do not edit. Each flag',
            '// is its SVG on Commons, rendered as a WebP image, with the page of its source and its license.',
            '',
            '/** The flags of the regions of the country, as data URLs, by region code. */',
            'const flags: Readonly<Record<string, string>> = {',
            ...lines,
            '};',
            '',
            'export default flags;',
            '',
        ].join('\n'),
    );
    console.log(`${country}: ${Object.keys(regions).length} flags, ${Math.round(bytes / 1024)} KB`);
}

await browser.close();
