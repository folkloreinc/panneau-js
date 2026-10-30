import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

import type { Finding } from './context';
import { EXTENSIONS, transformSources } from './transform';

/** Folders the codemods never read. */
const IGNORED = new Set(['node_modules', 'vendor', 'dist', 'build', 'public', '.git']);

async function collectFiles(path: string, files: string[]): Promise<void> {
    const stats = await stat(path);
    if (stats.isFile()) {
        files.push(path);
        return;
    }
    const entries = await readdir(path, { withFileTypes: true });
    await Promise.all(
        entries.map(async (entry) => {
            const child = join(path, entry.name);
            if (entry.isDirectory()) {
                if (!IGNORED.has(entry.name) && !entry.name.startsWith('.')) {
                    await collectFiles(child, files);
                }
            } else if (EXTENSIONS.includes(extname(entry.name)) && !entry.name.endsWith('.d.ts')) {
                files.push(child);
            }
        }),
    );
}

export interface RunOptions {
    /** Files and folders to rewrite. Folders are read recursively, without `node_modules`. */
    paths: readonly string[];
    /** Reports what would change, and writes nothing. */
    dry?: boolean;
    /** The folder that paths and findings are relative to. Defaults to the current one. */
    cwd?: string;
}

export interface RunResult {
    /** Files read, relative to `cwd`. */
    files: string[];
    /** Files rewritten (or that would be, with `dry`), relative to `cwd`. */
    changed: string[];
    findings: Finding[];
}

/** Runs the codemods from Panneau 4 to Panneau 5 on files and folders. */
export async function runCodemods({
    paths,
    dry = false,
    cwd = process.cwd(),
}: RunOptions): Promise<RunResult> {
    const files: string[] = [];
    for (const path of paths) {
        await collectFiles(resolve(cwd, path), files);
    }
    const unique = [...new Set(files)].sort();
    const sources = new Map<string, string>();
    for (const file of unique) {
        sources.set(file, await readFile(file, 'utf8'));
    }
    const { outputs, findings } = transformSources(sources, cwd);
    if (!dry) {
        for (const [file, output] of outputs) {
            await writeFile(file, output);
        }
    }
    return {
        files: unique.map((file) => relative(cwd, file)),
        changed: [...outputs.keys()].map((file) => relative(cwd, file)),
        findings,
    };
}

/** A run as text: the findings by file, then a summary. */
export function formatReport(result: RunResult, { dry = false }: { dry?: boolean } = {}): string {
    const lines: string[] = [];
    const byFile = new Map<string, Finding[]>();
    result.findings.forEach((finding) => {
        byFile.set(finding.file, [...(byFile.get(finding.file) ?? []), finding]);
    });
    [...byFile.keys()].sort().forEach((file) => {
        lines.push(file);
        (byFile.get(file) ?? [])
            .sort((a, b) => (a.line ?? 0) - (b.line ?? 0))
            .forEach((finding) => {
                const line = finding.line !== null ? String(finding.line) : '-';
                lines.push(`  ${line.padStart(4)}  ${finding.rule.padEnd(15)}  ${finding.message}`);
            });
        lines.push('');
    });
    const changed = result.changed.length;
    lines.push(
        `${result.files.length} files read, ${changed} ${dry ? 'would change' : 'changed'}, ${result.findings.length} findings.`,
    );
    if (!dry && changed > 0) {
        lines.push(
            'Format the changed files with Prettier: the codemods print what they add their own way. Each finding to fix by hand also has a `// TODO(panneau-5): …` comment in its file. Run the codemods again with --dry to list what is left.',
        );
    }
    return lines.join('\n');
}
