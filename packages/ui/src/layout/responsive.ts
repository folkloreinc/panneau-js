import type { CSSProperties } from 'react';

/**
 * Breakpoints of the layout primitives, like Bootstrap's `$grid-breakpoints`: the minimum width of
 * the nearest container at which a responsive value applies. They are constants, since CSS
 * variables can't be used in queries; the stylesheets of the primitives use the same values.
 */
export const BREAKPOINTS = Object.freeze({
    sm: '40rem',
    md: '48rem',
    lg: '64rem',
    xl: '80rem',
});

/** A breakpoint: `sm`, `md`, `lg` or `xl`. */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * A value, or values by breakpoint: `{ base: 1, md: 2, lg: 3 }`. Each value applies from its
 * breakpoint up, until a larger one sets another. Breakpoints are widths of the nearest container
 * (`PanneauRoot`, `Container`, a form, a list), not of the viewport, so that a grid in a narrow
 * sidebar behaves as on a phone.
 */
export type Responsive<T> = T | Partial<Record<'base' | Breakpoint, T>>;

/** A step of the space scale of the theme (`--panneau-space-<step>`), or 0. */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

/** The CSS value of a step of the space scale. */
export function space(step: Space): string {
    return step === 0 ? '0' : `var(--panneau-space-${step})`;
}

const KEYS = ['base', ...(Object.keys(BREAKPOINTS) as Breakpoint[])] as const;

function isByBreakpoint<T>(value: Responsive<T>): value is Partial<Record<'base' | Breakpoint, T>> {
    return typeof value === 'object' && value !== null;
}

/**
 * The inline variables of a responsive prop, `--_panneau-<component>-<prop>-<breakpoint>`, which
 * the static rules of the component read in each container query. Unset breakpoints fall back to
 * smaller ones in CSS.
 */
export function responsiveVariables<T>(
    component: string,
    prop: string,
    value: Responsive<T> | undefined,
    toCss: (value: T) => string,
): Record<string, string> {
    if (value === undefined) {
        return {};
    }
    const values: Partial<Record<'base' | Breakpoint, T>> = isByBreakpoint(value)
        ? value
        : { base: value };
    return Object.fromEntries(
        KEYS.flatMap((key) => {
            const item = values[key];
            return item !== undefined
                ? [[`--_panneau-${component}-${prop}-${key}`, toCss(item)]]
                : [];
        }),
    );
}

/** Merges inline variables with the `style` prop, which wins. */
export function withVariables(
    variables: Record<string, string>[],
    style: CSSProperties | undefined,
): CSSProperties | undefined {
    const merged = Object.assign({}, ...variables) as Record<string, string>;
    return Object.keys(merged).length > 0 ? { ...merged, ...style } : style;
}

/** How the primitives distribute items along their axis: `between` is `space-between`. */
export type Justification = 'start' | 'center' | 'end' | 'between';

/** The CSS value of a justification. */
export function justification(value: Justification): string {
    return value === 'between' ? 'space-between' : value;
}
