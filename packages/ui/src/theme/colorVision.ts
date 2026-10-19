import { type Rgb, parseColor } from './color';

/** A color vision deficiency, at full severity: red-blind, green-blind or blue-blind. */
export type ColorVisionDeficiency = 'protanopia' | 'deuteranopia' | 'tritanopia';

/** Simulation matrices of Machado, Oliveira and Fernandes (2009), severity 1, on linear RGB. */
const MATRICES: Record<ColorVisionDeficiency, readonly (readonly number[])[]> = {
    protanopia: [
        [0.152286, 1.052583, -0.204868],
        [0.114503, 0.786281, 0.099216],
        [-0.003882, -0.048116, 1.051998],
    ],
    deuteranopia: [
        [0.367322, 0.860646, -0.227968],
        [0.280085, 0.672501, 0.047413],
        [-0.01182, 0.04294, 0.968881],
    ],
    tritanopia: [
        [1.255528, -0.076749, -0.178779],
        [-0.078411, 0.930809, 0.147602],
        [0.004733, 0.691367, 0.3039],
    ],
};

const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    return (clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055) * 255;
};

/** A color as a person with a color vision deficiency sees it. */
export function simulateColorVision(color: Rgb, deficiency: ColorVisionDeficiency): Rgb {
    const linear = [toLinear(color.r), toLinear(color.g), toLinear(color.b)];
    const [r = 0, g = 0, b = 0] = MATRICES[deficiency].map((row) =>
        fromLinear(row.reduce((sum, weight, index) => sum + weight * (linear[index] ?? 0), 0)),
    );
    return { r, g, b };
}

function toLab(color: Rgb): [number, number, number] {
    const [r, g, b] = [toLinear(color.r), toLinear(color.g), toLinear(color.b)];
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
    const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
    const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** The perceived difference between two colors: the CIE76 distance in CIELAB. */
export function colorDifference(first: Rgb, second: Rgb): number {
    const [l1, a1, b1] = toLab(first);
    const [l2, a2, b2] = toLab(second);
    return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** Two colors of a palette that look too alike, for everyone or with a deficiency. */
export interface ColorDifferenceCheck {
    vision: 'typical' | ColorVisionDeficiency;
    first: string;
    second: string;
    difference: number;
    minimum: number;
}

/**
 * Checks that the colors of a palette (the categorical colors of charts) stay distinct, for
 * typical vision and under protanopia, deuteranopia and tritanopia: every pair must differ by at
 * least `minimum` (CIE76, 10 by default, a difference anyone notices side by side). Colors Panneau
 * can't read are skipped. Returns the pairs below the minimum.
 */
export function checkColorDifferences(
    colors: readonly string[],
    minimum = 10,
): ColorDifferenceCheck[] {
    const parsed = colors.flatMap((color) => {
        const rgb = parseColor(color);
        return rgb !== null ? [{ color, rgb }] : [];
    });
    const visions = ['typical', 'protanopia', 'deuteranopia', 'tritanopia'] as const;
    return visions.flatMap((vision) => {
        const seen = parsed.map(({ color, rgb }) => ({
            color,
            rgb: vision === 'typical' ? rgb : simulateColorVision(rgb, vision),
        }));
        return seen.flatMap((first, index) =>
            seen.slice(index + 1).flatMap((second) => {
                const difference = Math.round(colorDifference(first.rgb, second.rgb) * 10) / 10;
                return difference < minimum
                    ? [{ vision, first: first.color, second: second.color, difference, minimum }]
                    : [];
            }),
        );
    });
}
