// Imports of `@panneau/*` that the other transforms left: stylesheets and locales of v4 are
// dropped, since v5 packages import their own CSS and messages; the rest is reported with what
// replaces it, and stays, so that the build fails until it is replaced.
import type { ASTPath, ImportDeclaration } from 'jscodeshift';

import { type TransformApi, removeImport } from '../context';
import { REPLACEMENTS, SHARED_PACKAGES, isV4Package } from '../mappings';

/** Modules of v4 that v5 drops: their CSS and their locales. */
function isDropped(source: string): boolean {
    return (
        /^@panneau\/[a-z-]+\/assets\/.*\.(css|scss)$/.test(source) ||
        /^@panneau\/intl\/locale\//.test(source)
    );
}

/** Subpaths of packages that v5 also has, which only v4 exported. */
const V4_SUBPATHS =
    /^@panneau\/(core\/(contexts|hooks|utils|lib|types)|app\/assets|intl\/locale)(\/|$)/;

/** Names that other transforms rewrite, and report when they can't. */
const HANDLED: Readonly<Record<string, readonly string[]>> = {
    '@panneau/core/contexts': ['useFieldComponent', 'useFormValue'],
};

/** The package of a module: `@panneau/core` for `@panneau/core/contexts`. */
function getPackage(source: string): string {
    return source.split('/').slice(0, 2).join('/');
}

/** The names a module imports from a v4 module, with `default` for its default export. */
function getV4Names(declaration: ImportDeclaration, source: string): string[] | 'all' {
    const names = (declaration.specifiers ?? []).map((specifier) =>
        specifier.type === 'ImportSpecifier'
            ? String(specifier.imported.name)
            : specifier.type === 'ImportDefaultSpecifier'
              ? 'default'
              : '*',
    );
    const pkg = getPackage(source);
    const shared = SHARED_PACKAGES[pkg];
    if (isV4Package(pkg) || V4_SUBPATHS.test(source)) {
        const handled = HANDLED[source] ?? [];
        return names.length > 0 ? names.filter((name) => !handled.includes(name)) : 'all';
    }
    if (shared !== undefined && source === pkg) {
        return names.filter((name) => shared.includes(name));
    }
    return [];
}

function describe(source: string, name: string): string {
    const replacement = REPLACEMENTS[source]?.[name] ?? REPLACEMENTS[getPackage(source)]?.[name];
    const imported =
        name === 'default' ? `the default export of \`${source}\`` : `\`${name}\` of \`${source}\``;
    return replacement !== undefined
        ? `${imported}: ${replacement}`
        : `${imported} has no equivalent in Panneau 5: see the migration guide`;
}

export function transformImports(api: TransformApi): void {
    const { j, root } = api;
    root.find(j.ImportDeclaration).forEach((path: ASTPath<ImportDeclaration>) => {
        const source = String(path.node.source.value);
        if (!source.startsWith('@panneau/')) {
            return;
        }
        if (isDropped(source)) {
            removeImport(api, path);
            return;
        }
        const names = getV4Names(path.node, source);
        if (names === 'all') {
            api.report(
                path,
                'import',
                `\`${source}\` has no equivalent in Panneau 5: see the migration guide`,
                {
                    todo: true,
                },
            );
            return;
        }
        names.forEach((name) => {
            api.report(path, 'import', describe(source, name), { todo: true });
        });
    });
    // `import('@panneau/intl/locale/fr')` loaded the messages of v4.
    root.find(j.CallExpression, { callee: { type: 'Import' } }).forEach((path) => {
        const [argument] = path.node.arguments;
        const value =
            argument?.type === 'StringLiteral' || argument?.type === 'Literal'
                ? String(argument.value)
                : argument?.type === 'TemplateLiteral'
                  ? argument.quasis.map((quasi) => quasi.value.raw).join('*')
                  : '';
        if (value.startsWith('@panneau/')) {
            api.report(
                path,
                'import',
                isDropped(value)
                    ? `\`import('${value}')\`: messages of Panneau 5 come with its packages and with the \`locales\` of plugins; drop it`
                    : `\`import('${value}')\` has no equivalent in Panneau 5: see the migration guide`,
                { todo: true },
            );
        }
    });
}
