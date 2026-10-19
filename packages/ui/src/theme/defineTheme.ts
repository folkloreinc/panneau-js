import { type ComponentTokenName, componentTokens } from './components';
import type { ThemeFont } from './fonts';
import { SEMANTIC_TOKENS, type SemanticTokenName } from './semanticTokens';
import type { Density, Theme } from './theme';
import type { ToneInput } from './tones';

/**
 * Tokens that a project adds, such as those of its own components: declare them here so that
 * `defineTheme()` accepts them.
 *
 * ```ts
 * declare module '@panneau/ui' {
 *     interface PanneauTokens {
 *         'panneau-map-marker-color': true;
 *     }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended by projects
export interface PanneauTokens {}

/** The variable of a palette color: `panneau-palette-orange`. */
export type PaletteTokenName = `panneau-palette-${string}`;

/**
 * The name of a token a theme can set, without the leading `--`: a semantic token, a component
 * token, a palette color, or a token declared in `PanneauTokens`.
 */
export type TokenName =
    SemanticTokenName | ComponentTokenName | PaletteTokenName | (keyof PanneauTokens & string);

/** Values of tokens, keyed by their name: only known names type-check. */
export type ThemeTokens = {
    [Name in SemanticTokenName | ComponentTokenName | (keyof PanneauTokens & string)]?: string;
} & { [Name in PaletteTokenName]?: string };

/** A theme as `defineTheme()` takes it: like `Theme`, with typed tokens and `extends`. */
export interface ThemeDefinition {
    /** A name for theme pickers. */
    label?: string;
    /** Themes this one builds on, in order: its own values override theirs. */
    extends?: Theme | readonly Theme[];
    /** Tokens of the light scheme, or of both schemes when `dark` does not set them. */
    tokens?: ThemeTokens;
    /** Tokens that change in the dark scheme. */
    dark?: ThemeTokens;
    /** Raw colors, used with `var(--panneau-palette-<name>)`. */
    palette?: Record<string, string>;
    /** Tones added or redefined by the theme. Declare added tones in `PanneauTones`. */
    tones?: Record<string, ToneInput>;
    /** Named variants of components. Declare them in `BadgeVariants` (and the like). */
    components?: Record<string, { variants?: Record<string, ThemeTokens> }>;
    /** Tokens of each density, which change with the density of the root. */
    densities?: Partial<Record<Exclude<Density, 'auto'>, ThemeTokens>>;
    /** Font faces and font stylesheets. */
    fonts?: ThemeFont[];
}

function mergeRecords<T>(
    first: Readonly<Record<string, T>> | undefined,
    second: Readonly<Record<string, T>> | undefined,
): Record<string, T> | undefined {
    return first === undefined && second === undefined ? undefined : { ...first, ...second };
}

function mergeComponents(
    first: Theme['components'],
    second: Theme['components'],
): Theme['components'] {
    const components = mergeRecords(first, second);
    if (components === undefined) {
        return undefined;
    }
    return Object.fromEntries(
        Object.keys(components).map((component) => {
            const before = first?.[component];
            const after = second?.[component];
            const variants = mergeRecords(before?.variants, after?.variants);
            return [
                component,
                {
                    ...before,
                    ...after,
                    ...(variants !== undefined && {
                        variants: Object.fromEntries(
                            Object.keys(variants).map((name) => [
                                name,
                                { ...before?.variants?.[name], ...after?.variants?.[name] },
                            ]),
                        ),
                    }),
                },
            ];
        }),
    );
}

const DENSITIES = ['compact', 'comfortable', 'touch'] as const;

function mergeDensities(first: Theme['densities'], second: Theme['densities']): Theme['densities'] {
    if (first === undefined && second === undefined) {
        return undefined;
    }
    const densities = { ...first, ...second };
    DENSITIES.forEach((density) => {
        if (first?.[density] !== undefined && second?.[density] !== undefined) {
            densities[density] = { ...first[density], ...second[density] };
        }
    });
    return densities;
}

function mergeFonts(first: Theme['fonts'], second: Theme['fonts']): Theme['fonts'] {
    if (first === undefined && second === undefined) {
        return undefined;
    }
    const fonts = [...(first ?? []), ...(second ?? [])];
    return fonts.filter(
        (font, index) =>
            fonts.findIndex((other) => JSON.stringify(other) === JSON.stringify(font)) === index,
    );
}

/**
 * Merges themes, in order: each one overrides the tokens, palette colors, tones and variants of
 * those before it. A token a theme sets in `tokens` but not in `dark` applies to both schemes, so it
 * also replaces the dark value of earlier themes. Variants merge token by token; tones are replaced
 * whole; densities merge token by token; fonts add up. The label is the last one set. Same as `mergeThemes()` of `@panneau/protocol`.
 */
export function mergeThemes(...themes: readonly Partial<Theme>[]): Theme {
    return themes.reduce<Theme>(
        (merged, theme) => {
            const tokens = theme.tokens ?? {};
            const dark = mergeRecords(
                merged.dark !== undefined
                    ? Object.fromEntries(
                          Object.entries(merged.dark).filter(
                              ([name]) => !Object.hasOwn(tokens, name),
                          ),
                      )
                    : undefined,
                theme.dark,
            );
            const result: Theme = {
                ...merged,
                ...theme,
                label: theme.label ?? merged.label,
                tokens: { ...merged.tokens, ...tokens },
                dark: dark !== undefined && Object.keys(dark).length > 0 ? dark : undefined,
                palette: mergeRecords(merged.palette, theme.palette),
                tones: mergeRecords(merged.tones, theme.tones),
                components: mergeComponents(merged.components, theme.components),
                densities: mergeDensities(merged.densities, theme.densities),
                fonts: mergeFonts(merged.fonts, theme.fonts),
            };
            return Object.fromEntries(
                Object.entries(result).filter(([, value]) => value !== undefined),
            ) as unknown as Theme;
        },
        { tokens: {} },
    );
}

/** The first segments of the semantic tokens, and the components: names Panneau owns. */
const NAMESPACES = [
    ...new Set([
        ...SEMANTIC_TOKENS.map((name) => name.split('-')[1]),
        ...Object.keys(componentTokens),
        'tone',
    ]),
];

const KNOWN_TOKENS = new Set<string>([
    ...SEMANTIC_TOKENS,
    ...Object.values(componentTokens).flatMap((tokens) => Object.keys(tokens)),
]);

/**
 * Tokens of a theme (in its tokens, dark tokens, densities and variants) that Panneau doesn't know although they are in its namespaces
 * (`panneau-color-*`, `panneau-button-*`…): most likely typos. Tokens of a project's own components
 * are outside these namespaces, and palette colors are always accepted.
 */
export function findUnknownTokens(theme: Theme): string[] {
    const names = [
        ...Object.keys(theme.tokens),
        ...Object.keys(theme.dark ?? {}),
        ...Object.values(theme.densities ?? {}).flatMap((tokens) => Object.keys(tokens)),
        ...Object.values(theme.components ?? {}).flatMap(({ variants = {} }) =>
            Object.values(variants).flatMap((tokens) => Object.keys(tokens)),
        ),
    ];
    return [
        ...new Set(
            names.filter(
                (name) =>
                    !KNOWN_TOKENS.has(name) &&
                    !name.startsWith('panneau-palette-') &&
                    NAMESPACES.some((namespace) => name.startsWith(`panneau-${namespace}-`)),
            ),
        ),
    ];
}

/**
 * Declares a theme: TypeScript checks the names of its tokens, and `extends` builds it on other
 * themes (`bootstrapTheme`, a shared brand theme), whose values its own override. It returns a
 * plain `Theme`, which `PanneauRoot`, plugins and JSON files all take. Tokens that Panneau doesn't
 * know in its own namespaces, most likely typos, are reported in the console.
 *
 * ```ts
 * const brand = defineTheme({
 *     palette: { orange: '#f25c05' },
 *     tokens: { 'panneau-color-accent': 'var(--panneau-palette-orange)' },
 *     tones: { signal: 'var(--panneau-palette-orange)' },
 * });
 * const compact = defineTheme({ extends: brand, tokens: { 'panneau-control-height': '2rem' } });
 * ```
 */
export function defineTheme(definition: ThemeDefinition): Theme {
    const { extends: extended = [], ...own } = definition;
    const bases: readonly Theme[] = Array.isArray(extended) ? extended : [extended as Theme];
    const ownTheme = { ...own, tokens: own.tokens ?? {} } as Theme;
    const theme = mergeThemes(...bases, ownTheme);
    const unknown = findUnknownTokens(ownTheme);
    if (unknown.length > 0) {
        console.warn(
            `[panneau] Unknown tokens in theme${theme.label !== undefined ? ` "${theme.label}"` : ''}: ${unknown.join(', ')}.`,
        );
    }
    return theme;
}
