/** An sRGB color, with channels from 0 to 255. */
export interface Rgb {
    r: number;
    g: number;
    b: number;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB =
    /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i;

/**
 * Reads a hex (`#05f`, `#0055ff`) or `rgb()` color. Returns `null` for anything else (a CSS
 * variable, a named color, `color-mix()`), which Panneau can't compute with.
 */
export function parseColor(value: string): Rgb | null {
    const color = value.trim();
    const hex = HEX.exec(color);
    if (hex?.[1] !== undefined) {
        const digits =
            hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1];
        return {
            r: Number.parseInt(digits.slice(0, 2), 16),
            g: Number.parseInt(digits.slice(2, 4), 16),
            b: Number.parseInt(digits.slice(4, 6), 16),
        };
    }
    const rgb = RGB.exec(color);
    if (rgb !== null) {
        const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map((channel) =>
            Math.min(255, Math.max(0, Number(channel))),
        );
        return { r: r ?? 0, g: g ?? 0, b: b ?? 0 };
    }
    return null;
}

const HEX_ALPHA = /^#([0-9a-f]{4}|[0-9a-f]{8})$/i;
const ALPHA = /^rgba?\(.*[,/]\s*([\d.]+)(%?)\s*\)$/i;

/**
 * Reads a color like `parseColor()`, with its opacity: `rgb(0 0 0 / 0.45)`, `rgba(0, 0, 0, 45%)`,
 * `#00000073`. The opacity is 1 for opaque colors.
 */
export function parseColorWithAlpha(value: string): { color: Rgb; alpha: number } | null {
    const color = value.trim();
    const hex = HEX_ALPHA.exec(color);
    if (hex?.[1] !== undefined) {
        const digits =
            hex[1].length === 4 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1];
        const rgb = parseColor(`#${digits.slice(0, 6)}`);
        return rgb !== null
            ? { color: rgb, alpha: Number.parseInt(digits.slice(6, 8), 16) / 255 }
            : null;
    }
    const rgb = parseColor(color);
    if (rgb === null) {
        return null;
    }
    const alpha = ALPHA.exec(color);
    if (alpha?.[1] === undefined) {
        return { color: rgb, alpha: 1 };
    }
    const amount = Number(alpha[1]) / (alpha[2] === '%' ? 100 : 1);
    return { color: rgb, alpha: Math.min(1, Math.max(0, amount)) };
}

/**
 * Reads a color as it shows over another one: a translucent color is blended with what is under
 * it. Returns `null` for a color Panneau can't read, or a translucent one over an unknown color.
 */
export function parseColorOver(value: string, under: Rgb | null): Rgb | null {
    const parsed = parseColorWithAlpha(value);
    if (parsed === null) {
        return null;
    }
    if (parsed.alpha >= 1) {
        return parsed.color;
    }
    return under !== null ? mixColors(under, parsed.color, parsed.alpha) : null;
}

/** A color as `#rrggbb`. */
export function toHex({ r, g, b }: Rgb): string {
    return `#${[r, g, b]
        .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
        .join('')}`;
}

/** Mixes two colors in sRGB, like `color-mix(in srgb, a, b <amount>)`: 0 gives `a`, 1 gives `b`. */
export function mixColors(a: Rgb, b: Rgb, amount: number): Rgb {
    return {
        r: a.r + (b.r - a.r) * amount,
        g: a.g + (b.g - a.g) * amount,
        b: a.b + (b.b - a.b) * amount,
    };
}

function linear(channel: number): number {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance, as defined by WCAG 2. */
export function luminance({ r, g, b }: Rgb): number {
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Contrast ratio between two colors, from 1 to 21 (WCAG 2). */
export function contrastRatio(a: Rgb, b: Rgb): number {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (light + 0.05) / (dark + 0.05);
}

export const WHITE: Rgb = { r: 255, g: 255, b: 255 };
export const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/**
 * The closest color to `color` that reaches `ratio` against `background`, by mixing it with black
 * or white (whichever moves away from the background), like Bootstrap's shade and tint. Returns
 * the color itself when it already passes.
 */
export function ensureContrast(color: Rgb, background: Rgb, ratio: number): Rgb {
    if (contrastRatio(color, background) >= ratio) {
        return color;
    }
    const target = luminance(background) > 0.18 ? BLACK : WHITE;
    for (let step = 1; step <= 20; step += 1) {
        const mixed = mixColors(color, target, step / 20);
        if (contrastRatio(mixed, background) >= ratio) {
            return mixed;
        }
    }
    return target;
}

/** White or black, whichever reads better on `background`, like Bootstrap's `color-contrast()`. */
export function readableTextColor(background: Rgb): Rgb {
    return contrastRatio(WHITE, background) >= contrastRatio(BLACK, background) ? WHITE : BLACK;
}
