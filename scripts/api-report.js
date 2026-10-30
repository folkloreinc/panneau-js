// Writes or checks the API reports of the package in the current directory, with API Extractor.
//
// Usage, from a package directory (through its `api` script, after `scripts/declarations.js`):
//
//     node ../../scripts/api-report.js           update the reports in api/
//     node ../../scripts/api-report.js --check   fail if a report is out of date
//
// Or, from the root, for every package that has an `api` script, at the same time, with the
// declarations that `npm run build` wrote (CI and `npm run verify`, which build first):
//
//     node scripts/api-report.js --workspaces [--check]
//
// API Extractor reads one entry point at a time, so every subpath of the `exports` map that has
// `types` gets its own report: `.` → api/<name>.api.md, `./mock` → api/<name>-mock.api.md. The
// entry points of a package share one TypeScript program: building one for each entry point made
// the check of @panneau/fields (18 entry points) about ten times slower.
//
// Packages with CSS Modules also get api/<name>.classes.md: the stable class names their
// stylesheets produce (decision 0024), which projects can target, so renaming one shows in review.
import { CompilerState, Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { stableClassName } from '../config/class-names.ts';
import { readWorkspacePackages, runInPackages } from './workspaces.js';

const { values: options } = parseArgs({
    options: {
        check: { type: 'boolean', default: false },
        workspaces: { type: 'boolean', default: false },
    },
});

if (options.workspaces) {
    const packages = readWorkspacePackages().filter((pkg) => pkg.scripts?.api !== undefined);
    const args = [import.meta.filename, ...(options.check ? ['--check'] : [])];
    const succeeded = await runInPackages(packages, process.execPath, args, { ordered: false });
    process.exit(succeeded ? 0 : 1);
}

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

for (const { types } of entryPoints) {
    if (!existsSync(types)) {
        throw new Error(
            `${pkg.name}: ${relative(packageFolder, types)} is missing. Build the declarations first.`,
        );
    }
}
/** One TypeScript program for every entry point of the package. */
let compilerState;
for (const { types, report } of entryPoints) {
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
    compilerState ??= CompilerState.create(config, {
        additionalEntryPoints: entryPoints.map((entry) => entry.types),
    });
    const result = Extractor.invoke(config, {
        compilerState,
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

/** The CSS Modules of the package, relative to `src/`. */
function findCssModules(folder, base = folder) {
    return readdirSync(folder, { withFileTypes: true })
        .flatMap((entry) => {
            const path = resolve(folder, entry.name);
            if (entry.isDirectory()) {
                return findCssModules(path, base);
            }
            return entry.name.endsWith('.module.css') ? [relative(base, path)] : [];
        })
        .sort();
}

/** The local class names of a stylesheet, from its selectors, without those in `:global()`. */
function readLocalClasses(css) {
    const selectors = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/:global\([^)]*\)/g, '')
        .split('}')
        .map((block) => block.split('{').slice(-2, -1)[0] ?? '')
        .filter((prelude) => !prelude.trim().startsWith('@'));
    const names = new Set();
    for (const prelude of selectors) {
        for (const match of prelude.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
            names.add(match[1]);
        }
    }
    return [...names];
}

const sourceFolder = resolve(packageFolder, 'src');
const cssModules = existsSync(sourceFolder) ? findCssModules(sourceFolder) : [];
const classesReport = resolve(reportFolder, `${unscopedName}.classes.md`);
if (cssModules.length > 0) {
    const owners = new Map();
    const sections = cssModules.map((file) => {
        const classes = readLocalClasses(readFileSync(resolve(sourceFolder, file), 'utf8'))
            .map((local) => stableClassName(local, file))
            .sort();
        for (const name of classes) {
            if (owners.has(name) && owners.get(name) !== file) {
                failed = true;
                console.error(
                    `${pkg.name}: .${name} comes from both ${owners.get(name)} and ${file}.`,
                );
            }
            owners.set(name, file);
        }
        return `## ${file.split('\\').join('/')}\n\n${classes.map((name) => `- \`.${name}\``).join('\n')}\n`;
    });
    const content =
        `# ${pkg.name}: CSS classes\n\n` +
        'Stable class names of the stylesheets, generated from the CSS Modules (decision 0024).\n' +
        'Projects can target them. Do not edit this file: run `npm run api`.\n\n' +
        sections.join('\n');
    const current = existsSync(classesReport) ? readFileSync(classesReport, 'utf8') : null;
    if (current !== content) {
        if (options.check) {
            outdated.push(`api/${unscopedName}.classes.md`);
        } else {
            writeFileSync(classesReport, content);
            console.log(`${pkg.name}: updated api/${unscopedName}.classes.md`);
        }
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
