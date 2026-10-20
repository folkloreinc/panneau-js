import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { cssModuleComponent, stableClassName } from './class-names';

const root = resolve(import.meta.dirname, '..');

function files(directory: string, extension: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return entry.name === 'node_modules' ? [] : files(path, extension);
        }
        return entry.name.endsWith(extension) ? [path] : [];
    });
}

/** The text of the `cx(…)` call around a position, or null when it isn't in one. */
function enclosingCx(source: string, index: number): string | null {
    let depth = 0;
    for (let start = index; start >= 0; start -= 1) {
        const character = source[start];
        if (character === ')') {
            depth += 1;
        } else if (character === '(') {
            if (depth === 0) {
                if (!source.slice(Math.max(0, start - 2), start).endsWith('cx')) {
                    return null;
                }
                let end = start;
                let level = 0;
                for (; end < source.length; end += 1) {
                    if (source[end] === '(') level += 1;
                    if (source[end] === ')') level -= 1;
                    if (level === 0) break;
                }
                return source.slice(start, end + 1);
            }
            depth -= 1;
        }
    }
    return null;
}

const packages = readdirSync(join(root, 'packages')).map((name) =>
    join(root, 'packages', name, 'src'),
);
const sources = packages.flatMap((directory) => {
    try {
        return files(directory, '.tsx').filter((file) => !/\.(test|stories)\.tsx$/.test(file));
    } catch {
        return [];
    }
});

/**
 * Elements that take the class named after a component on purpose although they aren't its root:
 * the toast region takes the root's class to get its tokens and base styles.
 */
const ALLOWED = new Set(['packages/ui/src/root/PanneauRoot.tsx: styles.root']);

describe('the class named after a component', () => {
    it('is on the same element as the literal root class of the component', () => {
        // `.textArea` in TextArea.module.css becomes `panneau-text-area`, the literal root class of
        // the component: set on an inner element, the rules of the inner element style the root
        // too (#72). Components without a literal root class (parts like the list box, or forms
        // and lists, whose root is the class itself) are not concerned.
        const problems = sources.flatMap((file) => {
            const source = readFileSync(file, 'utf8');
            return [...source.matchAll(/^import (\w+) from '(\.[^']+\.module\.css)';$/gm)].flatMap(
                ([, identifier = '', path = '']) => {
                    const cssFile = resolve(dirname(file), path);
                    const component = cssModuleComponent(cssFile);
                    const locals = [
                        ...readFileSync(cssFile, 'utf8').matchAll(/\.([a-zA-Z][\w-]*)/g),
                    ]
                        .map((match) => match[1] ?? '')
                        .filter(
                            (local) => stableClassName(local, cssFile) === `panneau-${component}`,
                        );
                    // The literal root class, written as is or passed to ChoiceChrome as `component`.
                    const hasLiteralRoot =
                        source.includes(`'panneau-${component}'`) ||
                        source.includes(`component="${component}"`);
                    if (!hasLiteralRoot) {
                        return [];
                    }
                    return [...new Set(locals)].flatMap((local) => {
                        const usage = new RegExp(
                            `\\b${identifier}(?:\\.${local}\\b|\\['${local}'\\])`,
                            'g',
                        );
                        return [...source.matchAll(usage)].flatMap((match) => {
                            const call = enclosingCx(source, match.index ?? 0);
                            const key = `${relative(root, file)}: ${identifier}.${local}`;
                            return call?.includes(`'panneau-${component}'`) || ALLOWED.has(key)
                                ? []
                                : [
                                      `${relative(root, file)}: ${identifier}.${local} (panneau-${component}, from ${basename(cssFile)}) is not on the root`,
                                  ];
                        });
                    });
                },
            );
        });
        expect(problems).toEqual([]);
    });
});
