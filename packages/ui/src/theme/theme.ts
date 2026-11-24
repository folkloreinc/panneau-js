import { type Rgb, ensureContrast, parseColor, parseColorOver, toHex } from './color';
import type { ThemeFont } from './fonts';
import {
    MIN_CONTRAST_RATIO,
    TONE_VARIABLES,
    type ToneInput,
    type ToneSurfaces,
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
     * Tokens of each density, such as `panneau-control-height`: tokens set here change with the
     * density of the root, while the same tokens in `tokens` would apply to every density.
     */
    densities?: Partial<Record<Exclude<Density, 'auto'>, Record<string, string>>>;
    /**
     * Font faces and font stylesheets, which `PanneauRoot` adds to the page once. Font tokens
     * (`panneau-font-family-heading`) then use their families.
     */
    fonts?: ThemeFont[];
};

/** `auto` follows the system setting (`prefers-color-scheme`). */
export type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * How much room controls and rows take: `compact`, `comfortable`, or `touch`, with larger targets.
 * `auto` is `touch` on coarse pointers (touch screens) and `comfortable` otherwise.
 */
export type Density = 'compact' | 'comfortable' | 'touch' | 'auto';

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
 * The surfaces of a theme in each scheme, when it sets ones Panneau can read: tones derived from
 * one color are made readable on them.
 */
export function themeSurfaces(theme: Theme): ToneSurfaces {
    const palette = paletteVariables(theme.palette);
    const surface = (tokens: Record<string, string>) => {
        const variables = { ...palette, ...tokens };
        const value = variables['panneau-color-surface'];
        return value !== undefined ? parseColor(resolveReference(value, variables)) : null;
    };
    const light = surface(theme.tokens);
    const dark =
        theme.dark?.['panneau-color-surface'] !== undefined
            ? surface({ ...theme.tokens, ...theme.dark })
            : null;
    return {
        ...(light !== null && { light }),
        ...(dark !== null && { dark }),
    };
}

/** The token of the accent as text, which `getThemeCss()` derives when a theme sets the accent. */
const ACCENT_STRONG = 'panneau-color-accent-strong';

/**
 * What the accent as text sits on, with the values of the default theme: the page, panels, and the
 * subtle background of the accent tone (its subtle buttons, the tinted icons of rows).
 */
const ACCENT_STRONG_BACKGROUNDS: Record<'light' | 'dark', Record<string, string>> = {
    light: {
        'panneau-color-surface': '#ffffff',
        'panneau-color-bg': '#ffffff',
        'panneau-color-accent-subtle': '#f4f4f5',
    },
    dark: {
        'panneau-color-surface': '#18181b',
        'panneau-color-bg': '#09090b',
        'panneau-color-accent-subtle': '#2e2e33',
    },
};

/**
 * The accent as text (`panneau-color-accent-strong`) of a theme that sets the accent but not this
 * token, in each scheme: the accent, darkened (light backgrounds) or lightened (dark ones) until it
 * reaches 4.5:1 on the theme's background, surface and accent subtle background, or those of the
 * default theme, like the text of a tone derived from one color. A light accent, such as a yellow
 * main action, gets a dark text; an accent that is already readable is kept as is.
 *
 * An accent Panneau can't read (a CSS variable of a site) gives `var(--panneau-color-accent)`, the
 * fallback, which `checkTheme()` reports as unchecked. A scheme without a value is left out.
 */
export function deriveAccentStrong(theme: Theme): Partial<Record<'light' | 'dark', string>> {
    const palette = paletteVariables(theme.palette);
    const derive = (scheme: 'light' | 'dark'): string | undefined => {
        const tokens = scheme === 'light' ? theme.tokens : { ...theme.tokens, ...theme.dark };
        const accent = tokens['panneau-color-accent'];
        // A value that getThemeCss() drops, since it could break out of its rule, sets nothing.
        if (tokens[ACCENT_STRONG] !== undefined || accent === undefined || /[{};<]/.test(accent)) {
            return undefined;
        }
        const variables = { ...palette, ...tokens };
        const color = parseColor(resolveReference(accent, variables));
        if (color === null) {
            return 'var(--panneau-color-accent)';
        }
        const read = (name: string, under: Rgb | null): Rgb | null => {
            const fallback = ACCENT_STRONG_BACKGROUNDS[scheme][name] ?? '#ffffff';
            const value = tokens[name];
            return (
                (value !== undefined
                    ? parseColorOver(resolveReference(value, variables), under)
                    : null) ?? parseColor(fallback)
            );
        };
        const surface = read('panneau-color-surface', null);
        const backgrounds = Object.keys(ACCENT_STRONG_BACKGROUNDS[scheme])
            .map((name) => read(name, surface))
            .filter((background): background is Rgb => background !== null);
        // Twice: making the text readable on one background can only help on the others when
        // they are all light or all dark, and the second pass settles the rare remaining case.
        const strong = [...backgrounds, ...backgrounds].reduce(
            (current, background) => ensureContrast(current, background, MIN_CONTRAST_RATIO),
            color,
        );
        return toHex(strong);
    };
    const light = derive('light');
    const dark = derive('dark');
    return {
        ...(light !== undefined && { light }),
        ...(dark !== undefined && { dark }),
    };
}

/**
 * The rules of the densities of a theme. `auto` takes the comfortable values on fine pointers and
 * the touch ones on coarse pointers, like the default theme.
 */
function densityCss(root: string, densities: Theme['densities'] = {}): string {
    const body = (density: Exclude<Density, 'auto'>) => declarations(densities[density] ?? {});
    const rule = (selector: string, css: string) => (css !== '' ? `${selector}{${css}}` : '');
    const media = (query: string, css: string) => (css !== '' ? `@media ${query}{${css}}` : '');
    const selector = (density: Density) => `${root}[data-density="${density}"]`;
    return [
        rule(selector('compact'), body('compact')),
        rule(selector('comfortable'), body('comfortable')),
        media('not (pointer: coarse)', rule(selector('auto'), body('comfortable'))),
        rule(selector('touch'), body('touch')),
        media('(pointer: coarse)', rule(selector('auto'), body('touch'))),
    ].join('');
}

/**
 * The CSS of a theme, scoped to the roots that carry `data-panneau-theme="<scope>"`: its palette and
 * tokens, its densities, its tones and the variants of components. Its rules are more specific than the default
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
    const surfaces = themeSurfaces(theme);
    const accentStrong = deriveAccentStrong(theme);
    light.push(
        rule(
            root,
            declarations({
                ...palette,
                ...theme.tokens,
                ...(accentStrong.light !== undefined && { [ACCENT_STRONG]: accentStrong.light }),
            }),
        ),
    );
    light.push(densityCss(root, theme.densities));
    const darkTokens = {
        ...theme.dark,
        // The light rule applies to the dark scheme too: only a different value is written again.
        ...(accentStrong.dark !== undefined &&
            accentStrong.dark !== accentStrong.light && { [ACCENT_STRONG]: accentStrong.dark }),
    };
    if (Object.keys(darkTokens).length > 0) {
        darkRules.push(rule('§', declarations(darkTokens)));
    }
    Object.entries(theme.tones ?? {})
        .filter(([name]) => NAME.test(name))
        .forEach(([name, input]) => {
            // A tone from a palette color derives from the color itself.
            const values = resolveTone(
                typeof input === 'string' ? resolveReference(input, palette) : input,
                surfaces,
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
