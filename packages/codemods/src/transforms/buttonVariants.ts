// The aliases of `variant` on the buttons of `@panneau/ui` (`primary`, `secondary`, `ghost`,
// `danger`), deprecated in the first alphas of Panneau 5, become a `tone` and an `appearance`.
import type {
    ASTPath,
    JSCodeshift,
    JSXAttribute,
    JSXOpeningElement,
    JSXSpreadAttribute,
    Property,
} from 'jscodeshift';

import type { TransformApi } from '../context';

/** Any expression, as the builders of jscodeshift take it. */
type Expression = Parameters<JSCodeshift['conditionalExpression']>[0];

type Tone = 'accent' | 'neutral' | 'danger';
type Appearance = 'solid' | 'outline' | 'ghost';

/** What each alias stood for. */
export const BUTTON_VARIANT_ALIASES: Readonly<
    Record<string, { tone: Tone; appearance: Appearance }>
> = {
    primary: { tone: 'accent', appearance: 'solid' },
    secondary: { tone: 'neutral', appearance: 'outline' },
    ghost: { tone: 'neutral', appearance: 'ghost' },
    danger: { tone: 'danger', appearance: 'solid' },
};

/**
 * The buttons that take `variant`, and the appearance each one has without one: `outline` for the
 * neutral tone and `solid` for the others, but always `ghost` for `IconButton`.
 */
const BUTTONS: Readonly<Record<string, (tone: Tone | undefined) => Appearance>> = {
    Button: (tone) => (tone === undefined || tone === 'neutral' ? 'outline' : 'solid'),
    LinkButton: (tone) => (tone === undefined || tone === 'neutral' ? 'outline' : 'solid'),
    IconButton: () => 'ghost',
};

/** An alias, or `undefined` for no variant: the leaves of a `variant` value. */
type Leaf = keyof typeof BUTTON_VARIANT_ALIASES | undefined;

/**
 * A value of `variant` as a tree of conditions over aliases (`ok ? 'primary' : undefined`), or
 * `null` when it holds something else: a variable, a named variant of a theme.
 */
type Value = { leaf: Leaf } | { test: Expression; consequent: Value; alternate: Value };

function readValue(node: unknown): Value | null {
    const value = node as { type: string } & Record<string, unknown>;
    if (value.type === 'StringLiteral' || value.type === 'Literal') {
        const text = value.value;
        return typeof text === 'string' && Object.hasOwn(BUTTON_VARIANT_ALIASES, text)
            ? { leaf: text }
            : null;
    }
    if (value.type === 'Identifier' && value.name === 'undefined') {
        return { leaf: undefined };
    }
    if (value.type === 'JSXExpressionContainer') {
        return readValue(value.expression);
    }
    if (value.type === 'ConditionalExpression') {
        const consequent = readValue(value.consequent);
        const alternate = readValue(value.alternate);
        return consequent !== null && alternate !== null
            ? { test: value.test as Expression, consequent, alternate }
            : null;
    }
    return null;
}

function leaves(value: Value): Leaf[] {
    return 'leaf' in value
        ? [value.leaf]
        : [...leaves(value.consequent), ...leaves(value.alternate)];
}

/** The local names of the buttons a file imports, by the name of each button. */
function getButtons(api: TransformApi): Map<string, string> {
    const { j, root } = api;
    const locals = new Map<string, string>();
    root.find(j.ImportDeclaration).forEach((declaration) => {
        const source = String(declaration.node.source.value);
        // `@panneau/ui`, or a module of `@panneau/ui` itself
        if (source !== '@panneau/ui' && !source.startsWith('.')) {
            return;
        }
        (declaration.node.specifiers ?? []).forEach((specifier) => {
            if (specifier.type !== 'ImportSpecifier') {
                return;
            }
            const imported = String(specifier.imported.name);
            if (Object.hasOwn(BUTTONS, imported)) {
                locals.set(String(specifier.local?.name ?? imported), imported);
            }
        });
    });
    return locals;
}

function findAttribute(
    attributes: (JSXAttribute | JSXSpreadAttribute)[],
    name: string,
): JSXAttribute | undefined {
    return attributes.find(
        (attribute): attribute is JSXAttribute =>
            attribute.type === 'JSXAttribute' && attribute.name.name === name,
    );
}

/**
 * Rewrites `variant="primary"` (and conditions over aliases) of `Button`, `LinkButton` and
 * `IconButton` as the `tone` and `appearance` it stood for, leaving out what the button has
 * without them. A `tone` or an `appearance` given beside it wins. A variant that isn't an alias
 * stays: a named variant of a theme. One the codemod can't read, and aliases in objects of props,
 * are reported. Returns whether it rewrote a button.
 */
export function transformButtonVariants(api: TransformApi): boolean {
    const { j, root, report } = api;
    const buttons = getButtons(api);
    let changed = false;
    root.find(j.JSXOpeningElement).forEach((path: ASTPath<JSXOpeningElement>) => {
        const name = path.node.name.type === 'JSXIdentifier' ? path.node.name.name : null;
        const button = name !== null ? buttons.get(name) : undefined;
        const defaultAppearance = button !== undefined ? BUTTONS[button] : undefined;
        if (defaultAppearance === undefined) {
            return;
        }
        const attributes = path.node.attributes ?? [];
        const variant = findAttribute(attributes, 'variant');
        if (variant === undefined || variant.value === null || variant.value === undefined) {
            return;
        }
        const value = readValue(variant.value);
        if (value === null) {
            const literal = variant.value.type === 'StringLiteral';
            if (!literal) {
                report(
                    path,
                    'button-variant',
                    `\`variant\` of \`${String(name)}\` isn't an alias the codemod can read: give it a \`tone\` and an \`appearance\` instead of \`primary\`, \`secondary\`, \`ghost\` or \`danger\``,
                );
            }
            return;
        }
        const hasTone = findAttribute(attributes, 'tone') !== undefined;
        const hasAppearance = findAttribute(attributes, 'appearance') !== undefined;
        const toneOf = (leaf: Leaf) =>
            leaf === undefined ? undefined : BUTTON_VARIANT_ALIASES[leaf]?.tone;
        const appearanceOf = (leaf: Leaf) =>
            leaf === undefined ? undefined : BUTTON_VARIANT_ALIASES[leaf]?.appearance;
        const all = leaves(value);
        const needsTone =
            !hasTone &&
            all.some((leaf) => toneOf(leaf) !== undefined && toneOf(leaf) !== 'neutral');
        // `IconButton` always gives `Button` its appearance: an alias only gave it a tone. On the
        // others, an alias gave its appearance; it is needed when the tone given beside the
        // variant can't tell the default, or when it isn't the default of the alias's tone.
        const needsAppearance =
            button !== 'IconButton' &&
            !hasAppearance &&
            all.some(
                (leaf) =>
                    leaf !== undefined &&
                    (hasTone || appearanceOf(leaf) !== defaultAppearance(toneOf(leaf))),
            );
        const build = (node: Value, pick: (leaf: Leaf) => string | undefined): Expression =>
            'leaf' in node
                ? pick(node.leaf) === undefined
                    ? j.identifier('undefined')
                    : j.stringLiteral(String(pick(node.leaf)))
                : j.conditionalExpression(
                      node.test,
                      build(node.consequent, pick),
                      build(node.alternate, pick),
                  );
        // A JSX attribute in double quotes, as JSX is written, whatever the quotes of the file
        const jsxString = (text: string) =>
            Object.assign(j.literal(text), {
                extra: { raw: JSON.stringify(text), rawValue: text },
            });
        const attribute = (attributeName: string, pick: (leaf: Leaf) => string | undefined) => {
            const expression = build(value, pick);
            return j.jsxAttribute(
                j.jsxIdentifier(attributeName),
                expression.type === 'StringLiteral'
                    ? jsxString(expression.value)
                    : j.jsxExpressionContainer(expression),
            );
        };
        const replacements = [
            ...(needsTone ? [attribute('tone', toneOf)] : []),
            ...(needsAppearance ? [attribute('appearance', appearanceOf)] : []),
        ];
        const index = attributes.indexOf(variant);
        attributes.splice(index, 1, ...replacements);
        changed = true;
    });
    // Objects of props (`{ variant: 'secondary' }`, the `args` of a story): reported only, since
    // nothing says which button they go to.
    root.find(j.ObjectProperty).forEach((path: ASTPath) => {
        const property = path.node as Property;
        const key = property.key as { type: string; name?: string; value?: unknown };
        const named =
            (key.type === 'Identifier' && key.name === 'variant') ||
            (key.type === 'StringLiteral' && key.value === 'variant');
        const value = property.value as { type: string; value?: unknown };
        if (
            named &&
            value.type === 'StringLiteral' &&
            typeof value.value === 'string' &&
            Object.hasOwn(BUTTON_VARIANT_ALIASES, value.value)
        ) {
            report(
                path,
                'button-variant',
                `\`variant: '${value.value}'\` in an object: if it goes to a button, give it the \`tone\` and \`appearance\` of \`${value.value}\` instead`,
            );
        }
    });
    return changed;
}
