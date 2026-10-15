// Writes or checks the API reports of the package in the current directory, with API Extractor.
//
// Usage, from a package directory (through its `api` script, after `tsc -p tsconfig.build.json`):
//
//     node ../../scripts/api-report.js           update the reports in api/
//     node ../../scripts/api-report.js --check   fail if a report is out of date
//
// API Extractor reads one entry point at a time, so every subpath of the `exports` map that has
// `types` gets its own report: `.` → api/<name>.api.md, `./mock` → api/<name>-mock.api.md.
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values: options } = parseArgs({ options: { check: { type: 'boolean', default: false } } });

const configPath = resolve(import.meta.dirname, '../api-extractor.json');
const packageFolder = process.cwd();
const packageJsonPath = resolve(packageFolder, 'package.json');
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const unscopedName = pkg.name.replace(/^@[^/]+\//, '');
const reportFolder = resolve(packageFolder, 'api');

/** Entry points of the `exports` map that have type declarations, with their report name. */
function getEntryPoints() {
    return Object.entries(pkg.exports ?? {}).flatMap(([subpath, target]) => {
        const types = typeof target === 'object' && target !== null ? target.types : undefined;
        if (typeof types !== 'string') {
            return [];
        }
        if (subpath.includes('*')) {
            throw new Error(`${pkg.name}: "${subpath}" is a pattern. List each subpath instead.`);
        }
        const suffix = subpath === '.' ? '' : `-${subpath.slice(2).replaceAll('/', '-')}`;
        return [{ subpath, types: resolve(packageFolder, types), report: unscopedName + suffix }];
    });
}

const entryPoints = getEntryPoints();
const baseConfig = ExtractorConfig.loadFile(configPath);
const outdated = [];
let failed = false;
let versionNoticeShown = false;

if (!options.check) {
    mkdirSync(reportFolder, { recursive: true });
}

for (const { types, report } of entryPoints) {
    if (!existsSync(types)) {
        throw new Error(
            `${pkg.name}: ${relative(packageFolder, types)} is missing. Build the declarations first.`,
        );
    }
    const config = ExtractorConfig.prepare({
        configObject: {
            ...baseConfig,
            projectFolder: packageFolder,
            mainEntryPointFilePath: types,
            apiReport: { ...baseConfig.apiReport, reportFileName: report },
        },
        configObjectFullPath: configPath,
        packageJsonFullPath: packageJsonPath,
    });
    const result = Extractor.invoke(config, {
        localBuild: !options.check,
        messageCallback: (message) => {
            // API Extractor bundles its own TypeScript (see docs/packages.md). Say it once.
            if (message.messageId === 'console-compiler-version-notice') {
                message.handled = versionNoticeShown;
                versionNoticeShown = true;
            }
        },
    });
    if (result.apiReportChanged) {
        outdated.push(`api/${report}.api.md`);
    }
    if (result.errorCount > 0 || (options.check && result.warningCount > 0)) {
        failed = true;
    }
}

// Reports of entry points that no longer exist.
const expected = new Set(entryPoints.map(({ report }) => `${report}.api.md`));
const stale = existsSync(reportFolder)
    ? readdirSync(reportFolder).filter((file) => file.endsWith('.api.md') && !expected.has(file))
    : [];
for (const file of stale) {
    if (options.check) {
        outdated.push(`api/${file}`);
    } else {
        rmSync(resolve(reportFolder, file));
        console.log(`${pkg.name}: removed api/${file}, which matches no entry point.`);
    }
}

if (options.check && outdated.length > 0) {
    console.error(
        `${pkg.name}: the API reports are out of date (${outdated.join(', ')}). ` +
            'Run `npm run api` and commit the changes.',
    );
    process.exitCode = 1;
} else if (failed) {
    console.error(`${pkg.name}: API Extractor reported problems, see above.`);
    process.exitCode = 1;
}
