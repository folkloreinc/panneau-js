import jscodeshift, { type ASTPath, type Collection, type JSCodeshift } from 'jscodeshift';
import { basename, dirname, extname, join, normalize, relative } from 'node:path';

import {
    type FileInfo,
    type Finding,
    type Project,
    TODO_PREFIX,
    type TransformApi,
    addTodo,
    getLine,
} from './context';
import { reportBootstrap } from './transforms/bootstrap';
import { readContainer, transformAppEntry, transformContainer } from './transforms/entry';
import {
    findDefaultComponent,
    getEntryName,
    transformFieldEntries,
} from './transforms/fieldEntries';
import { transformFields } from './transforms/fields';
import { transformImports } from './transforms/imports';

/** Extensions of the files the codemods read. */
export const EXTENSIONS: readonly string[] = ['.js', '.jsx', '.mjs', '.ts', '.tsx'];

function getParser(path: string): JSCodeshift {
    return jscodeshift.withParser(extname(path) === '.ts' ? 'ts' : 'tsx');
}

function isTypeScript(path: string): boolean {
    return extname(path) === '.ts' || extname(path) === '.tsx';
}

/** Reads what the codemods need to know about a file before rewriting the others. */
export function analyze(path: string, source: string): FileInfo {
    const j = getParser(path);
    const root = j(source);
    const defaultReExports = new Map<string, string>();
    root.find(j.ExportNamedDeclaration).forEach((declaration) => {
        const module = declaration.node.source?.value;
        if (typeof module !== 'string') {
            return;
        }
        (declaration.node.specifiers ?? []).forEach((specifier) => {
            const local = (specifier as { local?: { name: string } | null }).local?.name;
            if (specifier.type === 'ExportSpecifier' && local !== undefined) {
                // A file already rewritten re-exports the entry (`AgencyEntry as Agency`).
                if (local === 'default' || local.endsWith('Entry')) {
                    defaultReExports.set(String(specifier.exported.name), module);
                }
            }
        });
    });
    const component = findDefaultComponent(j, root);
    return {
        ...readContainer(j, root),
        defaultReExports,
        hasDefaultExport: root.find(j.ExportDefaultDeclaration).size() > 0,
        fieldEntry: component !== null ? getEntryName(component.name) : null,
    };
}

/** Resolves a relative module against the files of the run, as bundlers do. */
function resolveModule(
    files: ReadonlyMap<string, FileInfo>,
    from: string,
    specifier: string,
): string | null {
    if (!specifier.startsWith('.')) {
        return null;
    }
    const base = normalize(join(dirname(from), specifier));
    const candidates = [
        base,
        ...EXTENSIONS.map((extension) => `${base}${extension}`),
        ...EXTENSIONS.map((extension) => join(base, `index${extension}`)),
    ];
    return candidates.find((candidate) => files.has(candidate)) ?? null;
}

/** What the transforms know about the files of a run. */
export function createProject(files: ReadonlyMap<string, FileInfo>): Project {
    const resolve = (from: string, specifier: string) => resolveModule(files, from, specifier);
    const fieldFiles = new Set<string>();
    let hasFieldsModule = false;
    files.forEach((info, path) => {
        const module = info.namespaces.get('fields');
        const index = module !== undefined ? resolve(path, module) : null;
        if (index === null) {
            return;
        }
        hasFieldsModule = true;
        files.get(index)?.defaultReExports.forEach((specifier) => {
            const file = resolve(index, specifier);
            if (file !== null) {
                fieldFiles.add(file);
            }
        });
    });
    return {
        resolve,
        info: (path) => files.get(path) ?? null,
        // Without the container of the app in the run, components in a `fields` folder are fields.
        isField: (path) =>
            hasFieldsModule
                ? fieldFiles.has(path)
                : basename(dirname(path)) === 'fields' &&
                  files.get(path)?.hasDefaultExport === true,
        pluginModules: () =>
            [...files.entries()].filter(([, info]) => info.isContainer).map(([path]) => path),
    };
}

export interface TransformResult {
    /** The new source, or `null` when the file doesn't change. */
    output: string | null;
    findings: Finding[];
}

/**
 * Entries are inserted right after their component: they get a blank line before them, and
 * before the comments over them.
 */
function spaceEntries(source: string): string {
    const lines = source.split('\n');
    for (let index = lines.length - 1; index > 0; index -= 1) {
        if ((lines[index] ?? '').startsWith('/** The registry entry of ')) {
            let top = index;
            while (top > 0 && (lines[top - 1] ?? '').startsWith(`// ${TODO_PREFIX}`)) {
                top -= 1;
            }
            if (top > 0 && (lines[top - 1] ?? '').trim() !== '') {
                lines.splice(top, 0, '');
            }
        }
    }
    return lines.join('\n');
}

/** `// TODO(panneau-5): …` comments of a source, with their lines. */
function readTodos(source: string): { line: number; message: string }[] {
    return source.split('\n').flatMap((text, index) => {
        const position = text.indexOf(TODO_PREFIX);
        return position === -1
            ? []
            : [{ line: index + 1, message: text.slice(position + TODO_PREFIX.length).trim() }];
    });
}

/**
 * Rewrites one file of a run. `file` is the path shown in findings. Parse errors are findings,
 * and leave the file as it is.
 */
export function transformFile(
    path: string,
    source: string,
    project: Project,
    file = path,
): TransformResult {
    const findings: Finding[] = [];
    const j = getParser(path);
    let root: Collection;
    try {
        root = j(source);
    } catch (error) {
        return {
            output: null,
            findings: [
                {
                    file,
                    line: null,
                    rule: 'parse',
                    message: `can't be parsed: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
    const api: TransformApi = {
        j,
        root,
        path,
        typescript: isTypeScript(path),
        project,
        report(node: ASTPath | null, rule: string, message: string, options = {}) {
            findings.push({ file, line: getLine(node), rule, message });
            if (options.todo === true && node !== null) {
                addTodo(j, node, message);
            }
        },
    };
    const plugin = transformContainer(api);
    let output: string;
    if (plugin !== null) {
        output = plugin;
    } else {
        transformAppEntry(api);
        transformFields(api);
        transformFieldEntries(api);
        transformImports(api);
        output = spaceEntries(root.toSource({ quote: 'single' }));
    }
    reportBootstrap(api);
    // Comments left by an earlier run, or written into a plugin module, are findings too.
    const reported = new Set(findings.map((finding) => finding.message));
    readTodos(output).forEach(({ line, message }) => {
        if (!reported.has(message)) {
            findings.push({ file, line, rule: 'todo', message });
        }
    });
    // Recast reprints some untouched expressions once the tree is traversed (a multi-line
    // condition in parentheses). Such a file has no change of its own: it stays as it is.
    const changed = output.replace(/\s+/g, '') !== source.replace(/\s+/g, '');
    return { output: changed ? output : null, findings };
}

export interface SourcesResult {
    /** New sources of the files that change, by path. */
    outputs: Map<string, string>;
    findings: Finding[];
}

/**
 * Rewrites a set of files, given by path. Paths of findings are relative to `cwd`. The files are
 * read together, so that the entry knows the field components and the plugin module.
 */
export function transformSources(sources: ReadonlyMap<string, string>, cwd = '/'): SourcesResult {
    const infos = new Map<string, FileInfo>();
    const findings: Finding[] = [];
    sources.forEach((source, path) => {
        try {
            infos.set(path, analyze(path, source));
        } catch {
            // `transformFile` reports the parse error.
        }
    });
    const project = createProject(infos);
    const outputs = new Map<string, string>();
    sources.forEach((source, path) => {
        const result = transformFile(path, source, project, relative(cwd, path) || path);
        if (result.output !== null) {
            outputs.set(path, result.output);
        }
        findings.push(...result.findings);
    });
    return { outputs, findings };
}
