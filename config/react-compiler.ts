import { parseSync } from '@babel/core';
import babel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import type { LoggerEvent } from 'babel-plugin-react-compiler';
import { readFileSync } from 'node:fs';
import { extname, relative } from 'node:path';
import type { PluginOption } from 'vite';

/** The directives with which a function, or a whole file, opts out of the compiler. */
const OPT_OUTS = new Set(['use no memo', 'use no forget']);

/** The node types of functions, which the compiler reports with their location. */
const FUNCTIONS = new Set([
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
    'ObjectMethod',
    'ClassMethod',
    'ClassPrivateMethod',
]);

export interface Skipped {
    filename: string | null;
    /** Offsets of the function in its file. */
    start: number;
    /** `file:line` of the function. */
    at: string;
    /** `file:line: reason`, where the compiler stopped. */
    message: string;
}

/** A function the compiler skipped, with every reason it gave. */
export interface SkippedFunction {
    filename: string | null;
    start: number;
    at: string;
    reasons: string[];
}

interface Node {
    type: string;
    start?: number | null;
    body?: unknown;
    directives?: { value: { value: string } }[];
}

const isNode = (value: unknown): value is Node =>
    typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';

const optsOutBy = (directives: Node['directives']) =>
    (directives ?? []).some((directive) => OPT_OUTS.has(directive.value.value));

/** The function that starts at an offset of a tree, depth first. */
function findFunction(node: unknown, start: number): Node | null {
    if (Array.isArray(node)) {
        for (const child of node) {
            const found = findFunction(child, start);
            if (found !== null) {
                return found;
            }
        }
        return null;
    }
    if (!isNode(node)) {
        return null;
    }
    if (FUNCTIONS.has(node.type) && node.start === start) {
        return node;
    }
    for (const [key, value] of Object.entries(node)) {
        if (key !== 'loc' && typeof value === 'object' && value !== null) {
            const found = findFunction(value, start);
            if (found !== null) {
                return found;
            }
        }
    }
    return null;
}

/**
 * The offsets of the functions of a source that opt out of the compiler, as a check: `true` for
 * every function when the file starts with the directive. Only a leading directive counts, of the
 * file or of the function's body: the same words in a comment or a string don't.
 */
export function readOptOuts(source: string, filename: string): (start: number) => boolean {
    const extension = extname(filename);
    const plugins: ('typescript' | 'jsx')[] =
        extension === '.ts' || extension === '.mts' || extension === '.cts'
            ? ['typescript']
            : extension === '.tsx'
              ? ['typescript', 'jsx']
              : ['jsx'];
    const file = parseSync(source, {
        filename,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins },
    });
    if (file === null) {
        return () => false;
    }
    if (optsOutBy(file.program.directives)) {
        return () => true;
    }
    return (start) => {
        const fn = findFunction(file.program.body, start);
        return fn !== null && isNode(fn.body) && optsOutBy(fn.body.directives);
    };
}

/**
 * The functions of the compiler's errors, once each (one error is logged per reason), without those
 * that opt out.
 */
export function skippedFunctions(
    entries: readonly Skipped[],
    optsOut: (entry: Skipped) => boolean,
): SkippedFunction[] {
    const functions = new Map<string, SkippedFunction>();
    for (const entry of entries) {
        const key = `${entry.filename ?? ''}:${String(entry.start)}`;
        const known = functions.get(key);
        if (known !== undefined) {
            if (!known.reasons.includes(entry.message)) {
                known.reasons.push(entry.message);
            }
        } else if (!optsOut(entry)) {
            functions.set(key, {
                filename: entry.filename,
                start: entry.start,
                at: entry.at,
                reasons: [entry.message],
            });
        }
    }
    return [...functions.values()];
}

/** The error of the build, with each function and the reasons under it. */
export function describeSkipped(functions: readonly SkippedFunction[]): string {
    return `The React Compiler skipped ${String(functions.length)} function(s), which would ship without memoization:\n${functions
        .map(
            ({ at, reasons }) =>
                `  the function at ${at}\n${reasons.map((reason) => `    ${reason}`).join('\n')}`,
        )
        .join('\n')}`;
}

/**
 * The React Compiler, and a check that it compiled every component and hook. When the compiler
 * can't compile a function, it leaves it as written, without any memoization, and says nothing:
 * the build fails instead, with the reason the compiler gives. A component opts out with a
 * `'use no memo'` directive at the start of its body (or of its file), and a comment that says why.
 */
export function reactCompiler(root: string): PluginOption[] {
    let skipped: Skipped[] = [];
    const logger = {
        logEvent(filename: string | null, event: LoggerEvent) {
            // Errors without a function come from validations that don't stop the compilation.
            if (
                (event.kind !== 'CompileError' && event.kind !== 'PipelineError') ||
                event.fnLoc === null
            ) {
                return;
            }
            const file = filename !== null ? relative(root, filename) : 'unknown file';
            let message: string;
            if (event.kind === 'PipelineError') {
                message = `${file}:${event.fnLoc.start.line}: ${event.data.split('\n')[0]}`;
            } else {
                // The code the compiler stopped at, rather than the start of the function.
                const loc = event.detail.primaryLocation();
                const line = typeof loc === 'object' && loc !== null ? loc.start.line : null;
                message = `${file}:${line ?? event.fnLoc.start.line}: ${event.detail.reason}`;
            }
            skipped.push({
                filename,
                start: event.fnLoc.start.index,
                at: `${file}:${event.fnLoc.start.line}`,
                message,
            });
        },
    };

    return [
        babel({ presets: [reactCompilerPreset({ logger })] }),
        {
            name: 'panneau:react-compiler-check',
            apply: 'build',
            buildStart() {
                skipped = [];
            },
            buildEnd(error) {
                if (error !== undefined) {
                    return;
                }
                // The opt-outs of each file, read once.
                const files = new Map<string, (start: number) => boolean>();
                const optsOut = ({ filename, start }: Skipped) => {
                    if (filename === null) {
                        return false;
                    }
                    let read = files.get(filename);
                    if (read === undefined) {
                        read = readOptOuts(readFileSync(filename, 'utf8'), filename);
                        files.set(filename, read);
                    }
                    return read(start);
                };
                const failures = skippedFunctions(skipped, optsOut);
                if (failures.length > 0) {
                    this.error(describeSkipped(failures));
                }
            },
        },
    ];
}
