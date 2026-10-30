// The entry of v4 is a container that renders `<Panneau definition routes user baseUrl uppy
// components>` of `@panneau/app`. In Panneau 5, the page gives the boot config, and the entry
// written by `panneau:install` mounts the app with `createPanneauApp({ element, plugins })`. The
// container becomes a module that exports the project's plugin, and the entry gets the plugin.
import type {
    ASTPath,
    Collection,
    ImportDeclaration,
    JSCodeshift,
    JSXAttribute,
    JSXElement,
    ObjectExpression,
} from 'jscodeshift';
import { dirname, relative } from 'node:path';

import { type FileInfo, TODO_PREFIX, type TransformApi, insertImport } from '../context';
import { NAMESPACES, getNamespaceOfConstant } from '../mappings';
import { kebabCase } from '../names';

/** The local names of the app of v4 in a file: its import, and the variables set to it. */
function getAppNames(j: JSCodeshift, root: Collection): string[] {
    const names = root
        .find(j.ImportDeclaration, { source: { value: '@panneau/app' } })
        .find(j.ImportDefaultSpecifier)
        .nodes()
        .flatMap((specifier) => (specifier.local ? [String(specifier.local.name)] : []));
    if (names.length === 0) {
        return [];
    }
    // `const PanneauApp = Panneau as ComponentType<any>`
    root.find(j.VariableDeclarator).forEach((path) => {
        let init = path.node.init as { type: string; name?: string; expression?: unknown } | null;
        while (init?.type === 'TSAsExpression' || init?.type === 'TypeCastExpression') {
            init = init.expression as typeof init;
        }
        if (
            init?.type === 'Identifier' &&
            names.includes(init.name ?? '') &&
            path.node.id.type === 'Identifier'
        ) {
            names.push(path.node.id.name);
        }
    });
    return names;
}

function findAppElements(j: JSCodeshift, root: Collection): Collection<JSXElement> {
    const names = getAppNames(j, root);
    return root.find(j.JSXElement).filter((path) => {
        const { name } = path.node.openingElement;
        return name.type === 'JSXIdentifier' && names.includes(name.name);
    });
}

function getAttribute(element: JSXElement, name: string): JSXAttribute | null {
    return (
        (element.openingElement.attributes ?? []).find(
            (attribute): attribute is JSXAttribute =>
                attribute.type === 'JSXAttribute' &&
                attribute.name.type === 'JSXIdentifier' &&
                attribute.name.name === name,
        ) ?? null
    );
}

/** The properties of `components={{ [FIELDS_NAMESPACE]: fields }}`, by v4 namespace. */
function readComponents(
    element: JSXElement,
): { namespace: string | null; key: string; value: unknown }[] {
    const attribute = getAttribute(element, 'components');
    const expression =
        attribute?.value?.type === 'JSXExpressionContainer' ? attribute.value.expression : null;
    if (expression?.type !== 'ObjectExpression') {
        return [];
    }
    return (expression as ObjectExpression).properties.flatMap((property) => {
        if (property.type !== 'ObjectProperty' && property.type !== 'Property') {
            return [];
        }
        const { key } = property;
        if (property.computed && key.type === 'Identifier') {
            return [
                {
                    namespace: getNamespaceOfConstant(key.name),
                    key: key.name,
                    value: property.value,
                },
            ];
        }
        const name =
            key.type === 'Identifier'
                ? key.name
                : (key.type === 'StringLiteral' || key.type === 'Literal') &&
                    typeof key.value === 'string'
                  ? key.value
                  : null;
        return name === null ? [] : [{ namespace: name, key: name, value: property.value }];
    });
}

/** The module of a namespace import (`import * as fields from './panneau/fields'`). */
function getNamespaceModule(j: JSCodeshift, root: Collection, name: string): string | null {
    const imports = root
        .find(j.ImportNamespaceSpecifier, { local: { name } })
        .map((path) => path.parent as ASTPath<ImportDeclaration>);
    if (imports.size() === 0) {
        return null;
    }
    const value = (imports.get().node as ImportDeclaration).source.value;
    return typeof value === 'string' ? value : null;
}

/** What `analyze` reads about the entry of a file. */
export function readContainer(
    j: JSCodeshift,
    root: Collection,
): Pick<FileInfo, 'isContainer' | 'namespaces'> {
    const elements = findAppElements(j, root);
    const namespaces = new Map<string, string>();
    if (elements.size() === 0) {
        return { isContainer: false, namespaces };
    }
    readComponents(elements.get().node as JSXElement).forEach(({ namespace, value }) => {
        const node = value as { type: string; name?: string };
        if (namespace !== null && node.type === 'Identifier' && node.name !== undefined) {
            const module = getNamespaceModule(j, root, node.name);
            if (module !== null) {
                namespaces.set(namespace, module);
            }
        }
    });
    return { isContainer: true, namespaces };
}

/** Props of the v4 app that the boot config of the page replaces. */
const BOOT_PROPS = [
    'definition',
    'routes',
    'user',
    'baseUrl',
    'statusCode',
    'locale',
    'locales',
    'memoryRouter',
];

function quote(key: string): string {
    return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`;
}

/** Rewrites a v4 container as a module that exports the project's plugin. */
function writePlugin(api: TransformApi, element: ASTPath<JSXElement>): string {
    const { j, root, project, path } = api;
    const todos: string[] = [];
    const todo = (node: ASTPath | null, rule: string, message: string) => {
        api.report(node, rule, message);
        todos.push(message);
    };
    const kept = new Set<ImportDeclaration>();
    const kinds: string[] = [];

    readComponents(element.node).forEach(({ namespace, key, value }) => {
        const node = value as { type: string; name?: string };
        const definition = namespace !== null ? NAMESPACES[namespace] : undefined;
        if (definition === undefined || definition.kind === null) {
            todo(
                element,
                'entry',
                `the \`${namespace ?? key}\` components have no place in the plugins of Panneau 5: see the migration guide`,
            );
            return;
        }
        const { kind } = definition;
        if (definition.note !== undefined) {
            todo(element, 'entry', `\`${kind}\`: ${definition.note}`);
        }
        const name = node.type === 'Identifier' ? (node.name ?? null) : null;
        const module = name !== null ? getNamespaceModule(j, root, name) : null;
        if (name !== null && module !== null) {
            root.find(j.ImportNamespaceSpecifier, { local: { name } }).forEach((specifier) => {
                kept.add(specifier.parent.node as ImportDeclaration);
            });
        }
        const file = module !== null ? project.resolve(path, module) : null;
        const exports = file !== null ? project.info(file)?.defaultReExports : undefined;
        if (name !== null && exports !== undefined && exports.size > 0) {
            const entries = [...exports.keys()].map(
                (exported) => `        ${quote(kebabCase(exported))}: ${name}.${exported},`,
            );
            kinds.push(`    ${kind}: {\n${entries.join('\n')}\n    },`);
            todo(
                element,
                'entry',
                kind === 'fields'
                    ? 'the keys of `fields` are the types of the definition, in kebab case: check each one against the `type()` of its PHP field (v4 also found `video_or_embed` under `VideoOrEmbed`)'
                    : `the keys of \`${kind}\` are in kebab case: check each one against the name the definition uses`,
            );
            return;
        }
        kinds.push(`    ${kind}: ${j(value as never).toSource()},`);
        todo(
            element,
            'entry',
            `\`${kind}\` must be keyed by the types of the definition (\`page-slug\`), and give registry entries (\`FieldEntryProps\` of \`@panneau/fields\`)`,
        );
    });

    const dropped = (element.node.openingElement.attributes ?? []).flatMap((attribute) =>
        attribute.type === 'JSXAttribute' && attribute.name.type === 'JSXIdentifier'
            ? [attribute.name.name]
            : ['...'],
    );
    if (dropped.includes('uppy')) {
        todo(
            element,
            'entry',
            '`uppy` is dropped: uploads go to the storage of the media libraries, signed by the API (decision 0025); Media and Image fields need `mediaPlugin` of `@panneau/media` in the plugins',
        );
    }
    const others = dropped.filter(
        (prop) => !BOOT_PROPS.includes(prop) && prop !== 'uppy' && prop !== 'components',
    );
    if (others.length > 0) {
        todo(
            element,
            'entry',
            `${others.map((prop) => `\`${prop}\``).join(', ')} of the app ${others.length > 1 ? 'are' : 'is'} dropped: Panneau 5 has no such option`,
        );
    }
    root.find(j.JSXOpeningElement).forEach((opening) => {
        const { name } = opening.node;
        if (name.type === 'JSXIdentifier' && name.name === 'MediasBrowserProvider') {
            todo(
                opening,
                'entry',
                '`MediasBrowserProvider` is dropped: the media field and picker of `@panneau/media` (`mediaPlugin`) browse the libraries through the adapter',
            );
        }
    });
    api.report(
        element,
        'entry',
        `the container is now the plugin of the project: ${BOOT_PROPS.filter((prop) =>
            dropped.includes(prop),
        )
            .map((prop) => `\`${prop}\``)
            .join(
                ', ',
            )} come from the boot config of the page, and the rest of the container is dropped (it stays in git)`,
    );

    // Stylesheets of the project stay: they may style the plugin's components.
    root.find(j.ImportDeclaration).forEach((declaration) => {
        const source = String(declaration.node.source.value);
        if ((declaration.node.specifiers ?? []).length === 0 && !source.startsWith('@panneau/')) {
            if (/\.(css|scss|sass|less)$/.test(source) && source.startsWith('.')) {
                kept.add(declaration.node);
                todo(
                    declaration,
                    'entry',
                    `\`${source}\` was written for v4 and Bootstrap: check what it still styles`,
                );
            }
        }
    });

    const imports = root
        .find(j.ImportDeclaration)
        .filter((declaration) => kept.has(declaration.node))
        .map((declaration) => declaration)
        .nodes()
        .map((declaration) => {
            const copy = { ...declaration, comments: null };
            return j(copy as never).toSource({ quote: 'single' });
        });
    const modules = imports.filter((line) => !/^import '/.test(line));
    const styles = imports.filter((line) => /^import '/.test(line));
    const lines = [
        "import { definePlugin } from '@panneau/core';",
        '',
        ...(modules.length > 0 ? [...modules, ''] : []),
        ...(styles.length > 0 ? [...styles, ''] : []),
        '// The plugin of the project for Panneau 5, made by @panneau/codemods from the container of',
        '// v4. The entry passes it to `createPanneauApp({ element, plugins })`.',
        ...todos.map((message) => `// ${TODO_PREFIX} ${message}`),
        'export default definePlugin({',
        "    id: 'project',",
        ...kinds,
        '});',
        '',
    ];
    return lines.join('\n');
}

/**
 * Rewrites a v4 container as a plugin module. Returns the new source, or `null` when the file
 * isn't a container.
 */
export function transformContainer(api: TransformApi): string | null {
    const { j, root } = api;
    const elements = findAppElements(j, root);
    if (elements.size() === 0) {
        return null;
    }
    if (elements.size() > 1) {
        api.report(
            elements.paths()[1] ?? null,
            'entry',
            'the app of v4 is rendered more than once: only the first one is converted',
            {
                todo: true,
            },
        );
    }
    return writePlugin(api, elements.paths()[0] as ASTPath<JSXElement>);
}

/**
 * Adds the plugins made from containers to the `plugins` of `createPanneauApp()` in the entry of
 * Panneau 5, when it is one of the files.
 */
export function transformAppEntry(api: TransformApi): void {
    const { j, root, project, path } = api;
    const create = root
        .find(j.ImportDeclaration, { source: { value: '@panneau/app' } })
        .find(j.ImportSpecifier, { imported: { name: 'createPanneauApp' } })
        .nodes()[0]?.local?.name;
    if (create === undefined || typeof create !== 'string') {
        return;
    }
    const modules = project.pluginModules();
    if (modules.length === 0) {
        return;
    }
    root.find(j.CallExpression, { callee: { type: 'Identifier', name: create } }).forEach(
        (call) => {
            const [options] = call.node.arguments;
            const plugins =
                options?.type === 'ObjectExpression'
                    ? options.properties.find(
                          (property) =>
                              (property.type === 'ObjectProperty' ||
                                  property.type === 'Property') &&
                              property.key.type === 'Identifier' &&
                              property.key.name === 'plugins',
                      )
                    : undefined;
            const list = (plugins as { value?: { type: string; elements?: unknown[] } } | undefined)
                ?.value;
            if (list?.type !== 'ArrayExpression' || list.elements === undefined) {
                api.report(
                    call,
                    'entry',
                    `add the plugin of the project to the \`plugins\` of \`${create}()\``,
                    { todo: true },
                );
                return;
            }
            modules.forEach((module, index) => {
                let specifier = relative(dirname(path), module)
                    .replace(/\\/g, '/')
                    .replace(/\.(tsx?|jsx?|mjs)$/, '');
                if (!specifier.startsWith('.')) {
                    specifier = `./${specifier}`;
                }
                const existing = root
                    .find(j.ImportDeclaration, { source: { value: specifier } })
                    .find(j.ImportDefaultSpecifier)
                    .nodes()[0]?.local?.name;
                const name =
                    (existing !== undefined ? String(existing) : null) ??
                    (index === 0 ? 'projectPlugin' : `projectPlugin${index + 1}`);
                if (existing === undefined) {
                    insertImport(
                        api,
                        j.importDeclaration(
                            [j.importDefaultSpecifier(j.identifier(name))],
                            j.literal(specifier),
                        ),
                    );
                }
                const elements = list.elements as { type: string; name?: string }[];
                if (
                    !elements.some(
                        (element) => element.type === 'Identifier' && element.name === name,
                    )
                ) {
                    elements.push(j.identifier(name));
                }
            });
        },
    );
}
