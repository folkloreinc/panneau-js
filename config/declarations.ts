import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * The declarations that `tsc` writes import relative modules as the sources do, without
 * extensions (`./schemas`). Packages are `"type": "module"`, so under `NodeNext` TypeScript reads
 * them as Node reads ES modules: a relative specifier needs its file, with its extension (#140).
 */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)(['"])(\.{1,2}(?:\/[^'"]*)?)\2/g;
/** A CSS Module, which projects can't resolve: its type is the one `env.d.ts` gives them. */
const CSS_MODULE = /^import (\w+) from (['"])\.{1,2}\/[^'"]+\.module\.css\2;$/;
const COMMENT = /^\s*(?:\*|\/\*|\/\/)/;

/**
 * The specifier of the declaration file that `specifier` names, from a file in `folder`, with its
 * extension: `./rest` → `./rest.js`, `./schemas` → `./schemas/index.js`. Throws when there is
 * none.
 */
export function resolveSpecifier(
    specifier: string,
    folder: string,
    exists: (path: string) => boolean = existsSync,
): string {
    if (/\.(?:js|mjs|cjs|json)$/.test(specifier)) {
        return specifier;
    }
    const path = resolve(folder, specifier);
    if (exists(`${path}.d.ts`)) {
        return `${specifier}.js`;
    }
    if (exists(join(path, 'index.d.ts'))) {
        return `${specifier.replace(/\/$/, '')}/index.js`;
    }
    throw new Error(`No declaration file for "${specifier}" in ${folder}.`);
}

/**
 * A declaration file of `folder` that works for every module resolution, `NodeNext` included:
 * relative specifiers name their file, and CSS Modules are declared in place. Comments are left
 * as they are.
 */
export function rewriteDeclarations(
    source: string,
    folder: string,
    exists: (path: string) => boolean = existsSync,
): string {
    return source
        .split('\n')
        .map((line) => {
            if (COMMENT.test(line)) {
                return line;
            }
            const cssModule = CSS_MODULE.exec(line);
            if (cssModule !== null) {
                return `declare const ${cssModule[1]}: Readonly<Record<string, string>>;`;
            }
            return line.replace(
                SPECIFIER,
                (match, before: string, quote: string, specifier: string) =>
                    `${before}${quote}${resolveSpecifier(specifier, folder, exists)}${quote}`,
            );
        })
        .join('\n');
}
