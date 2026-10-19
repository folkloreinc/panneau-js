import {
    TONE_VARIABLES,
    type ToneInput,
    type ToneValues,
    resolveTone,
    toneClassName,
} from './tones';

/**
 * A theme: design tokens, as CSS variables without the leading `--`, with optional overrides for
 * the dark scheme, its own tones, and named variants of components (decision 0024). It has the
 * same shape as the `Theme` of `@panneau/core` plugins.
 */
export interface Theme {
    label?: string;
    /** Tokens of the light scheme, or of both schemes without `dark`: `{ 'panneau-color-accent': '#05f' }`. */
    tokens: Record<string, string>;
    /** Tokens that change in the dark scheme. */
    dark?: Record<string, string>;
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
}

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
 * The CSS of a theme, scoped to the roots that carry `data-panneau-theme="<scope>"`. Its rules are
 * more specific than the default tokens and the built-in tones, and dark overrides more specific
 * than light ones. Token, tone, component and variant names must be plain identifiers, and values
 * can't contain `{`, `}`, `;` or `<`: other entries are ignored.
 */
export function getThemeCss(theme: Theme, scope: string): string {
    const root = `[data-panneau-theme="${scope}"]`;
    const dark = `${root}[data-color-scheme="dark"]`;
    const auto = `${root}[data-color-scheme="auto"]`;
    const light: string[] = [];
    const darkRules: string[] = [];
    const rule = (selector: string, body: string) => (body !== '' ? `${selector}{${body}}` : '');

    light.push(rule(root, declarations(theme.tokens)));
    if (theme.dark !== undefined) {
        darkRules.push(rule('§', declarations(theme.dark)));
    }
    Object.entries(theme.tones ?? {})
        .filter(([name]) => NAME.test(name))
        .forEach(([name, input]) => {
            const values = resolveTone(input);
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
