import { type Rgb, WHITE, contrastRatio, mixColors, parseColor } from './color';
import { type ColorDifferenceCheck, checkColorDifferences } from './colorVision';
import { type Theme, paletteVariables, resolveReference, themeSurfaces } from './theme';
import { MIN_CONTRAST_RATIO, SUBTLE_AMOUNTS, resolveTone } from './tones';

/** A pair of colors that a theme must keep readable. */
export interface ThemeContrastCheck {
    scheme: 'light' | 'dark';
    /** What is checked: `tone signal: text on surface`, `tokens: text on bg`. */
    name: string;
    foreground: string;
    background: string;
    /** The contrast ratio, or `null` when a color can't be read (a CSS variable, `color-mix()`). */
    ratio: number | null;
    minimum: number;
}

export interface ThemeReport {
    /** Every pair checked. */
    checks: ThemeContrastCheck[];
    /** Pairs below their minimum ratio. */
    failures: ThemeContrastCheck[];
    /** Pairs with a color Panneau can't read: check them in a browser. */
    unchecked: ThemeContrastCheck[];
    /**
     * Categorical chart colors of the theme that look too alike, for typical vision or with a
     * color vision deficiency.
     */
    colorDifferences: (ColorDifferenceCheck & { scheme: 'light' | 'dark' })[];
}

/** Surfaces of the default theme, used when a theme doesn't set its own. */
const DEFAULT_SURFACES: Record<'light' | 'dark', Rgb> = {
    light: WHITE,
    dark: { r: 24, g: 24, b: 27 },
};

/** Chart colors that must stand out from the surface: series, the high step and diverging ends. */
const CHART_TOKENS = [
    ...Array.from({ length: 8 }, (_, index) => `panneau-chart-categorical-${index + 1}`),
    'panneau-chart-sequential-5',
    'panneau-chart-diverging-negative',
    'panneau-chart-diverging-positive',
];

/** Non-text elements (borders of controls, outlines) need 3:1 (WCAG 2 non-text contrast). */
const MIN_NON_TEXT_RATIO = 3;

const TOKEN_PAIRS: [name: string, foreground: string, background: string, minimum: number][] = [
    ['text on bg', 'panneau-color-text', 'panneau-color-bg', MIN_CONTRAST_RATIO],
    ['text on surface', 'panneau-color-text', 'panneau-color-surface', MIN_CONTRAST_RATIO],
    [
        'muted text on surface',
        'panneau-color-text-muted',
        'panneau-color-surface',
        MIN_CONTRAST_RATIO,
    ],
    ['link on surface', 'panneau-color-link', 'panneau-color-surface', MIN_CONTRAST_RATIO],
    [
        'accent text on accent',
        'panneau-color-accent-text',
        'panneau-color-accent',
        MIN_CONTRAST_RATIO,
    ],
    [
        'control border on surface',
        'panneau-color-border-control',
        'panneau-color-surface',
        MIN_NON_TEXT_RATIO,
    ],
];

/**
 * Checks the contrast of a theme, like Bootstrap's `$min-contrast-ratio`, but as a report: text
 * tokens against backgrounds (4.5:1), control borders (3:1), and every tone of the theme (its text
 * on the surface, its solid text on the solid background and its hover), and chart colors (3:1
 * against the surface, and categorical colors distinct with color vision deficiencies). Pairs where a color comes
 * from the default theme and is not set by the theme are skipped, except the surface, which falls
 * back to the default one. Values that refer to the theme's palette or tokens with `var()` are
 * checked as what they refer to; colors Panneau can't read are listed as unchecked.
 */
export function checkTheme(theme: Theme): ThemeReport {
    const checks: ThemeContrastCheck[] = [];
    const colorDifferences: ThemeReport['colorDifferences'] = [];
    const palette = paletteVariables(theme.palette);
    const surfaces = themeSurfaces(theme);
    (['light', 'dark'] as const).forEach((scheme) => {
        const variables = {
            ...palette,
            ...theme.tokens,
            ...(scheme === 'dark' ? theme.dark : undefined),
        };
        const tokens = Object.fromEntries(
            Object.entries(variables).map(([name, value]) => [
                name,
                resolveReference(value, variables),
            ]),
        );
        const surface = tokens['panneau-color-surface'];
        const surfaceColor = surface !== undefined ? parseColor(surface) : DEFAULT_SURFACES[scheme];
        const add = (
            name: string,
            foreground: string,
            background: string,
            minimum: number,
            backgroundColor: Rgb | null = parseColor(background),
        ) => {
            const foregroundColor = parseColor(foreground);
            checks.push({
                scheme,
                name,
                foreground,
                background,
                ratio:
                    foregroundColor !== null && backgroundColor !== null
                        ? Math.round(contrastRatio(foregroundColor, backgroundColor) * 100) / 100
                        : null,
                minimum,
            });
        };
        TOKEN_PAIRS.forEach(([name, foreground, background, minimum]) => {
            const foregroundValue = tokens[foreground];
            const backgroundValue = tokens[background];
            if (foregroundValue !== undefined && backgroundValue !== undefined) {
                add(`tokens: ${name}`, foregroundValue, backgroundValue, minimum);
            }
        });
        // Chart colors are graphics: 3:1 against the surface, and distinct from each other.
        const surfaceValue = surface ?? (scheme === 'light' ? '#ffffff' : '#18181b');
        CHART_TOKENS.forEach((token) => {
            const value = tokens[token];
            if (value !== undefined) {
                add(
                    `chart: ${token.replace('panneau-chart-', '')} on surface`,
                    value,
                    surfaceValue,
                    MIN_NON_TEXT_RATIO,
                    surfaceColor,
                );
            }
        });
        const categorical = CHART_TOKENS.filter((token) => token.includes('categorical')).flatMap(
            (token) => (tokens[token] !== undefined ? [tokens[token]] : []),
        );
        colorDifferences.push(
            ...checkColorDifferences(categorical).map((check) => ({ ...check, scheme })),
        );
        Object.entries(theme.tones ?? {}).forEach(([tone, toneInput]) => {
            const input =
                typeof toneInput === 'string' ? resolveReference(toneInput, palette) : toneInput;
            const values = resolveTone(input, surfaces)[scheme];
            add(
                `tone ${tone}: text on surface`,
                values.text,
                surface ?? (scheme === 'light' ? '#ffffff' : '#18181b'),
                MIN_CONTRAST_RATIO,
                surfaceColor,
            );
            // The subtle background of a tone is often mixed with the surface in CSS: compute it
            // against the surface of the scheme when it can't be read directly.
            const color = typeof input === 'string' ? parseColor(input) : null;
            const subtleColor =
                parseColor(values.subtle) ??
                (color !== null && surfaceColor !== null
                    ? mixColors(surfaceColor, color, SUBTLE_AMOUNTS[scheme])
                    : null);
            add(
                `tone ${tone}: text on subtle`,
                values.text,
                values.subtle,
                MIN_CONTRAST_RATIO,
                subtleColor,
            );
            add(
                `tone ${tone}: solid text on solid`,
                values.solidText,
                values.solid,
                MIN_CONTRAST_RATIO,
            );
            add(
                `tone ${tone}: solid text on hover`,
                values.solidText,
                values.solidHover,
                MIN_CONTRAST_RATIO,
            );
        });
    });
    return {
        checks,
        failures: checks.filter((check) => check.ratio !== null && check.ratio < check.minimum),
        unchecked: checks.filter((check) => check.ratio === null),
        colorDifferences,
    };
}
