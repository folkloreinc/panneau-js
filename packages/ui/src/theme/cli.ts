// The `panneau-check-theme` command, for Node only: it is not part of the exports.
/// <reference types="node" />
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { type ThemeReport, checkTheme } from './checkTheme';
import type { Theme } from './theme';

const USAGE = `Usage: panneau-check-theme <file> [--export <name>] [--json]

Checks the contrast of a theme, and the differences between its chart colors with color vision
deficiencies. <file> is a JSON file (the Theme schema of @panneau/protocol), or a module whose
default export, or the export named by --export, is a theme. Exits with 1 when a check fails.`;

function isTheme(value: unknown): value is Theme {
    return (
        typeof value === 'object' &&
        value !== null &&
        'tokens' in value &&
        typeof value.tokens === 'object' &&
        value.tokens !== null
    );
}

/** Loads a module from its URL: `import()`, replaced in tests. */
export type ModuleImporter = (url: string) => Promise<Record<string, unknown>>;

const importModule: ModuleImporter = (url) => import(url) as Promise<Record<string, unknown>>;

/** Reads a theme from a JSON file or from an export of a module. */
export async function loadTheme(
    path: string,
    exportName = 'default',
    load: ModuleImporter = importModule,
): Promise<Theme> {
    const file = resolve(path);
    const value: unknown =
        extname(file) === '.json'
            ? JSON.parse(await readFile(file, 'utf8'))
            : (await load(pathToFileURL(file).href))[exportName];
    if (!isTheme(value)) {
        throw new Error(
            extname(file) === '.json'
                ? `${path} is not a theme: it has no tokens.`
                : `The export "${exportName}" of ${path} is not a theme.`,
        );
    }
    return value;
}

/** A report as text, one line per check that failed or that Panneau couldn't read. */
export function formatThemeReport(report: ThemeReport, label = 'Theme'): string {
    const lines = [
        `${label}: ${report.checks.length} contrast checks, ${report.failures.length} failed, ` +
            `${report.unchecked.length} unchecked, ${report.colorDifferences.length} similar chart colors.`,
    ];
    report.failures.forEach((check) => {
        lines.push(
            `  fail       ${check.scheme.padEnd(5)}  ${check.name}: ${check.foreground} on ` +
                `${check.background}, ${String(check.ratio)}:1 < ${String(check.minimum)}:1`,
        );
    });
    report.colorDifferences.forEach((check) => {
        lines.push(
            `  similar    ${check.scheme.padEnd(5)}  chart colors ${check.first} and ` +
                `${check.second} with ${check.vision}: ${String(check.difference)} < ${String(check.minimum)}`,
        );
    });
    report.unchecked.forEach((check) => {
        lines.push(
            `  unchecked  ${check.scheme.padEnd(5)}  ${check.name}: ${check.foreground} on ` +
                `${check.background} (check it in a browser)`,
        );
    });
    return lines.join('\n');
}

/** Runs `panneau-check-theme` with its arguments, and returns the exit code. */
export async function runCheckTheme(
    args: readonly string[],
    output: { log: (text: string) => void; error: (text: string) => void } = console,
    load: ModuleImporter = importModule,
): Promise<number> {
    const json = args.includes('--json');
    const exportIndex = args.indexOf('--export');
    const exportName = exportIndex >= 0 ? args[exportIndex + 1] : undefined;
    const files = args.filter(
        (arg, index) => !arg.startsWith('--') && (exportIndex < 0 || index !== exportIndex + 1),
    );
    const [file] = files;
    if (file === undefined || files.length > 1 || args.includes('--help')) {
        output.error(USAGE);
        return args.includes('--help') ? 0 : 2;
    }
    let theme: Theme;
    try {
        theme = await loadTheme(file, exportName, load);
    } catch (error) {
        output.error(error instanceof Error ? error.message : String(error));
        return 2;
    }
    const report = checkTheme(theme);
    output.log(json ? JSON.stringify(report, null, 2) : formatThemeReport(report, theme.label));
    return report.failures.length > 0 || report.colorDifferences.length > 0 ? 1 : 0;
}
