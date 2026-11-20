// The props of `ListView` and `List` of `@panneau/lists` that are grouped into objects before
// 5.0 (#357): `actions`, `inline` and `layouts`.
import type {
    ASTPath,
    JSCodeshift,
    JSXAttribute,
    JSXOpeningElement,
    JSXSpreadAttribute,
} from 'jscodeshift';

import type { TransformApi } from '../context';

/** The groups, and where each prop of the alphas goes in its group. */
export const LIST_VIEW_GROUPS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    actions: {
        actions: 'available',
        onAction: 'onRun',
        previewAction: 'preview',
        actionIcons: 'icons',
        primaryAction: 'primary',
    },
    inline: {
        inlineEdit: 'fields',
        onInlineEdit: 'onEdit',
        formatError: 'formatError',
    },
    layouts: {
        layouts: 'available',
        layout: 'current',
        onLayoutChange: 'onChange',
        layoutComponents: 'components',
    },
};

/** The components that take the props of `ListView`. */
const COMPONENTS = new Set(['ListView', 'List']);

type Expression = Parameters<JSCodeshift['objectProperty']>[1];

/** The local names of `ListView` and `List` imported from `@panneau/lists`. */
function getComponents(api: TransformApi): Set<string> {
    const { j, root } = api;
    const locals = new Set<string>();
    root.find(j.ImportDeclaration).forEach((declaration) => {
        const source = String(declaration.node.source.value);
        // `@panneau/lists`, or a module of `@panneau/lists` itself
        if (source !== '@panneau/lists' && !source.startsWith('.')) {
            return;
        }
        (declaration.node.specifiers ?? []).forEach((specifier) => {
            if (specifier.type !== 'ImportSpecifier') {
                return;
            }
            const imported = String(specifier.imported.name);
            if (COMPONENTS.has(imported)) {
                locals.add(String(specifier.local?.name ?? imported));
            }
        });
    });
    return locals;
}

/** Whether the value of a prop named like its group is already the object of the group. */
function isGroupObject(attribute: JSXAttribute, keys: readonly string[]): boolean {
    const value = attribute.value;
    if (value?.type !== 'JSXExpressionContainer' || value.expression.type !== 'ObjectExpression') {
        return false;
    }
    return value.expression.properties.every((property) => {
        if (property.type !== 'ObjectProperty' && property.type !== 'Property') {
            return true;
        }
        const key = property.key as { type: string; name?: string; value?: unknown };
        const name = key.type === 'Identifier' ? key.name : key.value;
        return typeof name === 'string' && keys.includes(name);
    });
}

/**
 * Groups the props of `ListView` and `List` (`actions`, `onAction`, `layouts`, `inlineEdit`…) into
 * the objects of 5.0: `actions={{ available, onRun, preview, icons, primary }}`,
 * `inline={{ fields, onEdit, formatError }}` and `layouts={{ available, current, onChange,
 * components }}`, where the first prop of each group was. Props spread on them (`{...list}`) are
 * reported: they may hold props of the alphas. Returns whether it rewrote a component.
 */
export function transformListViewProps(api: TransformApi): boolean {
    const { j, root, report } = api;
    const components = getComponents(api);
    let changed = false;
    root.find(j.JSXOpeningElement).forEach((path: ASTPath<JSXOpeningElement>) => {
        const name = path.node.name.type === 'JSXIdentifier' ? path.node.name.name : null;
        if (name === null || !components.has(name)) {
            return;
        }
        const attributes = path.node.attributes ?? [];
        if (attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute')) {
            report(
                path,
                'list-view-props',
                `\`${name}\` gets spread props: if they hold \`actions\`, \`onAction\`, \`layouts\`, \`layout\`, \`inlineEdit\` or the other props that 5.0 groups, give them as \`actions\`, \`inline\` and \`layouts\` objects`,
            );
        }
        Object.entries(LIST_VIEW_GROUPS).forEach(([group, keys]) => {
            const found = attributes.filter(
                (attribute): attribute is JSXAttribute =>
                    attribute.type === 'JSXAttribute' &&
                    typeof attribute.name.name === 'string' &&
                    Object.hasOwn(keys, attribute.name.name) &&
                    !(
                        attribute.name.name === group &&
                        isGroupObject(attribute, Object.values(keys))
                    ),
            );
            if (found.length === 0) {
                return;
            }
            const properties = found.map((attribute) => {
                const key = keys[String(attribute.name.name)] ?? String(attribute.name.name);
                const value = attribute.value;
                const expression: Expression =
                    value === null || value === undefined
                        ? j.booleanLiteral(true)
                        : value.type === 'JSXExpressionContainer'
                          ? (value.expression as Expression)
                          : (value as Expression);
                const property = j.objectProperty(j.identifier(key), expression);
                // `{ preview }` rather than `{ preview: preview }`
                property.shorthand = expression.type === 'Identifier' && expression.name === key;
                return property;
            });
            const grouped = j.jsxAttribute(
                j.jsxIdentifier(group),
                j.jsxExpressionContainer(j.objectExpression(properties)),
            );
            const first = attributes.indexOf(found[0] as JSXAttribute | JSXSpreadAttribute);
            const rest = attributes.filter(
                (attribute) => !found.includes(attribute as JSXAttribute),
            );
            rest.splice(first, 0, grouped);
            attributes.splice(0, attributes.length, ...rest);
            changed = true;
        });
    });
    return changed;
}
