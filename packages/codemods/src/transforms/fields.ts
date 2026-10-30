// Fields that custom components render: `useFieldComponent('text')` and `@panneau/field-*`
// become the v5 components, with their props; `FormGroup` becomes the field's label or a
// `Fieldset`; `useFormValue()` reads the form of `@panneau/forms`.
import type {
    ASTPath,
    CallExpression,
    JSXAttribute,
    JSXElement,
    JSXExpressionContainer,
    JSXSpreadAttribute,
    VariableDeclarator,
} from 'jscodeshift';

import {
    type TransformApi,
    addNamedImport,
    findImports,
    jsxString,
    removeSpecifier,
    removeUnusedImports,
} from '../context';
import {
    FIELDS_WITHOUT_TARGET,
    FIELD_PROPS,
    FIELD_RENAMES,
    type FieldTarget,
    getFieldTarget,
} from '../mappings';
import { kebabCase } from '../names';

const CONTEXTS = '@panneau/core/contexts';

type Attribute = JSXAttribute | JSXSpreadAttribute;

/** The local name of an export of a module, when the file imports it. */
function getImportedName(api: TransformApi, source: string, name: string): string | null {
    const { j } = api;
    const specifiers = findImports(api, source).find(j.ImportSpecifier, { imported: { name } });
    return specifiers.size() > 0 ? (specifiers.get().node.local?.name ?? name) : null;
}

function getAttributeName(attribute: Attribute): string | null {
    if (attribute.type !== 'JSXAttribute') {
        return null;
    }
    return attribute.name.type === 'JSXIdentifier' ? attribute.name.name : null;
}

function getElementName(element: JSXElement): string | null {
    const { name } = element.openingElement;
    return name.type === 'JSXIdentifier' ? name.name : null;
}

/** `useFieldComponent('text')` calls, as v5 components bound to the same names. */
function collectHookBindings(api: TransformApi, bindings: Map<string, FieldTarget>): void {
    const { j, root } = api;
    const hook = getImportedName(api, CONTEXTS, 'useFieldComponent');
    if (hook === null) {
        return;
    }
    root.find(j.CallExpression, { callee: { type: 'Identifier', name: hook } }).forEach((path) => {
        const [argument] = path.node.arguments;
        const declarator = path.parent.node as VariableDeclarator;
        const id =
            argument !== undefined &&
            (argument.type === 'StringLiteral' || argument.type === 'Literal') &&
            typeof argument.value === 'string'
                ? argument.value
                : null;
        if (id === null) {
            api.report(
                path,
                'field-component',
                '`useFieldComponent()` with an id that is not a string: import the v5 component of the field',
                { todo: true },
            );
            return;
        }
        const target = getFieldTarget(id);
        if (
            target === null ||
            declarator.type !== 'VariableDeclarator' ||
            declarator.id.type !== 'Identifier'
        ) {
            const replacement = FIELDS_WITHOUT_TARGET[kebabCase(id)];
            api.report(
                path,
                'field-component',
                replacement !== undefined
                    ? `\`useFieldComponent('${id}')\`: ${replacement}`
                    : target === null
                      ? `\`useFieldComponent('${id}')\` renders a field of the project: import its component`
                      : `\`useFieldComponent('${id}')\`: import \`${target.name}\` of \`${target.source}\``,
                { todo: true },
            );
            return;
        }
        bindings.set(declarator.id.name, target);
        const declaration = path.parent.parent as ASTPath;
        const declarations = (declaration.node as { declarations: unknown[] }).declarations;
        if (declarations.length === 1) {
            j(declaration).remove();
        } else {
            j(path.parent as ASTPath).remove();
        }
    });
    if (root.find(j.CallExpression, { callee: { type: 'Identifier', name: hook } }).size() === 0) {
        removeUnusedImports(api, [hook]);
    }
}

/** Default and named imports of `@panneau/field-*` packages, as v5 components. */
function collectImportBindings(api: TransformApi, bindings: Map<string, FieldTarget>): void {
    const { j, root } = api;
    root.find(j.ImportDeclaration).forEach((path) => {
        const source = String(path.node.source.value);
        const match = /^@panneau\/field-([a-z0-9-]+)$/.exec(source);
        const target = match?.[1] !== undefined ? getFieldTarget(match[1]) : null;
        if (target === null) {
            return;
        }
        j(path)
            .find(j.Specifier)
            .forEach((specifier) => {
                const local = (specifier.node as { local?: { name?: string } | null }).local?.name;
                if (local === undefined || specifier.node.type === 'ImportNamespaceSpecifier') {
                    return;
                }
                bindings.set(local, target);
                removeSpecifier(api, specifier as ASTPath);
            });
    });
}

/** The value of a `label` that is a message descriptor of `defineMessages()`. */
function isMessageDescriptor(api: TransformApi, attribute: Attribute): boolean {
    if (attribute.type !== 'JSXAttribute' || attribute.value?.type !== 'JSXExpressionContainer') {
        return false;
    }
    const expression = attribute.value.expression;
    if (expression.type !== 'MemberExpression' || expression.object.type !== 'Identifier') {
        return false;
    }
    return (
        api.root
            .findVariableDeclarators(expression.object.name)
            .filter((path) => {
                const init = path.node.init;
                return (
                    init?.type === 'CallExpression' &&
                    init.callee.type === 'Identifier' &&
                    init.callee.name === 'defineMessages'
                );
            })
            .size() > 0
    );
}

/** `fieldComponent={TextField}` of a v4 localized field, as the render function of v5. */
function convertFieldComponent(
    api: TransformApi,
    path: ASTPath<JSXElement>,
    bindings: ReadonlyMap<string, FieldTarget>,
): void {
    const { j } = api;
    const element = path.node;
    const name = getElementName(element) ?? '';
    const attributes = element.openingElement.attributes ?? [];
    const attribute = attributes.find(
        (candidate) => getAttributeName(candidate) === 'fieldComponent',
    );
    if (attribute === undefined || attribute.type !== 'JSXAttribute') {
        const hasChildren = (element.children ?? []).some(
            (child) => !(child.type === 'JSXText' && child.value.trim() === ''),
        );
        if (!hasChildren) {
            // v4 rendered the `component` of the field's definition, often given by `{...props}`;
            // the `LocalizedField` of v5 calls its children function for each locale.
            api.report(
                path,
                'field-component',
                `\`<${name}>\` has no \`fieldComponent\`: v4 rendered the \`component\` of the field${attributes.some((candidate) => candidate.type === 'JSXSpreadAttribute') ? ' (given by the spread props)' : ''}, \`LocalizedField\` of Panneau 5 renders the input of each locale with its children function: give it one`,
                { todo: true },
            );
        }
        return;
    }
    const value = attribute.value as JSXExpressionContainer | null;
    if (value?.type !== 'JSXExpressionContainer' || value.expression.type !== 'Identifier') {
        api.report(
            path,
            'field-component',
            '`fieldComponent` of a localized field: render the input of each locale with the children function of `LocalizedField`',
            { todo: true },
        );
        return;
    }
    const component = value.expression.name;
    const target = bindings.get(component);
    const input = j.identifier('input');
    const member = (prop: string) => j.memberExpression(input, j.identifier(prop));
    const prop = (prop: string, from = prop) => {
        const expression =
            prop === 'value' && api.typescript && target?.valueType !== undefined
                ? j.tsAsExpression(
                      member(from),
                      j.tsUnionType([
                          target.valueType === 'string'
                              ? j.tsStringKeyword()
                              : target.valueType === 'number'
                                ? j.tsNumberKeyword()
                                : j.tsBooleanKeyword(),
                          j.tsNullKeyword(),
                      ]),
                  )
                : member(from);
        return j.jsxAttribute(j.jsxIdentifier(prop), j.jsxExpressionContainer(expression));
    };
    const field = j.jsxElement(
        j.jsxOpeningElement(
            j.jsxIdentifier(component),
            [
                ...['label', 'value', 'onChange', 'onBlur', 'disabled', 'readOnly', 'required'].map(
                    (name) => prop(name),
                ),
                // A component of the project read the locale of its value as `fieldLocale`.
                ...(target === undefined ? [prop('fieldLocale', 'locale')] : []),
            ],
            true,
        ),
    );
    element.openingElement.attributes = attributes.filter((candidate) => candidate !== attribute);
    element.openingElement.selfClosing = false;
    element.closingElement = j.jsxClosingElement(j.jsxIdentifier(name));
    element.children = [j.jsxExpressionContainer(j.arrowFunctionExpression([input], field))];
}

/** Renames, adds and reports the props of the elements of v5 components. */
function convertElements(api: TransformApi, bindings: Map<string, FieldTarget>): void {
    const { j, root } = api;
    const noted = new Set<string>();
    root.find(j.JSXElement).forEach((path) => {
        const name = getElementName(path.node);
        const target = name !== null ? bindings.get(name) : undefined;
        if (name === null || target === undefined) {
            return;
        }
        if (target.name === 'LocalizedField') {
            convertFieldComponent(api, path, bindings);
        }
        const opening = path.node.openingElement;
        const renames = { ...FIELD_RENAMES, ...target.renames };
        const known = new Set([...FIELD_PROPS, ...target.props]);
        const unknown: string[] = [];
        (opening.attributes ?? []).forEach((attribute) => {
            const attributeName = getAttributeName(attribute);
            if (attributeName === null || attribute.type !== 'JSXAttribute') {
                return;
            }
            const renamed = renames[attributeName];
            if (renamed !== undefined) {
                attribute.name = j.jsxIdentifier(renamed);
            } else if (!known.has(attributeName)) {
                unknown.push(attributeName);
            }
            if (attributeName === 'label' && isMessageDescriptor(api, attribute)) {
                api.report(
                    path,
                    'field-component',
                    `\`<${name} label>\` is a message descriptor: labels of Panneau 5 are nodes, format it (\`intl.formatMessage()\`)`,
                    { todo: true },
                );
            }
        });
        Object.entries(target.adds ?? {}).forEach(([prop, value]) => {
            if (
                (opening.attributes ?? []).some((attribute) => getAttributeName(attribute) === prop)
            ) {
                return;
            }
            const attributeValue =
                value === true
                    ? null
                    : typeof value === 'string'
                      ? jsxString(j, value)
                      : j.jsxExpressionContainer(
                            j.arrayExpression(value.map((item) => j.stringLiteral(item))),
                        );
            opening.attributes = [
                ...(opening.attributes ?? []),
                j.jsxAttribute(j.jsxIdentifier(prop), attributeValue),
            ];
        });
        if (
            target.name === 'LocalizedField' &&
            !(opening.attributes ?? []).some((a) => getAttributeName(a) === 'locales')
        ) {
            api.report(
                path,
                'field-component',
                '`<LocalizedField>` needs `locales`: `useFieldsContext().locales` of `@panneau/fields` gives those of the form',
                { todo: true },
            );
        }
        if (unknown.length > 0) {
            api.report(
                path,
                'field-component',
                `\`<${name}>\`: ${unknown.map((prop) => `\`${prop}\``).join(', ')} ${unknown.length > 1 ? 'are not props' : 'is not a prop'} of \`${target.name}\` of \`${target.source}\``,
                { todo: true },
            );
        }
        if (target.note !== undefined && !noted.has(name)) {
            noted.add(name);
            api.report(
                path,
                'field-component',
                `\`<${name}>\` is \`${target.name}\` of \`${target.source}\`: ${target.note}`,
                {
                    todo: true,
                },
            );
        }
    });
}

/**
 * `<FormGroup label>` around one v5 field becomes the field's `label`: v5 fields render their own
 * label, help and errors. Around anything else, it becomes a `Fieldset` of `@panneau/ui`.
 */
function convertFormGroups(api: TransformApi, bindings: Map<string, FieldTarget>): void {
    const { j, root } = api;
    findImports(api, '@panneau/element-form-group')
        .find(j.ImportDefaultSpecifier)
        .forEach((specifier) => {
            const local = specifier.node.local?.name;
            if (typeof local !== 'string') {
                return;
            }
            const formGroup = local;
            let fieldset: string | null = null;
            root.find(j.JSXElement, { openingElement: { name: { name: formGroup } } }).forEach(
                (path) => {
                    const attributes = path.node.openingElement.attributes ?? [];
                    const children = (path.node.children ?? []).filter(
                        (child) => !(child.type === 'JSXText' && child.value.trim() === ''),
                    );
                    const [child] = children;
                    const childName = child?.type === 'JSXElement' ? getElementName(child) : null;
                    const others = attributes.filter((attribute) => {
                        const name = getAttributeName(attribute);
                        return (
                            name === null ||
                            !['label', 'helpText', 'className', 'key'].includes(name)
                        );
                    });
                    if (others.length > 0) {
                        api.report(
                            path,
                            'form-group',
                            `\`<${formGroup}>\`: ${others.map((attribute) => `\`${getAttributeName(attribute) ?? '...'}\``).join(', ')} ${others.length > 1 ? 'have' : 'has'} no equivalent in Panneau 5`,
                            { todo: true },
                        );
                    }
                    const kept = attributes.filter((attribute) => !others.includes(attribute));
                    if (
                        children.length === 1 &&
                        child?.type === 'JSXElement' &&
                        childName !== null &&
                        bindings.has(childName)
                    ) {
                        const childAttributes = child.openingElement.attributes ?? [];
                        const has = (name: string) =>
                            childAttributes.some(
                                (attribute) => getAttributeName(attribute) === name,
                            );
                        const moved = kept.flatMap((attribute) => {
                            const name = getAttributeName(attribute);
                            const target = name === 'helpText' ? 'description' : name;
                            if (
                                attribute.type !== 'JSXAttribute' ||
                                target === null ||
                                has(target)
                            ) {
                                if (name === 'className' && attribute.type === 'JSXAttribute') {
                                    api.report(
                                        path,
                                        'form-group',
                                        `\`<${formGroup} className>\` is dropped: \`<${childName}>\` has its own \`className\``,
                                        { todo: true },
                                    );
                                }
                                return [];
                            }
                            return [j.jsxAttribute(j.jsxIdentifier(target), attribute.value)];
                        });
                        child.openingElement.attributes = [...moved, ...childAttributes];
                        j(path).replaceWith(child);
                        return;
                    }
                    fieldset ??= addNamedImport(api, '@panneau/ui', 'Fieldset');
                    path.node.openingElement.name = j.jsxIdentifier(fieldset);
                    if (path.node.closingElement) {
                        path.node.closingElement.name = j.jsxIdentifier(fieldset);
                    }
                    path.node.openingElement.attributes = attributes.map((attribute) => {
                        const name = getAttributeName(attribute);
                        if (
                            attribute.type === 'JSXAttribute' &&
                            (name === 'label' || name === 'helpText')
                        ) {
                            attribute.name = j.jsxIdentifier(
                                name === 'label' ? 'legend' : 'description',
                            );
                        }
                        return attribute;
                    });
                },
            );
            removeUnusedImports(api, [formGroup]);
        });
}

/** `useFormValue()` reads the values of the form of `@panneau/forms`. */
function convertFormValue(api: TransformApi): void {
    const { j, root } = api;
    const hook = getImportedName(api, CONTEXTS, 'useFormValue');
    if (hook === null) {
        return;
    }
    root.find(j.CallExpression, { callee: { type: 'Identifier', name: hook } }).forEach(
        (path: ASTPath<CallExpression>) => {
            if (path.node.arguments.length > 0) {
                api.report(
                    path,
                    'form-value',
                    '`useFormValue(path)`: `useFormContext().getValue(path)` of `@panneau/forms` reads a value of the form',
                    { todo: true },
                );
                return;
            }
            const useFormState = addNamedImport(api, '@panneau/forms', 'useFormState');
            const useFormContext = addNamedImport(api, '@panneau/forms', 'useFormContext');
            j(path).replaceWith(
                j.memberExpression(
                    j.callExpression(j.identifier(useFormState), [
                        j.callExpression(j.identifier(useFormContext), []),
                    ]),
                    j.identifier('values'),
                ),
            );
        },
    );
    removeUnusedImports(api, [hook]);
}

export function transformFields(api: TransformApi): void {
    const bindings = new Map<string, FieldTarget>();
    collectHookBindings(api, bindings);
    collectImportBindings(api, bindings);
    bindings.forEach((target, local) => {
        addNamedImport(api, target.source, target.name, { local });
    });
    convertElements(api, bindings);
    convertFormGroups(api, bindings);
    convertFormValue(api);
}
