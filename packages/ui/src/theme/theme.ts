import type { ThemeFont } from './fonts';
import {
    TONE_VARIABLES,
    type ToneInput,
    type ToneValues,
    resolveTone,
    toneClassName,
} from './tones';

/**
 * A theme: design tokens, as CSS variables without the leading `--`, with optional overrides for
 * the dark scheme, raw palette colors, its own tones, and named variants of components (decision
 * 0024). A theme is plain data: the `Theme` schema of `@panneau/protocol` validates it, and plugins
 * of `@panneau/core` register it. Write one with `defineTheme()` to check token names.
 *
 * It is a type rather than an interface so that it is assignable to the `Theme` of
 * `@panneau/protocol`, which accepts properties of later versions.
 */
export type Theme = {
    /** A name for theme pickers. */
    label?: string;
    /** Tokens of the light scheme, or of both schemes without `dark`: `{ 'panneau-color-accent': '#05f' }`. */
    tokens: Record<string, string>;
    /** Tokens that change in the dark scheme. */
    dark?: Record<string, string>;
    /**
     * Raw colors, written as `--panneau-palette-<name>`: tokens and tones use them with
     * `var(--panneau-palette-<name>)`, so that a theme names its brand colors once.
     */
    palette?: Record<string, string>;
    /**
     * Tones added or redefined by the theme: one color, from which Panneau derives the others,
     * or every value. Declare added tones in `PanneauTones` so that `tone="signal"` type-checks.
     */
    tones?: Record<string, ToneInput>;
    /**
     * Named variants of components: token overrides that `<Badge variant="tag">` applies through
     * its `panneau-badge-variant-tag` class. Declare them in `BadgeVariants` (and the like).
     */
    components?: Record<string, { variants?: Record<string, Record<string, string>> }>;
    /**
     * Font faces and font stylesheets, which `PanneauRoot` adds to the page once. Font tokens
     * (`panneau-font-family-heading`) then use their families.
     */
    fonts?: ThemeFont[];
};

/** `auto` follows the system setting (`prefers-color-scheme`). */
export type ColorScheme = 'light' | 'dark' | 'auto';

function declarations(tokens: Record<string, string>): string {
    return Object.entries(tokens)
        .filter(([name, value]) => /^[a-zA-Z0-9-_]+$/.test(name) && !/[{};<]/.test(value))
        .map(([name, value]) => `--${name}:${value};`)
        .join('');
}

/** A short, stable hash of a string, to scope the CSS of a theme. */
export function hashString(value: string): string {
    let hash = 5381;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 33) ^ value.charCodeAt(index);
    }
    return (hash >>> 0).toString(36);
}

const NAME = /^[a-z0-9-]+$/;

const VARIABLE = /^var\(--([a-zA-Z0-9_-]+)\)$/;

/** The palette of a theme, as variables: `{ 'panneau-palette-orange': '#f25c05' }`. */
export function paletteVariables(
    palette: Readonly<Record<string, string>> = {},
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(palette)
            .filter(([name]) => NAME.test(name))
            .map(([name, value]) => [`panneau-palette-${name}`, value]),
    );
}

/**
 * Follows `var(--name)` references through the given variables (tokens, palette colors), until a
 * value that is not one: `var(--panneau-palette-orange)` becomes `#f25c05`. A reference to a
 * variable that isn't given is returned as is.
 */
export function resolveReference(
    value: string,
    variables: Readonly<Record<string, string>>,
): string {
    let current = value;
    for (let depth = 0; depth < 10; depth += 1) {
        const name = VARIABLE.exec(current.trim())?.[1];
        if (name === undefined || !Object.hasOwn(variables, name)) {
            return current;
        }
        current = variables[name] ?? current;
    }
    return current;
}

function toneDeclarations(values: ToneValues): string {
    return declarations(
        Object.fromEntries(
            (Object.keys(TONE_VARIABLES) as (keyof ToneValues)[]).map((key) => [
                TONE_VARIABLES[key],
                values[key],
            ]),
        ),
    );
}

/**
 * The CSS of a theme, scoped to the roots that carry `data-panneau-theme="<scope>"`: its palette and
 * tokens, its tones and the variants of components. Its rules are more specific than the default
 * tokens and the built-in tones, and dark overrides more specific than light ones. Token, tone,
 * component and variant names must be plain identifiers, and values can't contain `{`, `}`, `;` or
 * `<`: other entries are ignored.
 */
export function getThemeCss(theme: Theme, scope: string): string {
    const root = `[data-panneau-theme="${scope}"]`;
    const dark = `${root}[data-color-scheme="dark"]`;
    const auto = `${root}[data-color-scheme="auto"]`;
    const light: string[] = [];
    const darkRules: string[] = [];
    const rule = (selector: string, body: string) => (body !== '' ? `${selector}{${body}}` : '');

    const palette = paletteVariables(theme.palette);
    light.push(rule(root, declarations({ ...palette, ...theme.tokens })));
    if (theme.dark !== undefined) {
        darkRules.push(rule('§', declarations(theme.dark)));
    }
    Object.entries(theme.tones ?? {})
        .filter(([name]) => NAME.test(name))
        .forEach(([name, input]) => {
            // A tone from a palette color derives from the color itself.
            const values = resolveTone(
                typeof input === 'string' ? resolveReference(input, palette) : input,
            );
            const selector = `.${toneClassName(name)}`;
            light.push(rule(`${root} ${selector}`, toneDeclarations(values.light)));
            darkRules.push(rule(`§ ${selector}`, toneDeclarations(values.dark)));
        });
    Object.entries(theme.components ?? {})
        .filter(([component]) => NAME.test(component))
        .forEach(([component, { variants = {} }]) => {
            Object.entries(variants)
                .filter(([name]) => NAME.test(name))
                .forEach(([name, tokens]) => {
                    light.push(
                        rule(`${root} .panneau-${component}-variant-${name}`, declarations(tokens)),
                    );
                });
        });

    const darkCss = darkRules.filter(Boolean);
    return [
        ...light,
        ...darkCss.map((css) => css.replaceAll('§', dark)),
        darkCss.length > 0
            ? `@media (prefers-color-scheme: dark){${darkCss.map((css) => css.replaceAll('§', auto)).join('')}}`
            : '',
    ].join('');
}
