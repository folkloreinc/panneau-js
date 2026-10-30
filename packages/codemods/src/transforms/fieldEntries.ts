// Custom field components of v4 got the field's definition as props. Panneau 5 renders a field
// type with a registry entry, which gets `FieldEntryProps`. The codemods keep the component, and
// add its entry next to it: the entry gives the component the props it read in v4.
import type {
    ASTPath,
    Collection,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    JSCodeshift,
    ObjectPattern,
} from 'jscodeshift';

import { TODO_PREFIX, type TransformApi, addNamedImport } from '../context';

/** A component whose props the codemods read. */
export interface Component {
    name: string;
    /** The statement to insert the entry after. */
    statement: ASTPath;
    /** The props it destructures, or `null` when it doesn't. */
    props: readonly string[] | null;
    /** Whether it takes the rest of its props (`...props`). */
    hasRest: boolean;
    /** The type of its props, when it names one: `ClientFieldProps`. */
    propsType: string | null;
}

type FunctionNode = {
    type: string;
    id?: { name: string } | null;
    params: { type: string; name?: string; typeAnnotation?: unknown }[];
    body: { type: string; body?: unknown[] };
};

function isFunction(node: { type: string } | null | undefined): node is FunctionNode {
    return (
        node?.type === 'FunctionDeclaration' ||
        node?.type === 'FunctionExpression' ||
        node?.type === 'ArrowFunctionExpression'
    );
}

function getTypeName(node: unknown): string | null {
    const annotation = (node as { typeAnnotation?: { typeAnnotation?: unknown } | null })
        .typeAnnotation?.typeAnnotation as
        { type: string; typeName?: { type: string; name?: string } } | undefined;
    return annotation?.type === 'TSTypeReference' && annotation.typeName?.type === 'Identifier'
        ? (annotation.typeName.name ?? null)
        : null;
}

function readPattern(pattern: ObjectPattern): { props: string[]; hasRest: boolean } {
    const props: string[] = [];
    let hasRest = false;
    pattern.properties.forEach((property) => {
        if (property.type === 'RestElement' || property.type === 'RestProperty') {
            hasRest = true;
        } else if (
            (property.type === 'ObjectProperty' || property.type === 'Property') &&
            !property.computed
        ) {
            const { key } = property;
            if (key.type === 'Identifier') {
                props.push(key.name);
            } else if (
                (key.type === 'StringLiteral' || key.type === 'Literal') &&
                typeof key.value === 'string'
            ) {
                props.push(key.value);
            }
        }
    });
    return { props, hasRest };
}

/** The props a function component reads from its first parameter. */
function readProps(fn: FunctionNode): Pick<Component, 'props' | 'hasRest' | 'propsType'> {
    const [param] = fn.params;
    if (param === undefined) {
        return { props: [], hasRest: false, propsType: null };
    }
    const propsType = getTypeName(param);
    if (param.type === 'ObjectPattern') {
        return { ...readPattern(param as unknown as ObjectPattern), propsType };
    }
    if (param.type === 'Identifier' && fn.body.type === 'BlockStatement') {
        // `function Field(props) { const { value, onChange } = props; … }`
        for (const statement of fn.body.body ?? []) {
            const declaration = statement as {
                type: string;
                declarations?: {
                    id: { type: string };
                    init?: { type: string; name?: string } | null;
                }[];
            };
            const declarator = declaration.declarations?.find(
                (candidate) =>
                    candidate.id.type === 'ObjectPattern' &&
                    candidate.init?.type === 'Identifier' &&
                    candidate.init.name === param.name,
            );
            if (declaration.type === 'VariableDeclaration' && declarator !== undefined) {
                return { ...readPattern(declarator.id as unknown as ObjectPattern), propsType };
            }
        }
    }
    return { props: null, hasRest: false, propsType };
}

/** The component that a file exports by default, when the codemods can read it. */
export function findDefaultComponent(j: JSCodeshift, root: Collection): Component | null {
    const exports = root.find(j.ExportDefaultDeclaration);
    if (exports.size() !== 1) {
        return null;
    }
    const exportPath = exports.get() as ASTPath<ExportDefaultDeclaration>;
    const declaration = exportPath.node.declaration as {
        type: string;
        name?: string;
        id?: { name: string } | null;
    };
    if (isFunction(declaration)) {
        if (declaration.id === null || declaration.id === undefined) {
            return null;
        }
        return { name: declaration.id.name, statement: exportPath, ...readProps(declaration) };
    }
    if (declaration.type !== 'Identifier' || declaration.name === undefined) {
        return null;
    }
    const name = declaration.name;
    const fn = root.find(j.FunctionDeclaration, { id: { name } });
    if (fn.size() > 0) {
        return { name, statement: exportPath, ...readProps(fn.get().node as FunctionNode) };
    }
    const variable = root.findVariableDeclarators(name);
    const init = variable.size() > 0 ? (variable.get().node.init as FunctionNode | null) : null;
    if (isFunction(init)) {
        return { name, statement: exportPath, ...readProps(init) };
    }
    return null;
}

/** The name of the entry of a component. */
export function getEntryName(component: string): string {
    return `${component}Entry`;
}

/** Props of `getFieldProps()`, which the entry spreads into a component that forwards its props. */
const FIELD_PROPS = new Set([
    'label',
    'description',
    'errors',
    'required',
    'readOnly',
    'disabled',
    'name',
    'className',
    'onBlur',
    'placeholder',
]);

/** How the entry gives each v4 prop, from `FieldEntryProps`. */
const PROP_SOURCES: Readonly<Record<string, string>> = {
    value: 'props.value',
    onChange: 'props.onChange',
    onBlur: 'props.onBlur',
    errors: 'errors',
    disabled: 'props.disabled',
    readOnly: 'props.readOnly',
    className: 'props.className',
    name: 'props.field.name',
    label: 'label',
    required: 'required',
    description: 'description',
    helpText: 'description',
    help: 'description',
    placeholder: 'props.field.placeholder',
    fieldLocale: 'props.locale',
    locale: 'props.locale',
    locales: 'locales',
};

/** Props the entry passes as they are, without a cast to the component's types. */
const UNCAST = new Set(['onChange', 'onBlur', 'label', 'description', 'helpText', 'help']);

function isIdentifier(name: string): boolean {
    return /^[A-Za-z_$][\w$]*$/.test(name);
}

/** The code of the entry of a component. */
function writeEntry(
    api: TransformApi,
    component: Component,
    todos: (settings: readonly string[]) => readonly string[],
): string {
    const { name, props, hasRest } = component;
    const entry = getEntryName(name);
    const read = (props ?? []).filter((prop) => !['children', 'key', 'ref'].includes(prop));
    const forwarded = hasRest || props === null;
    const cast = (prop: string) =>
        api.typescript && !UNCAST.has(prop)
            ? ` as ${component.propsType ?? `Parameters<typeof ${name}>[0]`}['${prop}']`
            : '';
    const settings: string[] = [];
    const attributes = read
        .filter((prop) => !(forwarded && FIELD_PROPS.has(prop)))
        .map((prop) => {
            const source = PROP_SOURCES[prop];
            if (source !== undefined) {
                return `${prop}={${source}${cast(prop)}}`;
            }
            settings.push(prop);
            const setting = isIdentifier(prop) ? `?.${prop}` : `?.['${prop}']`;
            return `${prop}={props.field.settings${setting}${cast(prop)}}`;
        });
    const usesLocales = read.includes('locales');
    // A component that forwards its props to a field gets those of `getFieldProps()`, and the
    // field renders the label. Others are wrapped in a fieldset, as v4 wrapped them in a group.
    const lines: string[] = [];
    const param = api.typescript ? 'props: FieldEntryProps' : 'props';
    todos(settings).forEach((todo) => lines.push(`// ${TODO_PREFIX} ${todo}`));
    lines.push(
        `/** The registry entry of \`${name}\` for Panneau 5: its props from the field (written by @panneau/codemods). */`,
    );
    lines.push(`export function ${entry}(${param}) {`);
    if (!forwarded) {
        lines.push('    const { label, description, errors, required } = getFieldProps(props);');
    }
    if (usesLocales) {
        lines.push('    const { locales } = useFieldsContext();');
    }
    const element = [
        `<${name}`,
        ...(forwarded ? ['{...props.field.settings}', '{...getFieldProps(props)}'] : []),
        ...attributes,
        '/>',
    ];
    if (forwarded) {
        lines.push('    return (');
        lines.push(`        ${element[0]}`);
        element.slice(1, -1).forEach((attribute) => lines.push(`            ${attribute}`));
        lines.push('        />');
        lines.push('    );');
    } else {
        const fieldsetProps = [
            'legend={label}',
            'description={description}',
            ...(read.includes('errors') ? [] : ['errors={errors}']),
            'isRequired={required}',
            ...(read.includes('className') ? [] : ['className={props.className}']),
        ];
        lines.push('    return (');
        lines.push(`        <Fieldset ${fieldsetProps.join(' ')}>`);
        lines.push(`            ${element[0]}`);
        element.slice(1, -1).forEach((attribute) => lines.push(`                ${attribute}`));
        lines.push('            />');
        lines.push('        </Fieldset>');
        lines.push('    );');
    }
    lines.push('}');
    return lines.join('\n');
}

/** Adds the entry of the default export of a field file, next to it. */
function addEntry(api: TransformApi): void {
    const { j, root } = api;
    const component = findDefaultComponent(j, root);
    if (component === null) {
        api.report(
            root.find(j.ExportDefaultDeclaration).paths()[0] ?? null,
            'field-entry',
            'the default export is registered as a field, but it is not a function component the codemods can read: write its entry (`FieldEntryProps` of `@panneau/fields`)',
            { todo: true },
        );
        return;
    }
    const entry = getEntryName(component.name);
    if (root.find(j.FunctionDeclaration, { id: { name: entry } }).size() > 0) {
        return;
    }
    const statement = component.statement;
    // The messages that need a check go over the entry, where the codemods write them.
    const code = writeEntry(api, component, (settings) => {
        const todos: string[] = [];
        if (component.props === null) {
            todos.push(
                `\`${component.name}\` doesn't destructure its props: \`${entry}\` passes it the settings of the field and \`getFieldProps()\`; check the props it reads`,
            );
        }
        if ((component.props ?? []).includes('locales')) {
            todos.push(
                `\`${component.name}\` renders every locale itself: its PHP field must not be \`localized()\`, which renders a field once per locale`,
            );
        }
        if (settings.length > 0) {
            todos.push(
                `\`${entry}\` reads ${settings.map((prop) => `\`${prop}\``).join(', ')} from the \`settings\` of the field: give ${settings.length > 1 ? 'them' : 'it'} with \`settings()\` of the PHP field`,
            );
        }
        todos.forEach((todo) => api.report(statement, 'field-entry', todo));
        return todos;
    });
    const statements = j(code).find(j.Program).get().node.body as ExportNamedDeclaration[];
    if (
        statement.node.type === 'ExportDefaultDeclaration' &&
        (statement.node as ExportDefaultDeclaration).declaration.type === 'Identifier'
    ) {
        j(statement).insertBefore(statements);
    } else {
        j(statement).insertAfter(statements);
    }
    if (component.hasRest) {
        api.report(
            statement,
            'field-entry',
            `\`${component.name}\` forwards \`...props\`, which was the field's definition in v4: \`${entry}\` passes it the settings of the field and \`getFieldProps()\``,
        );
    }
    if (api.typescript) {
        addNamedImport(api, '@panneau/fields', 'FieldEntryProps', { type: true });
    }
    addNamedImport(api, '@panneau/fields', 'getFieldProps');
    if (!component.hasRest && component.props !== null) {
        addNamedImport(api, '@panneau/ui', 'Fieldset');
    }
    if ((component.props ?? []).includes('locales')) {
        addNamedImport(api, '@panneau/fields', 'useFieldsContext');
    }
}

/**
 * `export { default as Agency } from './Agency'` re-exports the entry of a field file instead, so
 * that the plugin registers entries.
 */
function reExportEntries(api: TransformApi): void {
    const { j, root, project, path } = api;
    root.find(j.ExportNamedDeclaration).forEach((declaration) => {
        const source = declaration.node.source?.value;
        if (typeof source !== 'string') {
            return;
        }
        const file = project.resolve(path, source);
        const entry =
            file !== null && project.isField(file) ? project.info(file)?.fieldEntry : null;
        if (entry === null || entry === undefined) {
            return;
        }
        (declaration.node.specifiers ?? []).forEach((specifier) => {
            const local = (specifier as { local?: { name: string } | null }).local;
            if (specifier.type === 'ExportSpecifier' && local?.name === 'default') {
                specifier.local = j.identifier(entry);
            }
        });
    });
}

export function transformFieldEntries(api: TransformApi): void {
    if (api.project.isField(api.path)) {
        addEntry(api);
    }
    reExportEntries(api);
}
