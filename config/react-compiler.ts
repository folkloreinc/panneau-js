import babel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import type { LoggerEvent } from 'babel-plugin-react-compiler';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import type { PluginOption } from 'vite';

/** The directives with which a function opts out of the compiler. */
const OPT_OUT = /['"]use no (?:memo|forget)['"]/;

interface Skipped {
    filename: string | null;
    /** Offsets of the function in its file. */
    start: number;
    end: number;
    message: string;
}

/**
 * The React Compiler, and a check that it compiled every component and hook. When the compiler
 * can't compile a function, it leaves it as written, without any memoization, and says nothing:
 * the build fails instead, with the reason the compiler gives. A component opts out with a
 * `'use no memo'` directive, and a comment that says why.
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
            const { start, end } = event.fnLoc;
            skipped.push({ filename, start: start.index, end: end.index, message });
        },
    };

    /** Whether the function opts out: the compiler still logs why it couldn't compile it. */
    const optsOut = ({ filename, start, end }: Skipped) =>
        filename !== null && OPT_OUT.test(readFileSync(filename, 'utf8').slice(start, end));

    return [
        babel({ presets: [reactCompilerPreset({ logger })] }),
        {
            name: 'panneau:react-compiler-check',
            apply: 'build',
            buildStart() {
                skipped = [];
            },
            buildEnd(error) {
                const failures = skipped.filter((entry) => !optsOut(entry));
                if (error === undefined && failures.length > 0) {
                    this.error(
                        `The React Compiler skipped ${failures.length} function(s), which would ship without memoization:\n${failures.map(({ message }) => `  ${message}`).join('\n')}`,
                    );
                }
            },
        },
    ];
}
