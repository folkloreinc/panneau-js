import type { ASTPath, Collection, ImportDeclaration, JSCodeshift } from 'jscodeshift';

/** Something a codemod couldn't rewrite, or that needs a check. */
export interface Finding {
    /** Path of the file, relative to where the codemods ran. */
    file: string;
    /** Line in the file before the codemods, when there is one. */
    line: number | null;
    /** What it is about: `import`, `entry`, `field-component`, `bootstrap`… */
    rule: string;
    message: string;
}

/** What the codemods know about a file of the run, before they rewrite it. */
export interface FileInfo {
    /** The file renders the app of v4: the codemods make it a plugin module. */
    isContainer: boolean;
    /** Modules of the `components` of the app, by v4 namespace (`fields`), as written. */
    namespaces: ReadonlyMap<string, string>;
    /** Re-exports of default exports: `export { default as Agency } from './Agency'`. */
    defaultReExports: ReadonlyMap<string, string>;
    /** Whether the file has a default export. */
    hasDefaultExport: boolean;
    /** The name of the field entry the file exports, or will export. */
    fieldEntry: string | null;
}

/** What a transform knows about the other files of the run. */
export interface Project {
    /** The path of a module imported from a file of the run, when it is one too. */
    resolve(from: string, specifier: string): string | null;
    info(path: string): FileInfo | null;
    /** Whether the default export of a file is registered as a field. */
    isField(path: string): boolean;
    /** Plugin modules made from v4 containers, for the entry of v5. */
    pluginModules(): readonly string[];
}

export interface TransformApi {
    j: JSCodeshift;
    root: Collection;
    /** Absolute path of the file. */
    path: string;
    /** Whether the file is TypeScript. */
    typescript: boolean;
    project: Project;
    /**
     * Reports a finding at a node. With `todo`, the statement of the node also gets a
     * `// TODO(panneau-5): …` comment, so it can be found once the files are written.
     */
    report(node: ASTPath | null, rule: string, message: string, options?: { todo?: boolean }): void;
}

export const TODO_PREFIX = 'TODO(panneau-5):';

/** The statement (or declaration) a node belongs to, where comments can go. */
function getStatement(path: ASTPath): ASTPath | null {
    let current: ASTPath | null = path;
    while (current !== null) {
        const parent = current.parent as ASTPath | null;
        const parentType = parent?.node.type;
        if (
            parent === null ||
            parentType === 'Program' ||
            parentType === 'BlockStatement' ||
            parentType === 'ExportNamedDeclaration' ||
            parentType === 'ExportDefaultDeclaration'
        ) {
            return parentType === 'ExportNamedDeclaration' ||
                parentType === 'ExportDefaultDeclaration'
                ? parent
                : current;
        }
        current = parent;
    }
    return null;
}

interface CommentNode {
    type: string;
    value: string;
    leading?: boolean;
}

/** Adds a `// TODO(panneau-5): …` comment over the statement of a node, once. */
export function addTodo(j: JSCodeshift, path: ASTPath, message: string): void {
    const statement = getStatement(path);
    if (statement === null) {
        return;
    }
    const node = statement.node as { comments?: CommentNode[] | null };
    const text = ` ${TODO_PREFIX} ${message}`;
    if ((node.comments ?? []).some((comment) => comment.value === text)) {
        return;
    }
    node.comments = [...(node.comments ?? []), j.commentLine(text, true, false) as CommentNode];
}

/** The line of a node in the source, or of the closest node that has one. */
export function getLine(path: ASTPath | null): number | null {
    let current = path;
    while (current !== null) {
        const loc = (current.node as { loc?: { start: { line: number } } | null }).loc;
        if (loc) {
            return loc.start.line;
        }
        current = current.parent as ASTPath | null;
    }
    return null;
}

/** The import declarations of a module. */
export function findImports(api: TransformApi, source: string): Collection<ImportDeclaration> {
    return api.root.find(api.j.ImportDeclaration, { source: { value: source } });
}

/**
 * Adds `import { name as local } from 'source'` to an import of the module, or in a new one.
 * Types are imported with `type` in the list of names. Returns the local name.
 */
export function addNamedImport(
    api: TransformApi,
    source: string,
    name: string,
    options: { local?: string; type?: boolean } = {},
): string {
    const { j } = api;
    const local = options.local ?? name;
    const existing = findImports(api, source).filter(
        (path) =>
            path.node.importKind !== 'type' &&
            !(path.node.specifiers ?? []).some(
                (specifier) => specifier.type === 'ImportNamespaceSpecifier',
            ),
    );
    const present = existing
        .find(j.ImportSpecifier, { imported: { name } })
        .filter((path) => (path.node.local?.name ?? name) === local);
    if (present.size() > 0) {
        return local;
    }
    const specifier = j.importSpecifier(
        j.identifier(name),
        local !== name ? j.identifier(local) : null,
    );
    if (options.type === true && api.typescript) {
        (specifier as { importKind?: string }).importKind = 'type';
    }
    if (existing.size() > 0) {
        const declaration = existing.get().node as ImportDeclaration;
        declaration.specifiers = [...(declaration.specifiers ?? []), specifier];
        return local;
    }
    insertImport(api, j.importDeclaration([specifier], j.literal(source)));
    return local;
}

/** Inserts an import of a package before the relative imports of the file, or after its imports. */
export function insertImport(api: TransformApi, declaration: ImportDeclaration): void {
    const { j, root } = api;
    const imports = root.find(j.ImportDeclaration);
    const source = String(declaration.source.value);
    const relative = imports.filter((path) => String(path.node.source.value).startsWith('.'));
    if (!source.startsWith('.') && relative.size() > 0) {
        relative.at(0).insertBefore(declaration);
        return;
    }
    if (imports.size() > 0) {
        imports.at(imports.size() - 1).insertAfter(declaration);
        return;
    }
    const program = root.find(j.Program).get();
    program.node.body.unshift(declaration);
}

/** A string for a JSX attribute, in double quotes as JSX has them. */
export function jsxString(j: JSCodeshift, value: string) {
    const literal = j.literal(value);
    (literal as { extra?: unknown }).extra = { raw: JSON.stringify(value), rawValue: value };
    return literal;
}

/** Removes a specifier from an import, and the import when it has none left. */
export function removeSpecifier(api: TransformApi, path: ASTPath): void {
    const declaration = path.parent as ASTPath<ImportDeclaration>;
    const node = declaration.node;
    node.specifiers = (node.specifiers ?? []).filter((specifier) => specifier !== path.node);
    if (node.specifiers.length === 0) {
        removeImport(api, declaration);
    }
}

/** Removes an import, keeping the comments above it on the next statement. */
export function removeImport(api: TransformApi, path: ASTPath<ImportDeclaration>): void {
    const comments = (path.node as { comments?: CommentNode[] | null }).comments ?? [];
    const leading = comments.filter((comment) => comment.leading !== false);
    const body = (path.parent as ASTPath).node as { body?: unknown[] };
    const index = body.body?.indexOf(path.node) ?? -1;
    const next =
        index >= 0 ? (body.body?.[index + 1] as { comments?: CommentNode[] | null }) : undefined;
    if (leading.length > 0 && next !== undefined) {
        next.comments = [...leading, ...(next.comments ?? [])];
    }
    api.j(path).remove();
}

/** Whether a name is still used in the file, outside of imports. */
export function isUsed(api: TransformApi, name: string): boolean {
    const { j, root } = api;
    return (
        root
            .find(j.Identifier, { name })
            .filter((path) => {
                const parent = path.parent.node as { type: string };
                return (
                    parent.type !== 'ImportSpecifier' &&
                    parent.type !== 'ImportDefaultSpecifier' &&
                    parent.type !== 'ImportNamespaceSpecifier'
                );
            })
            .size() > 0 || root.find(j.JSXIdentifier, { name }).size() > 0
    );
}

/** Removes the imports of names that are no longer used. */
export function removeUnusedImports(api: TransformApi, names: readonly string[]): void {
    const { j, root } = api;
    names.forEach((name) => {
        if (isUsed(api, name)) {
            return;
        }
        root.find(j.ImportSpecifier, { local: { name } }).forEach((path) =>
            removeSpecifier(api, path),
        );
        root.find(j.ImportDefaultSpecifier, { local: { name } }).forEach((path) =>
            removeSpecifier(api, path),
        );
    });
}
