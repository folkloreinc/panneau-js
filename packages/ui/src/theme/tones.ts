import {
    WHITE,
    contrastRatio,
    ensureContrast,
    mixColors,
    parseColor,
    readableTextColor,
    toHex,
} from './color';

/**
 * The tones that components accept (`tone="success"`), like Bootstrap's `$theme-colors`. A theme
 * adds its own; declare them here so that `tone="signal"` type-checks:
 *
 * ```ts
 * declare module '@panneau/ui' {
 *     interface PanneauTones {
 *         signal: true;
 *     }
 * }
 * ```
 */
export interface PanneauTones {
    neutral: true;
    accent: true;
    success: true;
    warning: true;
    danger: true;
    info: true;
}

/** A tone name: a built-in tone, or one declared in `PanneauTones`. */
export type Tone = keyof PanneauTones & string;

/** The tones Panneau defines, from the semantic tokens of the theme. */
export const BUILT_IN_TONES = [
    'neutral',
    'accent',
    'success',
    'warning',
    'danger',
    'info',
] as const;

/** The colors of a tone, as CSS values. */
export type ToneValues = {
    /** Text and icons on surfaces: the outline, subtle and ghost appearances. */
    text: string;
    /** Background of the subtle appearance. */
    subtle: string;
    /** Border of the subtle appearance. */
    border: string;
    /** Border of the outline appearance. */
    outline: string;
    /** Background of the solid appearance. */
    solid: string;
    /** Background of the solid appearance on hover and press. */
    solidHover: string;
    /** Text on the solid appearance. */
    solidText: string;
};

/**
 * A tone of a theme: one color, from which Panneau derives the others (`'#f25c05'`), or every
 * value, with optional overrides for the dark scheme.
 */
export type ToneInput = string | (ToneValues & { dark?: Partial<ToneValues> });

/** The local CSS variables of a tone, which components read. */
export const TONE_VARIABLES: Readonly<Record<keyof ToneValues, string>> = {
    text: 'panneau-tone-text',
    subtle: 'panneau-tone-subtle',
    border: 'panneau-tone-border',
    outline: 'panneau-tone-outline',
    solid: 'panneau-tone-solid',
    solidHover: 'panneau-tone-solid-hover',
    solidText: 'panneau-tone-solid-text',
};

/** The class that applies a tone: `panneau-tone-<tone>`. */
export function toneClassName(tone: string): string {
    return `panneau-tone-${tone}`;
}

/** Surfaces text must be readable on, in each scheme of the default theme. */
const SURFACES = { light: WHITE, dark: { r: 24, g: 24, b: 27 } };

/** How much of the tone's color the subtle background mixes into the surface, per scheme. */
export const SUBTLE_AMOUNTS = { light: 0.12, dark: 0.22 };

/** Text must reach this contrast ratio (WCAG AA for normal text). */
export const MIN_CONTRAST_RATIO = 4.5;

/**
 * The values of a tone, in both schemes, from one color: Panneau's `button-variant()` and
 * `color-contrast()`.
 *
 * - The solid background is the color, with white or black text, whichever reads better, and a
 *   hover 15% darker (or lighter, when the text is black and darker would hurt it).
 * - The text color is the color, darkened (light scheme) or lightened (dark scheme) until it
 *   reaches 4.5:1 against the subtle background, which is tinted, and so against the surface too.
 * - The subtle background and the border are mixed with the surface in CSS, so they follow the
 *   surface of any theme.
 *
 * A color Panneau can't read (a CSS variable, a named color) is used as is, with `color-mix()` for
 * the hover and white text: `checkTheme()` reports it as unchecked.
 */
export function deriveTone(color: string): { light: ToneValues; dark: ToneValues } {
    const subtle = (amount: number) =>
        `color-mix(in srgb, ${color} ${amount}%, var(--panneau-color-surface))`;
    const parsed = parseColor(color);
    if (parsed === null) {
        const values: ToneValues = {
            text: color,
            subtle: subtle(SUBTLE_AMOUNTS.light * 100),
            border: subtle(45),
            outline: color,
            solid: color,
            solidHover: `color-mix(in srgb, ${color}, #000 15%)`,
            solidText: '#fff',
        };
        return { light: values, dark: { ...values, subtle: subtle(SUBTLE_AMOUNTS.dark * 100) } };
    }
    const solidText = readableTextColor(parsed);
    const darker = mixColors(parsed, { r: 0, g: 0, b: 0 }, 0.15);
    const hover =
        contrastRatio(solidText, darker) >= contrastRatio(solidText, parsed)
            ? darker
            : mixColors(parsed, WHITE, 0.15);
    const solid = toHex(parsed);
    const shared = {
        solid,
        solidHover: toHex(hover),
        solidText: toHex(solidText),
    };
    // Readable on the subtle background, which is closer to the text color than the surface.
    const readable = (scheme: 'light' | 'dark') =>
        toHex(
            ensureContrast(
                parsed,
                mixColors(SURFACES[scheme], parsed, SUBTLE_AMOUNTS[scheme]),
                MIN_CONTRAST_RATIO,
            ),
        );
    const light = readable('light');
    const dark = readable('dark');
    return {
        light: {
            ...shared,
            text: light,
            outline: light,
            subtle: subtle(SUBTLE_AMOUNTS.light * 100),
            border: subtle(45),
        },
        dark: {
            ...shared,
            text: dark,
            outline: dark,
            subtle: subtle(SUBTLE_AMOUNTS.dark * 100),
            border: subtle(55),
        },
    };
}

/** The values of a tone input, in both schemes. */
export function resolveTone(input: ToneInput): { light: ToneValues; dark: ToneValues } {
    if (typeof input === 'string') {
        return deriveTone(input);
    }
    const { dark, ...light } = input;
    return { light, dark: { ...light, ...dark } };
}
